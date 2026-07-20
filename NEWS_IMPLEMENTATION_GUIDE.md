# 📢 News/Events Feed - Complete Implementation Guide

## ✅ What's Been Done So Far

### Backend (Complete) ✅
1. **Lambda Functions Created:**
   - `news-list` - Get all news
   - `news-latest` - Get latest 5 news for ticker
   - `news-get` - Get single news (with view tracking)
   - `news-create` - Create news (protected)
   - `news-update` - Update news (protected)
   - `news-delete` - Delete news (protected)

2. **Server Routes Added:**
   - GET `/api/news` - List all news
   - GET `/api/news/latest` - Get latest news
   - GET `/api/news/:id` - Get single news
   - POST `/api/news` - Create news (auth required)
   - PUT `/api/news/:id` - Update news (auth required)
   - DELETE `/api/news/:id` - Delete news (auth required)

3. **Database Script:**
   - `create-news-table.js` - Creates DynamoDB table with GSI

4. **Environment Variables:**
   - `DYNAMODB_NEWS_TABLE=wpcs-news` added to .env

### Admin Panel API (Complete) ✅
- All news API functions added to `api.ts`
- getNews, getLatestNews, getNewsById
- createNews, updateNews, deleteNews

---

## 🚀 Next Steps

### Step 1: Create DynamoDB Table
```bash
cd Backend
node scripts/create-news-table.js
```

### Step 2: Create Admin Panel UI
Need to create 3 routes:
1. `/admin/news` - List all news
2. `/admin/news/create` - Create new news
3. `/admin/news/$id/edit` - Edit news

### Step 3: Create Frontend Components
1. NewsTicker component (for homepage)
2. NewsCarousel component (for about page)
3. NewsModal component (for full view)

---

## 📊 Database Schema

```javascript
{
  id: "uuid",                        // PK
  type: "news",                      // news | event | announcement
  title: "West Palm Wins Award",
  excerpt: "Brief 1-2 line summary", // For ticker
  content: "Full content 2-3 para",  // Full description
  coverImage: "s3-key",              // Optional
  publishDate: "2024-03-15T10:00:00Z",
  status: "published",               // draft | published | archived
  priority: 3,                       // 1-5 (1=highest)
  
  // Event-specific (optional)
  eventDate: "2024-04-01T14:00:00Z",
  eventLocation: "Miami",
  eventLink: "https://...",
  
  // Analytics
  views: 0,
  clicks: 0,
  
  // Timestamps
  createdAt: "2024-03-15T09:00:00Z",
  updatedAt: "2024-03-15T09:00:00Z"
}
```

**GSI:** `status-publishDate-index`
- Partition Key: status
- Sort Key: publishDate (descending)

---

## 🎨 UI Components to Build

### 1. Admin Panel - News List
```
┌─────────────────────────────────────────────────┐
│  News & Events                    [Create New]  │
├─────────────────────────────────────────────────┤
│  Title          | Type  | Date  | Status | ...  │
│  Award Win      | News  | 3/15  | Pub    | Edit │
│  Webinar        | Event | 4/1   | Draft  | Edit │
└─────────────────────────────────────────────────┘
```

### 2. Admin Panel - Create/Edit Form
```
┌─────────────────────────────────────────────────┐
│  Create News                                    │
├─────────────────────────────────────────────────┤
│  Type: [News ▼]                                 │
│  Title: [________________]                      │
│  Excerpt: [________________] (for ticker)       │
│  Content: [________________]                    │
│  Cover Image: [Upload]                          │
│  Publish Date: [Date Picker]                    │
│  Priority: [3 ▼]                                │
│  Status: [Published ▼]                          │
│                                                 │
│  [Save Draft] [Publish]                         │
└─────────────────────────────────────────────────┘
```

### 3. Frontend - News Ticker
```
┌─────────────────────────────────────────────────┐
│  🔔 Latest: Award Win • Webinar • New Project   │
└─────────────────────────────────────────────────┘
```

