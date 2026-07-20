# Customer Login & Project Dashboard - Deployment Guide

## Overview
This guide covers the complete deployment of the Customer Portal feature with dual-role authentication (Admin + Customer).

## Architecture
- **Admin Users** → Admin Panel (existing)
- **Customer Users** → Customer Dashboard (new)
- **Shared Login** → Role-based routing

---

## STEP 1: Backend Setup

### 1.1 Create DynamoDB Table
```bash
cd Backend
node scripts/create-customer-users-table.js
```

This creates the `wpcs-customer-users` table with:
- Primary Key: `customerId`
- Global Secondary Index: `username-index`
- Attributes: username, password, email, companyName, oneDriveLink, projectStatusSheetUrl, projectIds, role, createdAt, lastLogin

### 1.2 Update Projects Table
Add `customerId` field to existing projects when assigning to customers (handled automatically by the API).

### 1.3 Install Lambda Dependencies
```bash
# Customer Auth
cd lambda-functions/customer-auth
npm install

# Customer Account Create
cd ../customer-account-create
npm install

# Customer Account Update
cd ../customer-account-update
npm install

# Return to Backend root
cd ../..
```

### 1.4 Deploy Lambda Functions
Deploy these 6 new Lambda functions to AWS:

1. **customer-auth** - Customer login authentication
2. **customer-projects** - Get projects for logged-in customer
3. **customer-account-create** - Admin creates customer accounts
4. **customer-accounts-list** - Admin lists all customers
5. **customer-account-update** - Admin updates customer accounts
6. **customer-account-delete** - Admin deletes customer accounts

**Deployment Steps:**
```bash
# For each Lambda function, create a deployment package
cd lambda-functions/customer-auth
zip -r customer-auth.zip . -x "*.git*" "node_modules/aws-sdk/*"

# Upload to AWS Lambda via AWS Console or CLI
aws lambda create-function \
  --function-name wpcs-customer-auth \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://customer-auth.zip \
  --environment Variables="{JWT_SECRET=your-secret,DYNAMODB_TABLE=wpcs-customer-users}"
```

Repeat for all 6 Lambda functions.

### 1.5 Update API Gateway
Add these routes to your API Gateway:

**Customer Routes:**
- `POST /api/customer/login` → customer-auth Lambda
- `GET /api/customer/projects` → customer-projects Lambda

**Admin Customer Management Routes:**
- `POST /api/admin/customers` → customer-account-create Lambda
- `GET /api/admin/customers` → customer-accounts-list Lambda
- `PUT /api/admin/customers/{id}` → customer-account-update Lambda
- `DELETE /api/admin/customers/{id}` → customer-account-delete Lambda

### 1.6 Start Backend Server
```bash
cd Backend
npm start
```

The server now includes all customer routes.

---

## STEP 2: Frontend Setup

### 2.1 Install Dependencies
```bash
cd wpcs-admin-panel
npm install @radix-ui/react-checkbox
```

### 2.2 Generate Route Tree
```bash
npm run build
```

This will regenerate the route tree to include new customer routes.

### 2.3 Update Environment Variables
Ensure `.env` has the correct API URL:
```
VITE_API_URL=http://localhost:3001
```

### 2.4 Start Frontend
```bash
npm run dev
```

---

## STEP 3: Testing

### 3.1 Create First Customer Account
1. Login as admin at `/login`
2. Navigate to "Customers" in sidebar
3. Click "Create Customer"
4. Fill in:
   - Username: `testcustomer`
   - Password: `Test123!`
   - Email: `customer@example.com`
   - Company Name: `Test Company`
   - OneDrive Link: `https://onedrive.live.com/...`
   - Project Status Sheet URL: `https://onedrive.live.com/embed?...`
   - Assign Projects: Select projects
5. Click "Create Customer"

### 3.2 Test Customer Login
1. Logout from admin
2. Go to `/login`
3. Login with customer credentials
4. Should redirect to `/customer/dashboard`
5. Verify projects are displayed
6. Click on a project
7. Test OneDrive link and Excel sheet viewer

### 3.3 Test Admin Customer Management
1. Login as admin
2. Go to `/admin/customers`
3. Test:
   - View all customers
   - Edit customer
   - Delete customer
   - Assign/unassign projects

---

## STEP 4: Excel Sheet Integration

### Option 1: OneDrive Embed (Recommended)
1. Upload Excel file to OneDrive
2. Right-click file → Share → Get embed code
3. Copy the embed URL (looks like: `https://onedrive.live.com/embed?resid=...`)
4. Paste this URL in "Project Status Sheet URL" field

**Pros:**
- Real-time updates
- No manual uploads
- Built-in Excel viewer
- Secure permissions

### Option 2: Direct OneDrive Link
1. Share Excel file from OneDrive
2. Copy sharing link
3. Paste in "Project Status Sheet URL" field

**Note:** This opens in new tab instead of embedding.

---

## STEP 5: Security Configuration

