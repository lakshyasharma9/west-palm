# 🏗️ WPCS Backend - Serverless Architecture

Production-ready serverless backend for West Palm Construction Solutions using AWS Lambda, API Gateway, and DynamoDB.

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Testing](#testing)
- [Security](#security)

---

## 🏛️ Architecture

```
Frontend/Admin Panel
        ↓
   API Gateway (REST API)
        ↓
   AWS Lambda Functions
        ↓
   ┌─────────┬─────────┐
   ↓         ↓         ↓
DynamoDB    S3      CloudWatch
(Database) (Files)   (Logs)
```

**Serverless Benefits:**
- ✅ Auto-scaling
- ✅ Pay per request
- ✅ No server management
- ✅ High availability
- ✅ AWS Free Tier eligible

---

## ✨ Features

### Public Endpoints
- 📝 Contact form submission
- 📎 File attachment support (PDF, ZIP, DOCX)
- ✉️ Automatic query storage

### Admin Endpoints (Protected)
- 🔐 JWT-based authentication
- 📊 View all queries
- 🔍 Filter by status (pending/resolved)
- ✏️ Update query status
- 🗑️ Delete queries
- 🔑 Change admin credentials

### Security
- 🛡️ Password hashing (bcrypt)
- 🔒 JWT token authentication
- 🚫 CORS protection
- ✅ Input validation & sanitization
- 📝 Request logging

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18.x/20.x
- **Cloud**: AWS (Lambda, API Gateway, DynamoDB, S3)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Database**: DynamoDB (NoSQL)
- **Storage**: S3
- **Monitoring**: CloudWatch

---

## 📁 Project Structure

```
Backend/
├── lambda-functions/          # Individual Lambda functions
│   ├── contact-form/          # POST /contact
│   ├── admin-auth/            # POST /auth/login
│   ├── queries-list/          # GET /queries
│   ├── queries-get/           # GET /queries/{id}
│   ├── queries-update/        # PATCH /queries/{id}
│   └── queries-delete/        # DELETE /queries/{id}
│
├── shared/                    # Shared utilities
│   ├── db-helper.js           # DynamoDB operations
│   ├── auth-helper.js         # JWT & password handling
│   ├── s3-helper.js           # S3 file operations
│   └── utils.js               # Common utilities
│
├── scripts/                   # Utility scripts
│   └── create-admin-user.js   # Create initial admin
│
├── .env                       # Environment variables
├── .env.example               # Environment template
├── package.json               # Dependencies
├── DEPLOYMENT_GUIDE.md        # Deployment instructions
└── README.md                  # This file
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env` with your AWS credentials and configuration.

### 3. Create Admin User

```bash
npm run create-admin
```

**Default Credentials:**
- Email: `admin@wpcs.com`
- Password: `wpcs@2024`

### 4. Deploy to AWS

Follow the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

---

## 🌐 API Endpoints

### Base URL
```
https://YOUR_API_ID.execute-api.eu-north-1.amazonaws.com/prod
```

### Public Endpoints

#### Submit Contact Form
```http
POST /contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "ABC Corp",
  "service": ["BIM MEPF", "Estimation"],
  "message": "Project inquiry...",
  "attachment": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Query submitted successfully",
  "data": {
    "id": "uuid-here",
    "message": "Your inquiry has been submitted successfully..."
  }
}
```

### Authentication

#### Admin Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@wpcs.com",
  "password": "wpcs@2024"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "email": "admin@wpcs.com",
      "lastLogin": "2025-01-27T10:30:00Z"
    }
  }
}
```

### Protected Endpoints (Require JWT Token)

**Authorization Header:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All Queries
```http
GET /queries
GET /queries?status=pending
```

#### Get Single Query
```http
GET /queries/{id}
```

#### Update Query Status
```http
PATCH /queries/{id}
Content-Type: application/json

