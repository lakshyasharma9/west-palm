#!/bin/bash
# ============================================
# West Palm Construction Services - EC2 Deploy Script
# Usage: bash deploy.sh [--setup]
# ============================================

set -e

APP_DIR="/home/ubuntu/west-palm"
LOG_DIR="/home/ubuntu/logs"
REPO_URL="https://github.com/lakshyasharma9/west-palm.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ============================================
# FIRST TIME SETUP
# ============================================
if [ "$1" == "--setup" ]; then
    log "🚀 First time setup starting..."
    
    # Update system
    log "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    # Install Node.js 20
    log "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install PM2
    log "Installing PM2..."
    sudo npm install -g pm2
    
    # Install Nginx + Certbot
    log "Installing Nginx + Certbot..."
    sudo apt install -y nginx certbot python3-certbot-nginx git
    
    # Create swap (critical for t3.micro)
    log "Creating 1GB swap file..."
    if [ ! -f /swapfile ]; then
        sudo fallocate -l 1G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
    
    # Create log directory
    mkdir -p $LOG_DIR
    
    # Clone repo
    if [ ! -d "$APP_DIR" ]; then
        log "Cloning repository..."
        git clone $REPO_URL $APP_DIR
    fi
    
    log "✅ Setup complete! Now run: bash deploy.sh"
    exit 0
fi

# ============================================
# DEPLOY (subsequent runs)
# ============================================
log "🚀 Starting deployment..."

# Navigate to app
cd $APP_DIR || error "App directory not found. Run: bash deploy.sh --setup"

# Pull latest code
log "Pulling latest code..."
git pull origin main

# ============================================
# BACKEND
# ============================================
log "📦 Installing Backend dependencies..."
cd $APP_DIR/Backend
npm ci --production

# ============================================
# FRONTEND (Next.js)
# ============================================
log "📦 Building Frontend..."
cd $APP_DIR/Frontend
npm ci
npm run build

# ============================================
# ADMIN PANEL (TanStack Start SSR - Node server)
# ============================================
log "📦 Building Admin Panel..."
cd $APP_DIR/wpcs-admin-panel
npm ci
NODE_OPTIONS="--max-old-space-size=1024" npm run build

# ============================================
# NGINX CONFIG
# ============================================
log "🔧 Configuring Nginx..."
sudo cp $APP_DIR/nginx.conf /etc/nginx/sites-available/westpalmcs
sudo ln -sf /etc/nginx/sites-available/westpalmcs /etc/nginx/sites-enabled/westpalmcs
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# ============================================
# PM2 RESTART
# ============================================
log "🔄 Restarting services with PM2..."
cd $APP_DIR
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

# ============================================
# HEALTH CHECK
# ============================================
log "🏥 Running health check..."
sleep 3
if curl -s http://localhost:3001/health | grep -q "success"; then
    log "✅ Backend: HEALTHY"
else
    warn "⚠️  Backend health check failed — check logs: pm2 logs wpcs-backend"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Frontend: HEALTHY"
else
    warn "⚠️  Frontend may still be starting... check: pm2 logs wpcs-frontend"
fi

log ""
log "============================================"
log "🎉 DEPLOYMENT COMPLETE!"
log "============================================"
log "Backend:  http://localhost:3001"
log "Frontend: http://localhost:3000"
log "Admin:    Served via Nginx (static)"
log ""
log "Next steps:"
log "  1. Ensure Backend/.env has production secrets"
log "  2. Run: sudo certbot --nginx -d westpalmcs.com -d www.westpalmcs.com -d api.westpalmcs.com -d admin.westpalmcs.com"
log "  3. Set up PM2 startup: pm2 startup && pm2 save"
log "============================================"
