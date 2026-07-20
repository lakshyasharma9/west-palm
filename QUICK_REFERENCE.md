# 🚀 Customer Portal - Quick Reference Guide

## 📌 Quick Access

### Test Customer Login
```
URL: http://localhost:5173/login
Username: testcustomer
Password: Test123!
```

### Admin Login
```
URL: http://localhost:5173/login
Use your existing admin credentials
```

---

## 🎯 What Can Each Role Do?

### 👤 Customer Role
| Feature | Description |
|---------|-------------|
| **Dashboard** | View all assigned projects in grid layout |
| **Project Details** | Click any project to see details |
| **OneDrive Access** | Direct link to project files |
| **Status Sheet** | View real-time Excel status updates |
| **Logout** | Secure logout from portal |

### 👨‍💼 Admin Role
| Feature | Description |
|---------|-------------|
| **Create Customers** | Add new customer accounts |
| **Manage Customers** | Edit/Delete customer accounts |
| **Assign Projects** | Link projects to customers |
| **OneDrive Links** | Attach OneDrive folders |
| **Excel Sheets** | Attach status sheet URLs |
| **View All Customers** | Grid view of all customers |

---

## 🔑 API Endpoints Reference

### Customer Endpoints
```
POST   /api/customer/login          - Customer login
GET    /api/customer/projects       - Get customer's projects
```

### Admin Customer Management
```
POST   /api/admin/customers         - Create customer
GET    /api/admin/customers         - List all customers
PUT    /api/admin/customers/:id     - Update customer
DELETE /api/admin/customers/:id     - Delete customer
```

---

## 📊 Database Tables

### wpcs-customer-users
```javascript
{
  customerId: "cust_1234567890",
  username: "johndoe",
  password: "$2a$10$...",  // bcrypt hashed
  email: "john@example.com",
  companyName: "Acme Corp",
  oneDriveLink: "https://onedrive.live.com/...",
  projectStatusSheetUrl: "https://onedrive.live.com/embed?...",
  projectIds: ["proj_1", "proj_2"],
  role: "customer",
  createdAt: "2024-01-15T10:30:00Z",
  lastLogin: "2024-01-20T14:45:00Z"
}
```

---

## 🛠️ Common Tasks

### Task 1: Create a New Customer (Admin)
1. Login as admin
2. Click "Customers" in sidebar
3. Click "Create Customer" button
4. Fill in form:
   - Username (required)
   - Password (required)
   - Email (required)
   - Company Name
   - OneDrive Link
   - Excel Sheet URL
   - Select projects to assign
5. Click "Create Customer"

### Task 2: Get OneDrive Embed URL
1. Upload Excel file to OneDrive
2. Right-click file → Share
3. Click "Embed"
4. Copy the embed URL
5. Paste in "Project Status Sheet URL" field

Format: `https://onedrive.live.com/embed?resid=ABC&authkey=XYZ&em=2`

### Task 3: Assign Projects to Customer
1. Go to Admin → Customers
2. Click "Edit" on customer
3. Check/uncheck projects
4. Click "Update Customer"

### Task 4: Customer Views Projects
1. Login as customer
2. Dashboard shows all assigned projects
3. Click any project card
4. View OneDrive or Status Sheet

---

## 🔐 Security Notes

### Password Requirements
- Minimum 8 characters recommended
- Mix of letters, numbers, symbols
- Stored as bcrypt hash

### JWT Tokens
- Expires after 24 hours (configurable)
- Contains role (admin/customer)
- Stored in localStorage

### OneDrive Permissions
- Use "View only" sharing links
- Set expiration if needed
- Organization-specific links recommended

---

## 📱 Routes Reference

### Customer Routes
```
/customer/dashboard           - Customer dashboard
/customer/project/:id         - Project detail page
```

### Admin Routes
```
/admin/customers              - List customers
/admin/customers/create       - Create customer
/admin/customers/:id/edit     - Edit customer
```

### Shared Routes
```
/login                        - Login page (role-based routing)
```

---

## 🎨 UI Components Used

### Customer Portal
- Project Cards (grid layout)
- OneDrive Link Button
- Excel Sheet Iframe Viewer
- Customer Header with Logout

### Admin Panel
- Customer Grid View
- Create/Edit Forms
- Project Assignment Checkboxes
- Delete Confirmation

---

## 🚦 Status Indicators

### Customer Status
- ✅ Active - Can login and view projects
- ❌ Deleted - Account removed

### Project Assignment
- ✅ Assigned - Customer can see project
- ⬜ Not Assigned - Project hidden from customer

---

## 📞 Quick Commands

### Start Backend
```bash
cd Backend
npm start
```

### Start Frontend
```bash
cd wpcs-admin-panel
npm run dev
```

### Create Customer Table
```bash
cd Backend
node scripts/create-customer-users-table.js
```

### Create Sample Customer
```bash
cd Backend
node scripts/create-sample-customer.js
```

### Test Setup
```bash
cd Backend
node scripts/test-customer-portal.js
```

---

## 🐛 Quick Fixes

### Customer Can't Login
```bash
# Check if customer exists
# Verify in DynamoDB: wpcs-customer-users table
# Check backend logs for errors
```

### Projects Not Showing
```bash
# Verify projectIds array in customer record
# Check if projects exist in wpcs-projects table
# Clear browser cache and re-login
```

### Excel Sheet Not Loading
```bash
# Verify OneDrive embed URL format
# Check sharing permissions
# Test URL directly in browser
# Ensure iframe not blocked
```

---

## 📈 Feature Highlights

### ✨ What Makes This Special

1. **Single Login Page**
   - Automatic role detection
   - Smart routing based on user type

2. **Real-Time Excel Viewer**
   - Embedded OneDrive sheets
   - No manual uploads needed
   - Always up-to-date

3. **Flexible Project Assignment**
   - Multiple projects per customer
   - Easy to add/remove
   - Instant updates

4. **Secure by Design**
   - Password hashing
   - JWT authentication
   - Role-based access control

---

## 🎓 Best Practices

### For Admins
- ✅ Use strong passwords for customers
- ✅ Set OneDrive permissions to "View only"
- ✅ Regularly review customer access
- ✅ Keep Excel sheets updated

### For Customers
- ✅ Logout after each session
- ✅ Don't share credentials
- ✅ Report issues immediately
- ✅ Check projects regularly

---

## 📊 Sample Data

### Sample Customer (Already Created)
```
Customer ID: cust_1778650921994
Username: testcustomer
Password: Test123!
Email: customer@example.com
Company: Test Company Inc.
```

### Sample OneDrive URL
```
https://onedrive.live.com/embed?resid=ABC123&authkey=XYZ&em=2
```

---

## 🎯 Success Checklist

Before going live, verify:
- [ ] DynamoDB table created
- [ ] Lambda functions deployed
- [ ] API Gateway configured
- [ ] Frontend deployed
- [ ] Test customer can login
- [ ] Admin can create customers
- [ ] Projects display correctly
- [ ] OneDrive links work
- [ ] Excel sheets load
- [ ] Logout works

---

## 📚 Documentation Links

- **Full Deployment Guide:** `CUSTOMER_PORTAL_DEPLOYMENT.md`
- **Feature Documentation:** `CUSTOMER_PORTAL_README.md`
- **Implementation Status:** `IMPLEMENTATION_COMPLETE.md`

---

## 🎉 You're All Set!

The Customer Portal is fully implemented and ready to use!

**Quick Start:**
1. Start backend: `cd Backend && npm start`
2. Start frontend: `cd wpcs-admin-panel && npm run dev`
3. Login as admin or test customer
4. Enjoy! 🚀

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
