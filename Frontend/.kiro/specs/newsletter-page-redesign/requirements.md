# Requirements Document

## Introduction

This document defines the requirements for a complete UI/UX redesign of the Newsletter section on the West Palm Consultants (WPC) main website (Next.js 14 frontend). The redesign replaces the current implementation with a premium editorial/corporate design featuring a full-width hero banner, a two-column article-plus-sidebar layout, rich content typography, a sticky archive sidebar, an "About This Edition" metadata card, and a full-width email subscription section. The redesign covers two routes: `/newsletter` (latest edition) and `/newsletter/[year]/[month]` (specific archived edition). No backend changes are required.

---

## Glossary

- **Newsletter_Page**: The Next.js page component at `/newsletter` that displays the most recently published newsletter.
- **Archive_Page**: The Next.js page component at `/newsletter/[year]/[month]` that displays a specific newsletter edition.
- **Newsletter_Viewer**: The React component (`NewsletterViewer.tsx`) responsible for rendering the hero section, article content, tags, and share buttons for a single newsletter.
- **Newsletter_Archive**: The React component (`NewsletterArchive.tsx`) that renders the sticky sidebar listing all published newsletter editions.
- **About_Edition_Card**: A sidebar card component that displays metadata for the currently viewed newsletter edition (edition number, published date, author, reading time).
- **Subscription_Section**: A full-width section at the bottom of the page containing an email subscription form UI.
- **Hero_Section**: The full-width banner at the top of the page using the newsletter's cover image as a background with a dark green overlay.
- **Edition_Number**: The ordinal position of a newsletter in the list of all published newsletters, sorted ascending by year then month (oldest = edition 1).
- **Reading_Time**: An estimated reading duration calculated from the newsletter's HTML content at a rate of 200 words per minute, rounded up to the nearest whole minute.
- **Cover_Image**: The optional image stored as an S3 key or full URL in the newsletter's `coverImage` field, resolved to a full URL via `getS3ImageUrl`.
- **Rich_Content**: The HTML string stored in the newsletter's `content` field, produced by the TipTap editor in the admin panel.
- **Tag**: A keyword string from the newsletter's `seo.keywords` array, displayed as a pill-shaped label.
- **WPC_Research_Desk**: The fixed author attribution string "WPC Research Desk" used across all newsletter editions.
- **Brand_Green**: The primary brand color `#146321`.
- **Serif_Font**: The serif typeface stack `"Fraunces", "Playfair Display", Georgia, serif` used for display headings and drop caps.

---

## Requirements

### Requirement 1: Hero Section Display

**User Story:** As a site visitor, I want to see a visually striking full-width hero banner when I open a newsletter, so that I immediately understand the edition's identity and key details.

#### Acceptance Criteria

1. WHEN a newsletter with a `coverImage` is displayed, THE Hero_Section SHALL render the resolved Cover_Image as a full-width background image behind a dark green (`#146321`) overlay at 70% opacity.
2. WHEN a newsletter has no `coverImage`, THE Hero_Section SHALL render a solid dark green (`#146321`) background with no broken image element.
3. THE Hero_Section SHALL display a pill-shaped badge containing the text "● MONTHLY NEWSLETTER" in uppercase, with a white border and white text, centered horizontally.
4. THE Hero_Section SHALL display an edition line formatted as `[MONTH_ABBR] · [YEAR] · EDITION [N]` (e.g., "MAY · 2026 · EDITION 47") in small uppercase muted white text, centered horizontally.
5. THE Hero_Section SHALL display the newsletter's `title` in a large centered serif heading (Serif_Font) in white, bold.
6. WHEN a newsletter has a non-empty `excerpt`, THE Hero_Section SHALL display the `excerpt` as a centered subtitle in white below the title, constrained to a maximum width of 700px.
7. THE Hero_Section SHALL display a meta row centered below the excerpt containing: the formatted published date (e.g., "Published May 12, 2026"), a clock icon with the Reading_Time (e.g., "9 min read"), and the attribution "By the WPC Research Desk", separated by middle-dot (·) separators.
8. WHEN the viewport width is less than 768px, THE Hero_Section SHALL stack all content vertically and reduce heading font size to remain legible without horizontal overflow.

