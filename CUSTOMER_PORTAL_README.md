# Customer Portal Feature - Complete Implementation

## Overview
A complete dual-role authentication system allowing both West Palm admins and customers to access their respective dashboards through a single login page.

## Features

### For Customers
- 🔐 Secure login with username/password
- 📊 Dashboard with assigned projects
- 📁 Direct OneDrive folder access
- 📈 Real-time Excel status sheet viewer
- 🎨 Clean, intuitive UI

### For Admins
- 👥 Create and manage customer accounts
- 🔗 Assign OneDrive links to customers
- 📋 Attach Excel status sheets
- 🎯 Assign multiple projects per customer
- ✏️ Edit/Delete customer accounts

## Technology Stack

### Backend
- Node.js + Express
- AWS Lambda Functions
- DynamoDB (customer-users table)
- JWT Authentication
- bcrypt Password Hashing

### Frontend
- React + TypeScript
- TanStack Router
- TanStack Query
- Tailwind CSS
- Radix UI Components

## Quick Start

### 1. Backend Setup
```bash
cd Backend

# Create customer users table
node scripts/create-customer-users-table.js

# Install dependencies for Lambda functions
cd lambda-functions/customer-auth && npm install
cd ../customer-account-create && npm install
cd ../customer-account-update && npm install

# Start server
cd ../..
npm start
```

