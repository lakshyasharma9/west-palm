# 🚀 Complete Startup Guide - West Palm System

## ⚠️ IMPORTANT: Start in Correct Order!

### Step 1: Start Backend (FIRST!)
```bash
cd Backend
npm start
```

**Wait for:**
```
✅ Ready to accept requests!
```

**Backend runs on:** http://localhost:3001

---

### Step 2: Start Admin Panel
```bash
cd wpcs-admin-panel
npm run dev
```

**Admin Panel runs on:** http://localhost:8080

---

### Step 3: Start Frontend
```bash
cd Frontend
npm run dev
```

**Frontend runs on:** http://localhost:3000

---

## ✅ System Check

### Backend Health Check:
Open: http://localhost:3001/health

Should see:
```json
{
  "success": true,
  "message": "WPCS Backend is running!"
}
```

### Admin Panel Check:
Open: http://localhost:8080

Should see login page ✅

### Frontend Check:
Open: http://localhost:3000

Should see homepage ✅

---

## 🎯 Quick Test - News Feature

### 1. Create News Item:
1. Login to admin panel: http://localhost:8080
2. Go to: `/admin/news`
3. Click "Create News"
4. Fill:
   - Type: News
   - Title: "Test News Item"
   - Excerpt: "This is a test news item"
   - Content: "Full content here"
5. Click "Publish Now"

### 2. View on Frontend:
1. Homepage: http://localhost:3000
   - Should see ticker below hero ✅
2. About page: http://localhost:3000/about
   - Should see carousel ✅

---

## 🚨 Common Errors & Fixes

### Error: "ECONNREFUSED"
**Cause:** Backend not running
**Fix:** Start backend first (Step 1)

### Error: "params is a Promise"
**Status:** ✅ FIXED in newsletter page

### Error: "Cannot find module"
**Fix:** 
```bash
npm install
```

### Error: "Port already in use"
**Fix:**
```bash
# Kill process on port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in .env
```

---

## 📊 System Status

### ✅ Completed Features:
- [x] Backend API (all routes)
- [x] DynamoDB tables
- [x] Admin Panel (all pages)
- [x] Newsletter system
- [x] News/Events system
- [x] Frontend components
- [x] News Ticker
- [x] News Carousel

### 🎯 Ready to Use:
- Projects management
- Queries management
- Newsletter management
- News/Events management
- Contact form
- File uploads

---

## 🔗 Quick Links

### Admin Panel:
- Dashboard: http://localhost:8080
- Projects: http://localhost:8080/admin/projects
- Queries: http://localhost:8080/admin/queries
- Newsletters: http://localhost:8080/admin/newsletters
- News: http://localhost:8080/admin/news

### Frontend:
- Home: http://localhost:3000
- About: http://localhost:3000/about
- Services: http://localhost:3000/services
- Projects: http://localhost:3000/projects
- Newsletter: http://localhost:3000/newsletter
- Contact: http://localhost:3000/contact

### API:
- Health: http://localhost:3001/health
- Projects: http://localhost:3001/api/projects
- Newsletters: http://localhost:3001/api/newsletters
- News: http://localhost:3001/api/news

---

## 📝 Environment Variables

### Backend (.env):
```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

DYNAMODB_QUERIES_TABLE=wpcs-queries
DYNAMODB_ADMIN_TABLE=wpcs-admin-users
DYNAMODB_PROJECTS_TABLE=wpcs-projects
DYNAMODB_NEWSLETTERS_TABLE=wpcs-newsletters
DYNAMODB_NEWS_TABLE=wpcs-news

S3_BUCKET_NAME=west-palm-files

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

PORT=3001
```

### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_S3_BUCKET_URL=https://west-palm-files.s3.eu-north-1.amazonaws.com
```

---

## 🎉 You're All Set!

All systems are ready to use. Start creating content!

**Documentation:**
- News Feature: `NEWS_IMPLEMENTATION_COMPLETE.md`
- Newsletter Feature: `NEWSLETTER_COMPLETE_SETUP.md`
- Quick Start: `NEWS_QUICK_START.md`

---

## 📞 Need Help?

1. Check backend is running (Step 1)
2. Check browser console (F12)
3. Check backend terminal for errors
4. Verify environment variables

**Happy Building! 🚀**
