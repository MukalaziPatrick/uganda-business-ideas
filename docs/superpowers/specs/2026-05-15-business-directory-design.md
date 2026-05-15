# Business Directory — Design Spec

**Date:** 2026-05-15
**Status:** Approved for implementation
**Project:** `uganda-business-ideas`

---

## 1. Vision

Add a business directory to `ugandabusinessideas.com` so users can search for real operating businesses in Uganda — restaurants, plumbers, salons, electricians, and more. This is the third pillar of the platform alongside Business Ideas and Jobs.

**Phase 1 (this spec):** Build the directory entirely within `uganda-business-ideas`. Businesses register here, search lives here, admin approves here.

**Phase 2 (future):** Upgrade to Approach 3 — add "View on LocateUG map" deep-links on business profiles so users can see pin-level maps via the existing `uganda-map` app.

**Long-term vision:** Both apps form a self-improving geospatial AI brain that learns which businesses thrive in which regions and improves recommendations over time. Signal columns (`view_count`, `whatsapp_clicks`, `contact_clicks`) are included in the schema now so the AI layer has data when we build it later.

---

## 2. Architecture

### New pages

```
app/
  businesses/
    page.tsx              ← search + region filter + listings
    [id]/page.tsx         ← public business profile
    register/page.tsx     ← submit your business form
  BusinessesClient.tsx    ← client component for search/filter/results
  BusinessRegisterForm.tsx ← client form component
```

### Homepage change

Add "Find a Business" as the third pillar entry point in the existing 3-pillar hero on `app/HomeClient.tsx`. The pillar links to `/businesses` and includes a search bar that navigates to `/businesses?q=<query>`.

### Admin

Pending businesses appear in `/admin` panel alongside existing jobs approval. No new admin page needed — extend the existing admin leads/jobs UI with a Businesses tab.

---

## 3. Database

### New Supabase table: `businesses`

```sql
create table public.businesses (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         text not null,
  region           text not null check (region in ('Central','Eastern','Northern','Western')),
  district         text not null,
  town             text,
  description      text check (char_length(description) <= 300),
  hours            text,
  whatsapp         text,
  phone            text,
  website          text,
  facebook         text,
  instagram        text,
  tiktok           text,
  -- AI signal columns (populated by client-side events, used by future AI layer)
  view_count       integer not null default 0,
  whatsapp_clicks  integer not null default 0,
  contact_clicks   integer not null default 0,
  status           text not null default 'pending'
                   check (status in ('pending','active','rejected')),
  created_at       timestamptz not null default now()
);

create index businesses_status_idx    on public.businesses(status);
create index businesses_region_idx    on public.businesses(region);
create index businesses_category_idx  on public.businesses(category);
create index businesses_district_idx  on public.businesses(district);
create index businesses_created_idx   on public.businesses(created_at desc);
```

**Constraint:** At least one of `whatsapp` or `phone` must be provided (enforced in form validation, not DB constraint).

### RLS policies

- Public `SELECT` on `status = 'active'` rows — no auth required
- Public `INSERT` allowed (anyone can submit a listing)
- Admin-only `UPDATE` / `DELETE` via existing `is_admin()` function

---

## 4. Pages

### 4.1 `/businesses` — Discovery page

**Server component** fetches initial active businesses (first 20, ordered by `created_at desc`).

**Client component `BusinessesClient`** handles:
- Text search input (searches `name`, `description`, `category` client-side on loaded results; server-side for full dataset)
- Region filter — Uganda SVG map (4 regions, real GeoJSON paths). Clicking a region filters results. Chips below map as mobile fallback.
- Category dropdown: All, Restaurant, Plumber, Electrician, Salon, Retail, Agriculture, Transport, Other
- Results grid: card per business showing name, category, district, WhatsApp button
- "Load more" pagination (20 per page)
- "List your business" CTA button → `/businesses/register`

### 4.2 `/businesses/[id]` — Profile page

**Server component** fetches business by ID. Returns 404 if not found or not active.

Increments `view_count` via a Supabase RPC on page load (fire-and-forget).

**Displays:**
- Name, category, region, district/town
- Description
- Opening hours
- WhatsApp button (increments `whatsapp_clicks` on tap)
- Call button (increments `contact_clicks` on tap)
- Social links: website, Facebook, Instagram, TikTok (show only fields that are filled)
- "Share this business" — copies URL to clipboard
- Breadcrumb: Businesses → [Name]

### 4.3 `/businesses/register` — Registration form

**Client component `BusinessRegisterForm`.**

**Required fields:**
- Business name
- Category (dropdown)
- Region (dropdown)
- District (dropdown, filtered by region)
- At least one of: WhatsApp number or phone number

**Optional fields:**
- Town
- Description (max 300 chars, live counter)
- Opening hours (text, e.g. "Mon–Fri 7am–9pm")
- Website URL
- Facebook handle/URL
- Instagram handle/URL
- TikTok handle/URL

**On submit:**
- Inserts row with `status = 'pending'`
- Shows success message: "Thanks! We'll review and publish your listing within 24 hours."
- No redirect — stays on page so owner can share the confirmation

---

## 5. Categories

```ts
const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Street Food",
  "Salon & Barbershop",
  "Plumber",
  "Electrician",
  "Retail Shop",
  "Agriculture & Farming",
  "Transport & Boda",
  "Health & Pharmacy",
  "Education & Tutoring",
  "Hotel & Accommodation",
  "Other",
];
```

---

## 6. Uganda Region Map

The SVG map on `/businesses` uses real Uganda GeoJSON boundary data. Implementation options (in order of preference):

1. **Bundle a simplified Uganda GeoJSON** as a static file (`public/uganda-regions.geojson`) converted to SVG paths at build time — no runtime fetch needed.
2. **Fetch from `uganda-map` Supabase** via the existing `get_boundaries_geojson` RPC (level 1 = country outline, grouped into 4 regions) — reuses real data but adds cross-project dependency.

Preferred: option 1. Source the GeoJSON from Natural Earth or GADM at ADM1 level, simplify with mapshaper, group Uganda's 15 sub-regions into the 4 administrative regions (Central, Eastern, Northern, Western), export as SVG paths.

Mobile fallback: horizontal chip row (same as the parked `region-map-filter` branch pattern).

---

## 7. Admin Approval

Extend `/admin` with a **Businesses tab** showing pending businesses in a table:

| Column | Value |
|--------|-------|
| Name | business name |
| Category | category |
| District | district |
| Contact | whatsapp / phone |
| Submitted | created_at |
| Actions | Approve / Reject |

Approve → sets `status = 'active'`
Reject → sets `status = 'rejected'`

Uses existing `is_admin()` RLS function. No new auth work needed.

---

## 8. Homepage Integration

In `app/HomeClient.tsx`, update the third pillar (currently linking to LocateUG) to:
- Point to `/businesses` instead of external LocateUG URL
- Add a small inline search bar in the pillar card
- Typing and hitting enter navigates to `/businesses?q=<query>`

---

## 9. Data Flow Summary

```
Customer:
  Homepage search → /businesses?q=restaurants → region filter → business card → /businesses/[id] → WhatsApp tap

Business owner:
  /businesses → "List your business" → /businesses/register → submit → pending → admin approves → live

Admin:
  /admin → Businesses tab → review pending → approve/reject
```

---

## 10. Out of Scope (Phase 1)

- Pin-level map (deferred to Phase 2 / Approach 3 upgrade)
- Business owner accounts / claimed listings
- Reviews or ratings
- Photo uploads
- Payment for featured listings
- Geospatial AI recommendation engine (tracked separately — signal columns included in schema for future use)
