# UI/UX Polish Design Spec
**Project:** Uganda Business Hub (`d:/projects/uganda-business-ideas`)  
**Date:** 2026-05-14  
**Status:** Approved — ready for implementation planning

---

## Overview

Polish the UI/UX of the Uganda Business Hub — a dual-audience Next.js platform serving Ugandan entrepreneurs (business ideas, guides) and job seekers/employers (jobs platform). All 10 core features are built and TypeScript-clean. This spec covers layout, typography, spacing, and component improvements only. **Colors are not changed** — the existing dark green palette is kept exactly as-is.

**Priority order:** Homepage → Ideas page → Jobs page

---

## Design Principles

- **Keep existing colors.** The dark green + gold chip palette is intentional and approved. No recoloring.
- **Warm and local.** Spacing, typography, and card shapes should feel community-driven and approachable.
- **Dual audience.** Every page must be clear for both entrepreneurs and job seekers without confusion.
- **Mobile-first.** Primary users are on mobile (375px+). Desktop is secondary.
- **Fast and lean.** No heavy animations. No new dependencies unless essential.

---

## Typography

- **Headlines (h1, h2, section titles):** Georgia serif — already present in the app, lean into it
- **Body + UI text:** System font stack (`-apple-system, 'Segoe UI', sans-serif`)
- **Eyebrow labels (uppercase category labels):** `font-size: 10-11px`, `letter-spacing: 1.5px`, `font-weight: 700`
- **No new font imports** — use what's already loaded

---

## Page 1: Homepage (`app/page.tsx` + `HomeClient.tsx`)

### Nav
- **Desktop:** Logo left · page links centre · "Post a Job" CTA button right (uses existing green/gold)
- **Mobile:** Logo left · hamburger icon right · drawer slides in from right with all nav links
- Hamburger icon: standard `☰` — no library needed, plain button
- Active page link gets underline or gold dot indicator

### Hero Section
- Full-width dark green gradient background (existing color)
- **Eyebrow text:** "Uganda's Business Hub" — small uppercase, gold, letter-spaced
- **H1:** Georgia serif, large (32px mobile / 48px desktop), gold color — "Grow Your Business. Find Your Next Job."
- **Subtext:** 1–2 lines, white at 80% opacity, explains the platform in plain language
- **Two CTAs side by side:**
  - Primary: "Browse Ideas" — gold background, dark text
  - Secondary: "Find Work" — outline style, white border, white text
- **Social proof badge** below CTAs: pill shape, semi-transparent — counts pulled dynamically from Supabase (ideas count, jobs count), format: "50 Ideas · 1,200+ Jobs · All Uganda Districts". Do not hardcode numbers.

### Pillar Cards (below hero)
- 2-column grid on all screen sizes
- Each pillar: icon (emoji) + heading + 1-line description + CTA button
- Left pillar: "Post a Job" → links to `/jobs/post`
- Right pillar: "Find Work" → links to `/jobs`
- Background: light warm off-white (`#f5f0e8` or existing light bg)

### Featured Ideas Section
- Section heading: Georgia serif "💡 Featured Business Ideas" + "View all →" link right-aligned
- **Magazine layout:**
  - 1 featured card: full-width, dark green background, serif headline in gold, short description, startup cost, "Read More" button
  - Below it: 2-column grid of 2 smaller idea cards (emoji icon, name, startup cost, category tag)
- Shows 1 featured + 2 grid cards = 3 ideas total on homepage
- "View all 500+ →" link leads to `/ideas`

### Jobs Teaser Section
- Section heading: "💼 Latest Job Listings" + "See all jobs →" link
- 3 horizontal job rows (same card style as Jobs page — see below)
- Each row: icon · job title · location/date · salary · urgent tag (if applicable)
- Background: slightly different from ideas section to create visual separation (alternate between white and off-white)

### Footer
- Dark green background (existing)
- Logo left, all page links, copyright line
- Links: Ideas · Jobs · Guides · Blog · About · Contact · Advertise

---

## Page 2: Ideas Page (`app/ideas/IdeasDiscoveryClient.tsx`)

### Header
- Page title: "Business Ideas" with eyebrow "💡 Discover"
- Stats row: "50 Ideas · 5 Categories · Updated weekly" — small chips

### Search + Filter Bar
- Full-width search input with magnifier icon
- Filter chips below: All · Agriculture · Digital · Food · Services · Retail
- Active chip uses existing green+gold style (already in app — keep it)

### Idea Cards — Magazine Grid
- **Featured card** (first item or editor-picked): full-width, dark green background, Georgia serif headline, description, startup cost badge, "Read More" button
- **Grid cards** (remaining): 2-column grid, each card has:
  - Emoji icon (large, top)
  - Idea name (bold, dark green)
  - 1-line description
  - Bottom row: startup cost (bold) + category tag chip
  - Tap anywhere → goes to `/ideas/[slug]`
