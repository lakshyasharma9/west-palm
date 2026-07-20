# 🎨 Newsletter UI Components - Visual Guide

## Color Scheme

```css
/* Primary Colors */
--primary-green: #146321;
--primary-gold: #D4AF37;

/* Backgrounds */
--bg-gradient: linear-gradient(to bottom, #f9fafb, #ffffff);
--card-bg: #ffffff;
--sidebar-bg: #ffffff;

/* Text Colors */
--text-primary: #111827;
--text-secondary: #6b7280;
--text-muted: #9ca3af;

/* Borders */
--border-light: #e5e7eb;
--border-medium: #d1d5db;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

## Component Breakdown

### 1. Newsletter Viewer Card

```
┌─────────────────────────────────────────────────┐
│                                                 │
│           [Cover Image - 320px height]          │
│                                                 │
├─────────────────────────────────────────────────┤
│  📅 December 2024    🕐 Published Dec 1, 2024  │
│                                                 │
│  WPCS December 2024 - Year in Review           │
│  ═══════════════════════════════════════════   │
│                                                 │
│  Lorem ipsum dolor sit amet, consectetur        │
│  adipiscing elit. Sed do eiusmod tempor...     │
│                                                 │
│  • Key Point 1                                  │
│  • Key Point 2                                  │
│  • Key Point 3                                  │
│                                                 │
└─────────────────────────────────────────────────┘

Features:
- Rounded corners (16px)
- White background
- Border (1px #e5e7eb)
- Shadow on hover
- Responsive padding (32px desktop, 24px mobile)
```

### 2. Archive Sidebar

```
┌──────────────────────────┐
│  📄 Archive              │
├──────────────────────────┤
│                          │
│  ▶ December 2024  [ACTIVE]│
│  ▶ November 2024         │
│  ▶ October 2024          │
│  ▶ September 2024        │
│  ▶ August 2024           │
│                          │
├──────────────────────────┤
│  5 newsletters published │
└──────────────────────────┘

Features:
- Sticky positioning (top: 96px)
- Width: 320px
- Active state: Green background
- Hover: Light gray background
- Chevron animation on hover
```

### 3. Admin Newsletter Card

```
┌────────────────────────────┐
│  📅 December 2024          │
│                            │
│  WPCS December 2024        │
│  Year in Review            │
│                            │
│  [👁 View]  [🗑 Delete]    │
└────────────────────────────┘

Features:
- Grid layout (3 columns on desktop)
- Card hover effect (shadow increase)
- Button group at bottom
- Month-year badge at top
```

### 4. Create Newsletter Form

```
┌─────────────────────────────────────────┐
│  ← Create Newsletter                    │
│     Publish a new monthly newsletter    │
├─────────────────────────────────────────┤
│                                         │
│  Month *          Year *                │
│  [December ▼]     [2024 ▼]            │
│                                         │
│  Title *                                │
│  [Enter newsletter title.............]  │
│                                         │
│  Cover Image                            │
│  ┌─────────────────────────────────┐   │
│  │     📤 Click to upload          │   │
│  │     cover image                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Content *                              │
│  ┌─────────────────────────────────┐   │
│  │ <h1>Welcome</h1>                │   │
│  │ <p>Content here...</p>          │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Publish Newsletter]  [Cancel]         │
└─────────────────────────────────────────┘

Features:
- Two-column layout for month/year
- File upload with drag-drop area
- Large textarea (400px height)
- Monospace font for HTML editing
- Loading states on buttons
```

## Responsive Breakpoints

```css
/* Mobile First */
.newsletter-container {
  padding: 1rem;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .newsletter-container {
    padding: 2rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .newsletter-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 2rem;
  }
  
  .newsletter-sidebar {
    position: sticky;
    top: 6rem;
  }
}
```

## Animation Examples

### Hover Effects

```css
/* Card Hover */
.newsletter-card {
  transition: all 0.3s ease;
}

.newsletter-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