---

### Requirement 2: Edition Number Calculation

**User Story:** As a site visitor, I want to see the correct edition number for each newsletter, so that I can understand where it falls in the publication history.

#### Acceptance Criteria

1. THE Newsletter_Page SHALL calculate Edition_Number by sorting all published newsletters ascending by year, then by month, and assigning sequential integers starting at 1.
2. WHEN the newsletter list contains newsletters from multiple years, THE Newsletter_Page SHALL sort across year boundaries correctly (e.g., December 2024 = edition N, January 2025 = edition N+1).
3. THE Archive_Page SHALL use the same Edition_Number calculation logic as the Newsletter_Page.
4. IF the newsletter list is empty, THEN THE Newsletter_Page SHALL display a "No newsletters published yet" placeholder and SHALL NOT attempt to calculate an Edition_Number.

---

### Requirement 3: Reading Time Calculation

**User Story:** As a site visitor, I want to see an estimated reading time for each newsletter, so that I can decide whether to read it now or save it for later.

#### Acceptance Criteria

1. THE Newsletter_Viewer SHALL calculate Reading_Time by stripping all HTML tags from the `content` field, counting the resulting words, dividing by 200, and rounding up to the nearest whole number.
2. WHEN the calculated Reading_Time is 1, THE Newsletter_Viewer SHALL display "1 min read".
3. WHEN the calculated Reading_Time is greater than 1, THE Newsletter_Viewer SHALL display "[N] min read".
4. IF the `content` field is empty or contains only whitespace after stripping HTML, THEN THE Newsletter_Viewer SHALL display "1 min read" as the minimum.

---

### Requirement 4: Two-Column Layout

**User Story:** As a site visitor, I want to read the newsletter article alongside a persistent archive sidebar, so that I can easily navigate to other editions without losing my place.

#### Acceptance Criteria

1. WHEN the viewport width is 1024px or greater, THE Newsletter_Page SHALL render a two-column layout with the article occupying approximately 65% of the content width and the sidebar occupying approximately 35%.
2. WHILE the user scrolls through the article content, THE Newsletter_Archive SHALL remain sticky at a top offset of 120px within the right column.
3. WHEN the viewport width is less than 1024px, THE Newsletter_Page SHALL stack the article and sidebar vertically, with the article appearing first and the sidebar below.
4. THE Newsletter_Page SHALL apply a maximum content width of 1280px centered horizontally with consistent horizontal padding (48px on desktop, 32px on tablet, 16px on mobile).

---

### Requirement 5: Article Content Typography

**User Story:** As a site visitor, I want the newsletter article to be beautifully typeset and easy to read, so that I can comfortably consume long-form editorial content.

#### Acceptance Criteria

1. THE Newsletter_Viewer SHALL apply a drop cap style to the first letter of the first paragraph in the Rich_Content, rendering it in Brand_Green at approximately 3.5× the body font size, floating left with appropriate margin.
2. THE Newsletter_Viewer SHALL render `<h2>` elements in the Rich_Content with bold dark styling, generous top margin, and a bottom border separator.
3. THE Newsletter_Viewer SHALL render `<h3>` elements in the Rich_Content in Brand_Green with bold styling.
4. THE Newsletter_Viewer SHALL render `<p>` elements with a line-height of at least 1.8 and a font size of at least 1.125rem.
5. THE Newsletter_Viewer SHALL render `<blockquote>` elements with a left border in Brand_Green, a large decorative quotation mark icon in Brand_Green, italic text, and an attribution line below.
6. THE Newsletter_Viewer SHALL render `<ul>` and `<ol>` elements with standard indentation and item spacing consistent with the body text size.
7. THE Newsletter_Viewer SHALL render `<a>` elements in Brand_Green with bold weight and no underline by default.
8. THE Newsletter_Viewer SHALL render `<img>` elements within content with full width, rounded corners, and a subtle box shadow.

---

### Requirement 6: Newsletter Archive Sidebar

**User Story:** As a site visitor, I want to browse all published newsletter editions from the sidebar, so that I can quickly navigate to any past edition.

#### Acceptance Criteria