- Empty state: friendly illustration placeholder + "No ideas match your search" message

### Individual Idea Page (`app/ideas/[slug]/page.tsx`)
- Breadcrumb: Home > Ideas > [Idea Name]
- Large hero area with idea name in Georgia serif
- Structured sections: Overview · Startup Cost · How to Start · Profit Potential · Real Ugandan Examples
- WhatsApp share button (share the idea URL)
- "← Back to Ideas" link

---

## Page 3: Jobs Page (`app/jobs/JobsClient.tsx`)

### Header
- Page title: "Find Work in Uganda" with two action buttons top-right:
  - "Post a Job" → `/jobs/post`
  - "Register as Worker" → `/jobs/worker/new`

### Search + Filter Bar
- Full-width search input
- Filter chips: All · Kampala · Driving · Agriculture · Tech · Construction · Domestic

### Job Cards — Horizontal List (Style A)
Each card is a full-width row containing:
- **Left:** Emoji icon in a rounded square (dark green background)
- **Centre:** Job title (bold) · Location + date posted (small grey)
- **Tags row:** category chip + "Urgent" chip (amber/gold) if applicable
- **Right:** Daily/monthly salary (bold, dark green) · "Apply" button (gold)
- Card background: white, subtle shadow, rounded corners
- Tap card → expand or go to contact/apply flow

### Empty State
- Friendly message: "No jobs posted yet in this category"
- CTA: "Be the first to post a job →"

### Post a Job Form (`PostJobForm.tsx`)
- Progress indicator: Step 1 of 3 · Step 2 of 3 · Step 3 of 3
- Clear field labels, helpful placeholder text
- Error messages in plain English (not technical)
- Success screen: confirmation + "Share this job" WhatsApp button

### Worker Registration Form (`WorkerForm.tsx`)
- Same progress indicator pattern as Post a Job
- Success screen: worker profile created + "Share your profile" WhatsApp button

### Worker Profile Page (`app/jobs/worker/[id]/page.tsx`)
- Breadcrumb: Home > Jobs > Worker Profile
- WhatsApp contact button (prominent, green)
- Contact fallback: phone number displayed if WhatsApp not available

---

## Component Patterns (apply globally)

### Buttons
- **Primary:** Existing gold/green — no change to color, just ensure consistent `border-radius: 8px` and `padding: 10px 20px`
- **Secondary/Outline:** Same border-radius, border uses existing green
- **Small (chips/tags):** `border-radius: 20px`, `padding: 4px 12px`, `font-size: 12px`

### Cards
- `border-radius: 12px`
- `box-shadow: 0 2px 8px rgba(0,0,0,0.06)`
- Background: white or off-white (`#f9f7f4`)
- No hard borders — shadow only

### Section Headers
- Georgia serif heading left-aligned
- "View all →" or "See all →" link right-aligned, same line
- 16px bottom margin before content

### Chips / Filter Tags
- Keep existing green+gold active state — it's already correct
- Inactive: white background, green border, green text
- Active: dark green background, gold text

---

## Mobile-Specific Rules

- All multi-column grids (except 2-col idea grid) collapse to single column at `< 640px`
- Ideas 2-column grid stays 2-col on mobile — cards are compact enough
- Sticky bottom CTA on homepage only: "Browse Ideas" button, appears after user scrolls past hero
- Hamburger nav drawer: full-height, dark green background, links stacked vertically with 48px tap targets

---

## Files to Change

| File | Changes |
|------|---------|
| `app/HomeClient.tsx` | Hero, pillars, ideas teaser, jobs teaser, footer, hamburger nav |
| `app/ideas/IdeasDiscoveryClient.tsx` | Magazine grid layout, search/filter bar |
| `app/ideas/[slug]/page.tsx` | Breadcrumb, WhatsApp share, structured sections |
| `app/jobs/JobsClient.tsx` | Horizontal card style, empty state |
| `app/jobs/post/PostJobForm.tsx` | Progress indicator, error messages, success screen |
| `app/jobs/worker/new/WorkerForm.tsx` | Progress indicator, success + share screen |
| `app/jobs/worker/[id]/page.tsx` | Breadcrumb, WhatsApp button, contact fallback |
| `app/layout.tsx` | Nav component (hamburger + desktop links) |
| `app/globals.css` | Typography tokens, card/button base styles |

---

## Out of Scope

- No new pages
- No backend/API changes
- No color changes
- No new npm packages unless unavoidable
- Businesses tab (`/businesses`) — deferred, needs LocateUG API first