### 2. Frontend Setup
```bash
cd wpcs-admin-panel

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 3. Create First Customer
1. Login as admin
2. Go to "Customers" menu
3. Click "Create Customer"
4. Fill in details and assign projects
5. Customer can now login

## Database Schema

### wpcs-customer-users Table
```javascript
{
  customerId: "cust_1234567890",
  username: "johndoe",
  password: "$2a$10$...", // bcrypt hashed
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

## API Endpoints

### Customer Authentication
```
POST /api/customer/login
Body: { username, password }
Response: { success, token, user }
```

### Customer Projects
```
GET /api/customer/projects
Headers: { Authorization: Bearer <token> }
Response: { success, projects }
```

### Admin - Create Customer
```
POST /api/admin/customers
Headers: { Authorization: Bearer <admin-token> }
Body: { username, password, email, companyName, oneDriveLink, projectStatusSheetUrl, projectIds }
Response: { success, customer }
```

### Admin - List Customers
```
GET /api/admin/customers
Headers: { Authorization: Bearer <admin-token> }
Response: { success, customers }
```

### Admin - Update Customer
```
PUT /api/admin/customers/:id
Headers: { Authorization: Bearer <admin-token> }
Body: { username, email, ... }
Response: { success, customer }
```

### Admin - Delete Customer
```
DELETE /api/admin/customers/:id
Headers: { Authorization: Bearer <admin-token> }
Response: { success }
```

## Authentication Flow

```
User visits /login
    ↓
Enters credentials
    ↓
Backend validates
    ↓
JWT token issued with role
    ↓
Frontend checks role
    ↓
Admin → /admin/dashboard
Customer → /customer/dashboard
```

## Excel Sheet Integration

### OneDrive Embed (Recommended)
1. Upload Excel to OneDrive
2. Right-click → Share → Embed
3. Copy embed URL
4. Paste in "Project Status Sheet URL"

**Embed URL Format:**
```
https://onedrive.live.com/embed?resid=ABC123&authkey=XYZ&em=2
```

### Benefits
- ✅ Real-time updates
- ✅ No manual uploads
- ✅ Built-in Excel viewer
- ✅ Secure permissions
- ✅ Works on all devices

## Security Features

### Password Security
- bcrypt hashing (10 rounds)
- Minimum password requirements
- Secure password storage

### Authentication
- JWT tokens with expiration
- Role-based access control
- Protected API endpoints
- Secure token storage

### Authorization
- Customers see only their projects
- Admins have full access
- Route-level protection
- API-level validation

## File Structure

```
West-Palm/
├── Backend/
│   ├── lambda-functions/
│   │   ├── customer-auth/
│   │   ├── customer-projects/
│   │   ├── customer-account-create/
│   │   ├── customer-accounts-list/
│   │   ├── customer-account-update/
│   │   └── customer-account-delete/
│   ├── scripts/
│   │   └── create-customer-users-table.js
│   ├── shared/
│   │   └── db-helper.js (updated)
│   └── server.js (updated)
│
└── wpcs-admin-panel/
    └── src/
        ├── routes/
        │   ├── customer.tsx
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

## Usage Examples

### Admin Creates Customer
```typescript
// Admin dashboard
const createCustomer = async () => {
  await createCustomer({
    username: "johndoe",
    password: "SecurePass123!",
    email: "john@example.com",
    companyName: "Acme Corp",
    oneDriveLink: "https://onedrive.live.com/folder123",
    projectStatusSheetUrl: "https://onedrive.live.com/embed?resid=...",
    projectIds: ["proj_1", "proj_2"]
  });
};
```

### Customer Views Projects
```typescript
// Customer dashboard
const { data: projects } = useQuery({
  queryKey: ["customer-projects"],
  queryFn: getCustomerProjects
});

// Display projects as cards
projects.map(project => (
  <ProjectCard
    project={project}
    onViewOneDrive={() => window.open(project.oneDriveLink)}
    onViewStatus={() => navigate(`/customer/project/${project.id}`)}
  />
));
```

## Testing Checklist

### Backend Tests
- [ ] Customer can login with valid credentials
- [ ] Invalid credentials are rejected
- [ ] JWT token is generated correctly
- [ ] Customer can fetch their projects
- [ ] Admin can create customers
- [ ] Admin can list all customers
- [ ] Admin can update customers
- [ ] Admin can delete customers
- [ ] Customers cannot access admin endpoints

### Frontend Tests
- [ ] Login page displays correctly
- [ ] Role-based routing works
- [ ] Customer dashboard shows projects
- [ ] Project cards display correctly
- [ ] OneDrive links open in new tab
- [ ] Excel sheets embed properly
- [ ] Admin can manage customers
- [ ] Forms validate correctly
- [ ] Logout works properly

## Troubleshooting

### Customer Login Issues
**Problem:** Customer can't login
**Solutions:**
- Verify customer exists in database
- Check password is correct
- Ensure JWT_SECRET is configured
- Check Lambda logs in CloudWatch

### Projects Not Showing
**Problem:** Customer sees no projects
**Solutions:**
- Verify projectIds array in customer record
- Check projects exist in projects table
- Ensure customer token is valid
- Check API response in browser console

### Excel Sheet Not Loading
**Problem:** Excel sheet doesn't display
**Solutions:**
- Verify OneDrive embed URL format
- Check sharing permissions
- Test URL directly in browser
- Ensure iframe not blocked

## Performance Optimization

### Backend
- DynamoDB indexes for fast queries
- JWT token caching
- Lambda cold start optimization
- API response compression

### Frontend
- React Query caching
- Lazy loading routes
- Image optimization
- Code splitting

## Future Enhancements

### Phase 2
- [ ] Email notifications for new accounts
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Activity logging

### Phase 3
- [ ] Customer profile management
- [ ] Project comments/feedback
- [ ] File upload capability
- [ ] Mobile app

### Phase 4
- [ ] Analytics dashboard
- [ ] Custom branding per customer
- [ ] Multi-language support
- [ ] Advanced reporting

## Support & Maintenance

### Monitoring
- CloudWatch logs for Lambda functions
- API Gateway metrics
- DynamoDB performance metrics
- Frontend error tracking

### Backup
- DynamoDB point-in-time recovery
- Regular database backups
- Code repository backups

### Updates
- Regular security patches
- Dependency updates
- Feature enhancements
- Bug fixes

## License
Proprietary - West Palm Construction Services

## Contact
For support or questions, contact the development team.

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Status:** Production Ready
