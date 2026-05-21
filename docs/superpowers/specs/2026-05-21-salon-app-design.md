# Salon App — Design Spec
**Date:** 2026-05-21  
**Project:** Business Yoo (uganda-business-ideas)  
**Status:** Approved

---

## 1. Overview

A salon directory added as a new section inside Business Yoo at `/salons`. Customers can find salons and mobile stylists near them, browse services with photos and prices, and contact via WhatsApp or call. Salon owners register their own listings. Monetisation via a paid Featured tier.

Serves both men and women. Booking (in-app appointments) is out of scope for Phase 1 — WhatsApp/call contact only.

---

## 2. Goals

- Help customers find salons near them by location, style/service, and gender
- Help salon owners and mobile stylists reach customers directly
- Give customers confidence through portfolio photos and transparent pricing
- Generate revenue via Featured listings (UGX 50,000–100,000/month)

---

## 3. Pages

| Route | Purpose |
|-------|---------|
| `/salons` | Browse & search all salons |
| `/salons/[id]` | Individual salon profile |
| `/salons/register` | Salon owner self-registration |
| `/admin/salons` | Admin: approve, manage, toggle featured |

---

## 4. Browse Page (`/salons`)

### Filters
- **Location** — text search by district or town
- **Style/service** — text search matched against `salon_services.name`
- **Gender** — Men / Women / All (default: All)
- **Type** — Salon / Mobile / All (default: All)

### Results
- Cards displayed in a responsive grid (same pattern as `/businesses`)
- Featured salons always appear first, marked with a gold ⭐ FEATURED badge
- Each card shows: cover photo, name, type+gender tag, district, starting price of cheapest service, WhatsApp button
- Pagination: load 20 at a time, "Load more" button

### SEO
- Page title: "Find Salons & Barbers in Uganda | Business Yoo"
- Canonical URL, OpenGraph tags (same pattern as `/businesses`)
- `revalidate = 60`

---

## 5. Salon Profile Page (`/salons/[id]`)

### Sections (top to bottom)

**Hero**
- Cover photo as background
- Salon name, type (Men/Women/Unisex), district
- Featured badge if applicable

**Quick Actions**
- WhatsApp button (opens `wa.me/` link)
- Call button (opens `tel:` link)
- Directions button (opens Google Maps with salon address)

**Info Strip**
- Opening hours
- District/town (or service area for mobile stylists)
- Walk-in availability (yes/no)

**Services & Prices**
- Gender filter tabs: All / Men / Women
- Each service row: photo thumbnail (64×64), service name, gender tag, duration, price range in UGX
- Services ordered by `sort_order`

**Portfolio Gallery**
- 3-column photo grid
- Shows first 6 photos, "+N more" for the rest (tap to view full gallery)

**About**
- Short text description of the salon

---

## 6. Registration Form (`/salons/register`)

Multi-step form, 4 steps:

**Step 1 — Basic Info**
- Salon name (required)
- Type: Salon or Mobile stylist (required)
- Gender served: Men / Women / Unisex (required)
- District & town — or service area text if mobile (required)
- WhatsApp number (required)
- Phone number (optional)
- Opening hours (e.g. "Mon–Sat 8am–7pm") (required)
- Short description / about (required, max 300 chars)

**Step 2 — Services**
- Add services one by one
- Each service: name, gender tag, price from, price to, duration (minutes), photo upload
- Minimum 1 service, maximum 20
- Photo upload: optional per service (stored in Supabase Storage)

**Step 3 — Portfolio**
- Upload 3–10 photos of work
- Select cover photo from uploaded photos

**Step 4 — Submit**
- Submission sets `status = pending`
- Owner sees confirmation message: "Your listing is under review. We'll contact you on WhatsApp once approved."
- Admin notified (manual process for now — admin checks `/admin/salons` daily)

---

## 7. Admin Panel (`/admin/salons`)

Protected by existing Business Yoo admin auth gate (no new auth needed).

- **Pending tab** — list of salons awaiting approval; Approve / Reject buttons
- **Active tab** — list of live salons; Toggle Featured on/off; Edit button
- **Edit** — admin can update any field on any salon

---

## 8. Data Model (Supabase)

### `salons` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `slug` | text unique | URL-safe name |
| `type` | enum | `salon`, `mobile` |
| `gender` | enum | `men`, `women`, `unisex` |
| `district` | text | |
| `town` | text | nullable |
| `region` | text | Uganda region |
| `service_area` | text | nullable, for mobile stylists |
| `whatsapp` | text | |
| `phone` | text | nullable |
| `opening_hours` | text | e.g. "Mon–Sat 8am–7pm" |
| `walkin` | boolean | default true |
| `about` | text | max 300 chars |
| `cover_photo_url` | text | nullable |
| `status` | enum | `pending`, `active`, `featured` |
| `created_at` | timestamptz | |

### `salon_services` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `salon_id` | uuid FK → salons.id | |
| `name` | text | e.g. "Box Braids" |
| `gender` | enum | `men`, `women`, `unisex` |
| `price_from` | integer | UGX, nullable |
| `price_to` | integer | UGX, nullable |
| `duration_minutes` | integer | nullable |
| `photo_url` | text | nullable |
| `sort_order` | integer | default 0 |

### `salon_portfolio` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `salon_id` | uuid FK → salons.id | |
| `photo_url` | text | |
| `caption` | text | nullable |
| `sort_order` | integer | default 0 |

### Indexes
- `salons(status)` — filter active/featured
- `salons(district)` — location search
- `salon_services(salon_id)` — join
- `salon_services(name)` — style/service text search

---

## 9. Search Logic

Browse page queries:

1. Filter `salons` by `status IN ('active', 'featured')`
2. If gender filter active: `AND gender IN (selected, 'unisex')`
3. If type filter active: `AND type = selected`
4. If location filter: `AND (district ILIKE %q% OR town ILIKE %q% OR service_area ILIKE %q%)`
5. If style/service filter: join `salon_services` where `name ILIKE %q%`
6. Order: `featured` first, then `created_at DESC`

---

## 10. Monetisation

- **Free tier** — `status = active`: basic listing, all features
- **Featured tier** — `status = featured`: gold badge, appears first in all results
- **Pricing** — UGX 50,000–100,000/month (exact price TBD by Mukalazi)
- **Payment collection** — manual for now (MTN Mobile Money, owner pays Mukalazi directly)
- Admin toggles featured on/off in `/admin/salons`

---

## 11. Launch Strategy

**Phase 1 — Seed (before public launch):**
- Mukalazi manually adds 10–20 real Kampala salons via admin panel or Supabase dashboard
- Covers a mix: men's barbershops, women's salons, unisex salons, 1–2 mobile stylists
- Self-service registration open from day one for new owners

**Phase 2 — Booking (future, not in this spec):**
- In-app time slot booking
- Stylist calendars
- MTN/Airtel Mobile Money payment
- Booking confirmation & reminders

---

## 12. Tech Stack

Follows existing Business Yoo patterns exactly:
- **Framework:** Next.js 14 App Router
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (for photos)
- **Styling:** Tailwind CSS, same color palette (`#1C3A2A`, `#F5C842`, `#f5f0e8`)
- **Deployment:** Vercel

No new dependencies required.