/* Archive Link Hover */
.archive-link {
  transition: all 0.2s ease;
}

.archive-link:hover {
  background-color: #f3f4f6;
  padding-left: 1.25rem;
}

.archive-link:hover .chevron {
  transform: translateX(4px);
}

/* Button Hover */
.button-primary {
  transition: all 0.2s ease;
}

.button-primary:hover {
  background-color: #0f4c1a;
  transform: scale(1.02);
}
```

## Typography Scale

```css
/* Headings */
h1 { font-size: 2.5rem; font-weight: 700; } /* 40px */
h2 { font-size: 2rem; font-weight: 700; }   /* 32px */
h3 { font-size: 1.5rem; font-weight: 600; } /* 24px */

/* Body */
p { font-size: 1rem; line-height: 1.75; }   /* 16px */
small { font-size: 0.875rem; }              /* 14px */

/* Mobile Adjustments */
@media (max-width: 768px) {
  h1 { font-size: 2rem; }    /* 32px */
  h2 { font-size: 1.5rem; }  /* 24px */
  h3 { font-size: 1.25rem; } /* 20px */
}
```

## Spacing System

```css
/* Consistent spacing scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

## Icon Usage

```tsx
// Lucide React Icons Used
import {
  Calendar,      // Date display
  Clock,         // Time display
  FileText,      // Archive icon
  ChevronRight,  // Navigation arrow
  Plus,          // Create button
  Trash2,        // Delete button
  Eye,           // View button
  Upload,        // File upload
  X,             // Close/Remove
  Loader2,       // Loading spinner
  Newspaper,     // Newsletter icon
} from "lucide-react";

// Icon sizes
<Icon className="h-4 w-4" />  // Small (16px)
<Icon className="h-5 w-5" />  // Medium (20px)
<Icon className="h-6 w-6" />  // Large (24px)
```

## Loading States

```tsx
// Button Loading
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
  {isLoading ? "Publishing..." : "Publish Newsletter"}
</Button>

// Page Loading
<div className="flex h-64 items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
</div>
```

## Empty States

```tsx
// No Newsletters
<div className="flex h-64 flex-col items-center justify-center">
  <Newspaper className="mb-4 h-12 w-12 text-muted-foreground" />
  <p className="text-lg font-medium">No newsletters yet</p>
  <p className="text-sm text-muted-foreground mb-4">
    Create your first newsletter to get started
  </p>
  <Button>Create Newsletter</Button>
</div>
```

## Accessibility Features

```tsx
// Semantic HTML
<article>
  <header>
    <h1>Newsletter Title</h1>
    <time dateTime="2024-12-01">December 1, 2024</time>
  </header>
  <div className="prose">
    {/* Content */}
  </div>
</article>

// ARIA Labels
<button aria-label="Delete newsletter">
  <Trash2 />
</button>

// Focus States
.button:focus-visible {
  outline: 2px solid #146321;
  outline-offset: 2px;
}
```

## Print Styles (Bonus)

```css
@media print {
  .newsletter-sidebar,
  .newsletter-actions,
  nav,
  footer {
    display: none;
  }
  
  .newsletter-viewer {
    max-width: 100%;
    box-shadow: none;
    border: none;
  }
}
```

---

## Component Hierarchy

```
NewsletterPage
├── Container (max-w-7xl)
│   ├── Header
│   │   ├── Title (h1)
│   │   └── Description (p)
│   └── Grid Layout
│       ├── Main Content
│       │   └── NewsletterViewer
│       │       ├── Cover Image
│       │       ├── Meta Info (date, time)
│       │       ├── Title (h2)
│       │       └── Content (prose)
│       └── Sidebar
│           └── NewsletterArchive
│               ├── Header (icon + title)
│               ├── Archive Links
│               └── Footer (count)
```

---

**Design System**: Tailwind CSS + Custom Components
**Icons**: Lucide React
**Fonts**: System fonts (optimized for performance)
**Animations**: CSS transitions + Tailwind utilities