1. THE Newsletter_Archive SHALL display a card with a bold "Newsletter Archive" heading and a count badge showing "[N] EDITIONS" in small muted uppercase.
2. THE Newsletter_Archive SHALL display a subtitle "Browse previous monthly briefings" below the heading.
3. FOR EACH newsletter in the list, THE Newsletter_Archive SHALL render a row containing: a date badge (3-letter month abbreviation stacked above the 4-digit year), the newsletter title (truncated with ellipsis if it overflows), a month/year subtitle, and a right-pointing chevron icon.
4. WHEN a newsletter row corresponds to the currently viewed edition, THE Newsletter_Archive SHALL render its date badge with a Brand_Green background and white text, and the title in bold.
5. WHEN a newsletter row does not correspond to the currently viewed edition, THE Newsletter_Archive SHALL render its date badge with a gray background and muted text.
6. WHEN a user clicks a newsletter row, THE Newsletter_Archive SHALL navigate to `/newsletter/[year]/[month]` for that edition.
7. WHEN the newsletter list contains more than 8 entries, THE Newsletter_Archive SHALL constrain the list to a maximum height with internal scrolling so the sidebar does not exceed the viewport height.

---

### Requirement 7: About This Edition Card

**User Story:** As a site visitor, I want to see key metadata about the current newsletter edition in the sidebar, so that I can quickly reference publication details without reading the full article.

#### Acceptance Criteria

1. THE About_Edition_Card SHALL display a label "ABOUT THIS EDITION" in small uppercase muted text.
2. THE About_Edition_Card SHALL display the newsletter's `excerpt` as a description paragraph.
3. THE About_Edition_Card SHALL display a metadata row labeled "EDITION" with the value "No. [N]" where N is the Edition_Number.
4. THE About_Edition_Card SHALL display a metadata row labeled "PUBLISHED" with the value formatted as the full published date (e.g., "May 12, 2026").
5. THE About_Edition_Card SHALL display a metadata row labeled "AUTHOR" with the fixed value "WPC Research Desk".
6. THE About_Edition_Card SHALL display a metadata row labeled "READING TIME" with the value "[N] minutes".
7. THE About_Edition_Card SHALL appear below the Newsletter_Archive list in the right sidebar column.

---

### Requirement 8: Tags Display

**User Story:** As a site visitor, I want to see topic tags at the bottom of the article, so that I can understand the key themes covered in the newsletter.

#### Acceptance Criteria

1. WHEN the newsletter's `seo.keywords` array is non-empty, THE Newsletter_Viewer SHALL render each keyword as a pill-shaped Tag with a border, below the article content.
2. THE Newsletter_Viewer SHALL display a "Tags:" label before the tag pills.
3. WHEN the newsletter's `seo.keywords` array is empty or undefined, THE Newsletter_Viewer SHALL not render the tags section.
4. THE Newsletter_Viewer SHALL render tags in a horizontally wrapping flex row.

---

### Requirement 9: Share Buttons

**User Story:** As a site visitor, I want to share a newsletter edition on social media or copy its link, so that I can distribute valuable content to my network.

#### Acceptance Criteria

1. THE Newsletter_Viewer SHALL display a "SHARE" label followed by three share action buttons: Twitter/X, LinkedIn, and Copy Link.
2. WHEN a user clicks the Twitter/X share button, THE Newsletter_Viewer SHALL open a new browser tab with a pre-populated Twitter/X share URL containing the current page URL and the newsletter title.
3. WHEN a user clicks the LinkedIn share button, THE Newsletter_Viewer SHALL open a new browser tab with a pre-populated LinkedIn share URL containing the current page URL.
4. WHEN a user clicks the Copy Link button, THE Newsletter_Viewer SHALL copy the current page URL to the clipboard.
5. WHEN the URL is successfully copied to the clipboard, THE Newsletter_Viewer SHALL display a brief visual confirmation (e.g., icon change or tooltip showing "Copied!") for at least 1500ms before reverting.
6. THE Newsletter_Viewer SHALL render the share buttons inline in a horizontal row below the tags section.

---

### Requirement 10: Email Subscription Section

**User Story:** As a site visitor, I want to subscribe to the newsletter from the page itself, so that I can receive future editions without navigating elsewhere.