### 4. Frontend - News Carousel
```
┌─────────────────────────────────────────────────┐
│  Latest News & Events                           │
│  ┌──────┐  ┌──────┐  ┌──────┐                  │
│  │ News │  │ News │  │ News │  [→]              │
│  │  1   │  │  2   │  │  3   │                  │
│  └──────┘  └──────┘  └──────┘                  │
└─────────────────────────────────────────────────┘
```

---

## 📝 Implementation Checklist

### Backend ✅
- [x] Lambda functions created
- [x] Server routes added
- [x] Database script created
- [x] Environment variables added
- [ ] Run create-news-table.js script

### Admin Panel
- [x] API functions added
- [ ] News list route
- [ ] News create route
- [ ] News edit route
- [ ] Add to sidebar navigation

### Frontend
- [ ] Add news API to lib/api.ts
- [ ] NewsTicker component
- [ ] NewsCarousel component
- [ ] NewsModal component
- [ ] Add ticker to homepage
- [ ] Add carousel to about page

---

## 🎯 Quick Start Commands

### 1. Create Database Table
```bash
cd Backend
node scripts/create-news-table.js
```

### 2. Start Backend
```bash
cd Backend
npm start
```

### 3. Start Admin Panel
```bash
cd wpcs-admin-panel
npm run dev
```

### 4. Start Frontend
```bash
cd Frontend
npm run dev
```

---

## 📁 Files Created

### Backend:
- `lambda-functions/news-list/index.js`
- `lambda-functions/news-latest/index.js`
- `lambda-functions/news-get/index.js`
- `lambda-functions/news-create/index.js`
- `lambda-functions/news-update/index.js`
- `lambda-functions/news-delete/index.js`
- `scripts/create-news-table.js`

### Admin Panel:
- Updated: `src/lib/api.ts` (added news functions)

### Files to Create:
- Admin Panel:
  - `src/routes/admin.news.index.tsx`
  - `src/routes/admin.news.create.tsx`
  - `src/routes/admin.news.$id.edit.tsx`

- Frontend:
  - `src/components/NewsTicker.tsx`
  - `src/components/NewsCarousel.tsx`
  - `src/components/NewsModal.tsx`
  - `src/lib/api.ts` (add news functions)

---

## 🎨 Design Specifications

### Colors:
- Primary: #146321 (Green)
- Secondary: #D4AF37 (Gold)
- Background: #f8f9fa
- Text: #111827

### Typography:
- Ticker: 14px, medium
- Card Title: 18px, bold
- Card Excerpt: 14px, regular
- Date: 12px, medium

### Spacing:
- Ticker padding: 12px 24px
- Card padding: 20px
- Gap between cards: 24px
- Border radius: 12px

### Animation:
- Ticker scroll: 30s linear infinite
- Card hover: scale(1.02) 0.3s
- Fade in: 0.5s ease

---

## 🚨 Important Notes

1. **Database Table:** Must create table before using
2. **Authentication:** News create/update/delete requires admin auth
3. **Image Upload:** Uses same S3 bucket as projects
4. **Caching:** Frontend should cache news for 5 minutes
5. **Priority:** 1 = Highest, 5 = Lowest (for ordering)

---

## 📞 API Endpoints Summary

### Public:
```
GET  /api/news              - List all published news
GET  /api/news/latest       - Get latest 5 news
GET  /api/news/:id          - Get single news (tracks view)
```

### Protected (Admin):
```
POST   /api/news            - Create news
PUT    /api/news/:id        - Update news
DELETE /api/news/:id        - Delete news
```

---

## ✅ Status

**Backend:** ✅ Complete (need to run table script)
**Admin Panel API:** ✅ Complete
**Admin Panel UI:** ⏳ Pending
**Frontend:** ⏳ Pending

---

**Next: Create admin panel UI routes and frontend components!**
