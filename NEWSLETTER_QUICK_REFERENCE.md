# 📋 Newsletter Feature - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Create Database Table
cd Backend
node scripts/create-newsletters-table.js

# 2. Add Sample Data
node scripts/add-sample-newsletters.js

# 3. Start All Servers
# Terminal 1
cd Backend && npm start

# Terminal 2
cd Frontend && npm run dev

# Terminal 3
cd wpcs-admin-panel && npm run dev

# 4. Visit URLs
# Public: http://localhost:3000/newsletter
# Admin: http://localhost:8080/admin/newsletters
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/newsletters` | No | List all newsletters |
| GET | `/api/newsletters/:id` | No | Get single newsletter |
| POST | `/api/newsletters` | Yes | Create newsletter |
| PUT | `/api/newsletters/:id` | Yes | Update newsletter |
| DELETE | `/api/newsletters/:id` | Yes | Delete newsletter |

---

## 🗂️ Database Schema

```javascript
{
  id: "uuid-string",              // Primary Key
  title: "Newsletter Title",      // String
  content: "<h1>HTML...</h1>",   // HTML String
  month: 12,                      // Number (1-12)
  year: 2024,                     // Number
  coverImage: "s3-key",           // String (optional)
  publishedDate: "2024-12-01",   // ISO String
  createdAt: "2024-12-01",       // ISO String
  updatedAt: "2024-12-01"        // ISO String
}
```

---

## 🎨 Component Props

### NewsletterViewer
```typescript
interface NewsletterViewerProps {
  newsletter: {
    id: string;
    title: string;
    content: string;
    month: number;
    year: number;
    coverImage?: string;
    publishedDate: string;
  }
}
```

### NewsletterArchive
```typescript
interface NewsletterArchiveProps {
  newsletters: Newsletter[];
  currentId?: string;
}
```

---

## 🔧 Environment Variables

```env
# Backend/.env
DYNAMODB_NEWSLETTERS_TABLE=wpcs-newsletters
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=west-palm-files

# Frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_S3_BUCKET_URL=https://west-palm-files.s3.eu-north-1.amazonaws.com

# Admin/.env
VITE_API_URL=http://localhost:3001/api
VITE_FRONTEND_URL=http://localhost:3000
```

---

## 📁 File Locations

```
Backend/
├── lambda-functions/newsletters-*/index.js
├── scripts/create-newsletters-table.js
├── shared/db-helper.js (updated)
└── server.js (updated)

Frontend/
├── app/newsletter/page.tsx
├── app/newsletter/[year]/[month]/page.tsx
├── components/NewsletterViewer.tsx
├── components/NewsletterArchive.tsx
└── lib/api.ts (updated)

Admin/
├── routes/admin.newsletters.index.tsx
├── routes/admin.newsletters.create.tsx
├── components/admin/Sidebar.tsx (updated)
└── lib/api.ts (updated)
```

---

## 🎯 Common Tasks

### Create Newsletter (Admin)
```typescript
import { createNewsletter } from '@/lib/api';

const data = {
  title: "December 2024 Newsletter",
  content: "<h1>Welcome</h1><p>Content...</p>",
  month: 12,
  year: 2024,
  coverImage: "newsletters/cover.jpg"
};

const result = await createNewsletter(data);
```

### Fetch Newsletters (Frontend)
```typescript
import { getNewsletters } from '@/lib/api';

const newsletters = await getNewsletters();
// Returns: Newsletter[]
```

### Delete Newsletter (Admin)
```typescript
import { deleteNewsletter } from '@/lib/api';

await deleteNewsletter(newsletterId);
```

---

## 🎨 Styling Classes

```css
/* Container */
.newsletter-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

/* Card */
.newsletter-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Archive Link */
.archive-link {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.archive-link:hover {
  background: #f3f4f6;
}

.archive-link.active {
  background: #146321;
  color: white;
}
```

---

## 🔍 Debugging

### Check Database
```javascript
// Backend/shared/db-helper.js
const result = await getAllNewsletters();
console.log('Newsletters:', result.data);
```

### Check API Response
```bash
# List newsletters
curl http://localhost:3001/api/newsletters

# Get single newsletter
curl http://localhost:3001/api/newsletters/NEWSLETTER_ID

# Create (with auth)
curl -X POST http://localhost:3001/api/newsletters \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"<p>Test</p>","month":12,"year":2024}'
```

### Check Frontend
```javascript
// Browser Console
fetch('http://localhost:3001/api/newsletters')
  .then(r => r.json())
  .then(console.log);
```

---

## ⚡ Performance Tips

1. **Caching**: Backend caches for 10 min, Frontend ISR for 5 min
2. **Images**: Use Next.js Image component with S3 URLs
3. **Lazy Loading**: Archive loads on scroll
4. **Code Splitting**: Dynamic imports for heavy components

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Table not found | Run `create-newsletters-table.js` |
| No newsletters | Run `add-sample-newsletters.js` |
| Images not loading | Check S3 CORS and permissions |
| Can't create | Verify JWT token |
| 404 on routes | Check dynamic route folders |
| Slow loading | Check cache settings |

---

## 📚 Documentation Links

- **Full Guide**: `NEWSLETTER_FEATURE.md`
- **Hindi Guide**: `NEWSLETTER_IMPLEMENTATION_HINDI.md`
- **UI Guide**: `NEWSLETTER_UI_GUIDE.md`
- **Checklist**: `NEWSLETTER_CHECKLIST.md`

---

## 🎯 Key Features

✅ Public newsletter viewing
✅ Archive browsing by month-year
✅ Admin CRUD operations
✅ Cover image upload
✅ HTML content support
✅ Responsive design
✅ Caching (backend + frontend)
✅ Authentication & authorization
✅ Modern UI with animations

---

## 📞 Quick Help

**Need help?** Check these files:
1. `NEWSLETTER_FEATURE.md` - Complete documentation
2. `NEWSLETTER_CHECKLIST.md` - Testing checklist
3. Backend logs - `console.log` in Lambda functions
4. Browser console - Network tab for API calls

---

## 🚀 Deployment Commands

```bash
# Backend (AWS Lambda)
cd Backend/lambda-functions/newsletters-create
zip -r function.zip .
aws lambda update-function-code --function-name newsletters-create --zip-file fileb://function.zip

# Frontend (Vercel/Netlify)
cd Frontend
npm run build
# Deploy build folder

# Admin (Vercel/Netlify)
cd wpcs-admin-panel
npm run build
# Deploy dist folder
```

---

**Version**: 1.0.0
**Status**: Production Ready ✅
**Last Updated**: 2024