#### Acceptance Criteria

1. THE Subscription_Section SHALL render as a full-width section below the two-column content area with a light green/off-white background.
2. THE Subscription_Section SHALL display a centered pill badge containing "✉ MONTHLY BRIEFING".
3. THE Subscription_Section SHALL display a centered serif heading "Stay updated with West Palm Consultants".
4. THE Subscription_Section SHALL display a centered subtitle paragraph below the heading.
5. THE Subscription_Section SHALL display an email input field and a "Subscribe" button styled as a dark green pill, arranged inline on desktop and stacked on mobile.
6. THE Subscription_Section SHALL display social proof text "Join 12,000+ executives. Unsubscribe anytime." below the input row.
7. WHEN a user submits the subscription form, THE Subscription_Section SHALL display a visual acknowledgment (e.g., success message) without performing any backend API call, as backend integration is out of scope for this redesign.
8. WHEN the viewport width is less than 768px, THE Subscription_Section SHALL stack the email input and subscribe button vertically.

---

### Requirement 11: SEO Metadata

**User Story:** As a site owner, I want each newsletter page to have correct SEO metadata, so that search engines and social platforms can properly index and preview the content.

#### Acceptance Criteria

1. THE Archive_Page SHALL set the page `<title>` to `newsletter.seo.metaTitle` if present, otherwise to `newsletter.title`.
2. THE Archive_Page SHALL set the meta description to `newsletter.seo.metaDescription` if present, otherwise to `newsletter.excerpt`.
3. THE Archive_Page SHALL set Open Graph tags including `og:title`, `og:description`, `og:image` (resolved Cover_Image URL), `og:type` ("article"), and `og:article:published_time`.
4. THE Archive_Page SHALL set Twitter Card tags including `twitter:card` ("summary_large_image"), `twitter:title`, `twitter:description`, and `twitter:image`.
5. WHEN `newsletter.seo.keywords` is non-empty, THE Archive_Page SHALL set the meta keywords tag to the comma-joined keywords string.
6. THE Newsletter_Page SHALL apply the same SEO metadata rules as the Archive_Page, using the latest newsletter's data.

---

### Requirement 12: Responsive Design

**User Story:** As a site visitor using any device, I want the newsletter page to display correctly on mobile, tablet, and desktop, so that I can read comfortably regardless of screen size.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE Newsletter_Viewer SHALL reduce the hero heading font size to no smaller than 1.75rem and no larger than 2.5rem.
2. WHEN the viewport width is less than 768px, THE Newsletter_Viewer SHALL reduce article body padding to 24px horizontal.
3. WHEN the viewport width is less than 1024px, THE Newsletter_Page SHALL switch from the two-column layout to a single-column stacked layout.
4. WHEN the viewport width is less than 768px, THE Newsletter_Archive SHALL display the full list without internal scrolling constraints, allowing natural page scroll.
5. THE Newsletter_Viewer SHALL ensure all images within Rich_Content are constrained to 100% of their container width on all viewport sizes.
6. THE Subscription_Section SHALL be fully usable on touch devices with tap targets of at least 44×44px for interactive elements.

---

### Requirement 13: Page Routing and Data Fetching

**User Story:** As a site visitor, I want the newsletter URLs to resolve correctly and load quickly, so that I can access any edition reliably.

#### Acceptance Criteria

1. WHEN a user navigates to `/newsletter`, THE Newsletter_Page SHALL fetch all published newsletters via `getNewsletters()` and display the first item (most recently published) as the active edition.
2. WHEN a user navigates to `/newsletter/[year]/[month]`, THE Archive_Page SHALL find the newsletter matching the given year and month integers and display it.
3. IF no newsletter matches the requested year and month, THEN THE Archive_Page SHALL call Next.js `notFound()` to render the 404 page.
4. THE Newsletter_Page SHALL set `revalidate = 300` (5-minute ISR cache) for all newsletter data fetches.
5. THE Archive_Page SHALL set `revalidate = 300` for all newsletter data fetches.
6. WHEN the newsletter's `coverImage` value is an S3 key (not a full URL), THE Newsletter_Viewer SHALL resolve it to a full URL using `getS3ImageUrl` before rendering.