{
  "status": "resolved"
}
```

#### Delete Query
```http
DELETE /queries/{id}
```

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_REGION` | AWS region | `eu-north-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAXXXXXXXX` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `xxxxxxxxxxxxx` |
| `DYNAMODB_QUERIES_TABLE` | Queries table name | `wpcs-queries` |
| `DYNAMODB_ADMIN_TABLE` | Admin users table | `wpcs-admin-users` |
| `S3_BUCKET_NAME` | S3 bucket name | `west-palm-files` |
| `S3_UPLOAD_FOLDER` | Upload folder path | `attachments` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |
| `ADMIN_PANEL_URL` | Admin panel URL | `http://localhost:8080` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `26214400` (25MB) |
| `ALLOWED_FILE_TYPES` | Allowed extensions | `.pdf,.zip,.docx` |

---

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

**Quick Deploy Checklist:**
1. ✅ Create DynamoDB tables
2. ✅ Create S3 bucket
3. ✅ Create IAM user with permissions
4. ✅ Deploy Lambda functions
5. ✅ Setup API Gateway
6. ✅ Create admin user
7. ✅ Test endpoints

---

## 🧪 Testing

### Test Contact Form
```bash
curl -X POST https://YOUR_API_URL/prod/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Co",
    "service": ["BIM MEPF"],
    "message": "Test message"
  }'
```

### Test Admin Login
```bash
curl -X POST https://YOUR_API_URL/prod/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wpcs.com",
    "password": "wpcs@2024"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET https://YOUR_API_URL/prod/queries \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔒 Security

### Implemented Security Measures

1. **Authentication**
   - JWT-based token authentication
   - Bcrypt password hashing (10 rounds)
   - Token expiration (7 days default)

2. **Input Validation**
   - Required field validation
   - Email format validation
   - File type validation
   - File size limits

3. **Data Protection**
   - Input sanitization
   - SQL injection prevention (NoSQL)
   - XSS protection

4. **API Security**
   - CORS configuration
   - Rate limiting (API Gateway)
   - Request/response logging

5. **AWS Security**
   - IAM role-based access
   - Private S3 bucket
   - Encrypted environment variables

### Security Best Practices

- ✅ Never commit `.env` file
- ✅ Rotate AWS keys regularly
- ✅ Use strong JWT secret in production
- ✅ Enable CloudWatch alarms
- ✅ Monitor API Gateway logs
- ✅ Use AWS WAF for additional protection

---

## 📊 Monitoring

### CloudWatch Logs

Each Lambda function logs to CloudWatch:
- `/aws/lambda/wpcs-contact-form`
- `/aws/lambda/wpcs-admin-auth`
- `/aws/lambda/wpcs-queries-list`
- etc.

### Metrics to Monitor

- Lambda invocations
- Error rates
- Duration/latency
- DynamoDB read/write units
- API Gateway requests
- S3 storage usage

---

## 💰 Cost Estimation

**AWS Free Tier (First 12 months):**
- Lambda: 1M requests/month FREE
- DynamoDB: 25GB + 25 RCU/WCU FREE
- API Gateway: 1M calls/month FREE
- S3: 5GB storage FREE

**Expected Monthly Cost (after free tier):**
- Low traffic (100 queries/month): ~$0-2
- Medium traffic (1000 queries/month): ~$5-10
- High traffic (10000 queries/month): ~$20-50

---

## 🆘 Troubleshooting

### Common Issues

**1. "Internal Server Error"**
- Check CloudWatch logs
- Verify environment variables
- Check IAM permissions

**2. "CORS Error"**
- Enable CORS in API Gateway
- Redeploy API after changes
- Check allowed origins

**3. "Unauthorized"**
- Verify JWT token is valid
- Check Authorization header format
- Ensure token hasn't expired

**4. "Table Not Found"**
- Verify DynamoDB table names
- Check AWS region
- Verify IAM permissions

---

## 📝 License

MIT License - WPCS © 2025

---

## 👨‍💻 Support

For issues or questions:
1. Check CloudWatch logs
2. Review DEPLOYMENT_GUIDE.md
3. Verify AWS permissions
4. Test with curl commands

---

**Built with ❤️ for West Palm Construction Solutions**