### 5.1 JWT Configuration
Ensure `JWT_SECRET` is set in:
- Backend `.env` file
- Lambda environment variables

### 5.2 CORS Configuration
Update `server.js` CORS settings to allow frontend domain:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'],
  credentials: true
}));
```

### 5.3 OneDrive Permissions
- Set OneDrive folders to "View only" for customers
- Use organization-specific sharing links
- Enable link expiration if needed

---

## STEP 6: Production Deployment

### 6.1 Backend Deployment
```bash
cd Backend
# Deploy to AWS Lambda or EC2
# Update environment variables
# Configure API Gateway
```

### 6.2 Frontend Deployment
```bash
cd wpcs-admin-panel
npm run build
# Deploy to Vercel/Netlify/S3+CloudFront
```

### 6.3 Update API URL
Update frontend `.env.production`:
```
VITE_API_URL=https://api.your-domain.com
```

---

## File Structure Summary

### Backend Files Created:
```
Backend/
├── lambda-functions/
│   ├── customer-auth/
│   │   ├── index.js
│   │   └── package.json
│   ├── customer-projects/
│   │   ├── index.js
│   │   └── package.json
│   ├── customer-account-create/
│   │   ├── index.js
│   │   └── package.json
│   ├── customer-accounts-list/
│   │   ├── index.js
│   │   └── package.json
│   ├── customer-account-update/
│   │   ├── index.js
│   │   └── package.json
│   └── customer-account-delete/
│       ├── index.js
│       └── package.json
├── scripts/
│   └── create-customer-users-table.js
├── shared/
│   └── db-helper.js (updated)
└── server.js (updated)
```

### Frontend Files Created:
```
wpcs-admin-panel/src/
├── routes/
│   ├── customer.tsx (layout)
│   ├── customer.dashboard.tsx
│   ├── customer.project.$id.tsx
│   ├── admin.customers.index.tsx
│   ├── admin.customers.create.tsx
│   ├── admin.customers.$id.edit.tsx
│   └── login.tsx (updated)
├── lib/
│   ├── api.ts (updated)
│   └── auth.tsx (updated)
└── components/ui/
    └── checkbox.tsx
```

---

## Features Implemented

✅ **Dual-Role Authentication**
- Single login page with automatic role detection
- Admin → Admin Panel
- Customer → Customer Dashboard

✅ **Customer Dashboard**
- Grid view of assigned projects
- Project cards with images and status
- Click to view project details

✅ **Project Details**
- OneDrive link (opens in new tab)
- Excel sheet viewer (embedded iframe)
- Project information display

✅ **Admin Customer Management**
- Create customer accounts
- List all customers
- Edit customer details
- Delete customers
- Assign/unassign projects
- Manage OneDrive links and Excel sheets

✅ **Security**
- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- Protected routes

✅ **Excel Sheet Integration**
- OneDrive embed support
- Real-time updates
- Secure sharing

---

## API Endpoints

### Customer Endpoints
- `POST /api/customer/login` - Customer login
- `GET /api/customer/projects` - Get customer's projects

### Admin Customer Management
- `POST /api/admin/customers` - Create customer
- `GET /api/admin/customers` - List all customers
- `PUT /api/admin/customers/:id` - Update customer
- `DELETE /api/admin/customers/:id` - Delete customer

---

## Troubleshooting

### Issue: Customer can't login
- Check if customer exists in `wpcs-customer-users` table
- Verify password is correct
- Check JWT_SECRET is configured
- Check Lambda function logs

### Issue: Projects not showing
- Verify `projectIds` array in customer record
- Check if projects exist in `wpcs-projects` table
- Verify customer authentication token

### Issue: Excel sheet not loading
- Verify OneDrive embed URL is correct
- Check OneDrive sharing permissions
- Try opening URL directly in browser
- Ensure iframe is not blocked by browser

### Issue: OneDrive link not working
- Verify link is a valid OneDrive URL
- Check sharing permissions
- Ensure link hasn't expired

---

## Next Steps

1. **Email Notifications**: Send welcome emails to new customers
2. **Password Reset**: Implement forgot password functionality
3. **Activity Logs**: Track customer login and project access
4. **Analytics**: Monitor customer engagement
5. **Mobile Responsive**: Optimize for mobile devices
6. **Multi-language**: Add language support

---

## Support

For issues or questions:
1. Check Lambda function logs in CloudWatch
2. Check browser console for frontend errors
3. Verify DynamoDB table structure
4. Test API endpoints with Postman

---

## Estimated Timeline

- **Backend Setup**: 2-3 hours
- **Frontend Setup**: 1-2 hours
- **Testing**: 1-2 hours
- **Production Deployment**: 2-3 hours
- **Total**: 6-10 hours

---

## Success Criteria

✅ Admin can create customer accounts
✅ Admin can assign projects to customers
✅ Customers can login with credentials
✅ Customers see only their assigned projects
✅ OneDrive links work correctly
✅ Excel sheets display properly
✅ Role-based routing works
✅ All security measures in place
