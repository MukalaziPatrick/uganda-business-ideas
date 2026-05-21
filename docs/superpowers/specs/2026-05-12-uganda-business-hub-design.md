# Uganda Business Hub — Design Spec
**Date:** 2026-05-12  
**Status:** Approved for implementation  
**Project:** `uganda-business-ideas` (hub) + `uganda-map` (LocateUG, already built)

---

## 1. Vision

Transform `ugandabusinessideas.com` from a business-ideas-only site into a three-pillar Uganda economic platform:

| Pillar | What it does | Where it lives |
|---|---|---|
| 💡 Business Ideas | Browse 50+ ideas by budget & category | `uganda-business-ideas` (existing) |
| 📍 Find Businesses | Map of real Uganda businesses near you | `uganda-map` (LocateUG, already built) |
| 💼 Find Jobs | Job board + worker profiles, Uganda-specific | `uganda-business-ideas` (new /jobs page) |

**Phase goal (this spec):** Implement pillars 1 + 3 in `uganda-business-ideas`. Pillar 2 links out to LocateUG. Match design language across both apps so they feel like one platform.

**Future goal (Phase 2):** Full recruitment tools, employer accounts, worker ratings.

---

## 2. Architecture

### Apps involved
- **`uganda-business-ideas`** — Next.js 14, Tailwind, Supabase. This is the hub. All jobs data lives here.
- **`uganda-map`** (LocateUG) — Next.js 14, Tailwind, Supabase (separate project `qhgenevbficuknjorcce`). Already complete. Linked from the hub, not merged.

### New pages in `uganda-business-ideas`
```
app/
  page.tsx              ← redesigned homepage (3-pillar hero)
  jobs/
    page.tsx            ← job board (browse jobs tab + worker profiles tab)
    post/page.tsx       ← post a job form
    worker/
      new/page.tsx      ← create worker profile
      [id]/page.tsx     ← public worker profile
```

### New Supabase tables (in `uganda-business-ideas` Supabase project)
```sql
jobs          — job listings posted by employers
worker_profiles — job seekers registering their skills
```

### Data flow
- Job seeker browses `/jobs` → filters by skill + district → clicks "Apply on WhatsApp" → goes directly to employer's WhatsApp
- Employer visits `/jobs/post` → fills form (required + optional fields) → pays via WhatsApp (manual for now) → job goes live after admin approval
- Worker visits `/jobs/worker/new` → fills profile → published immediately (no approval needed)
- Employer browses Worker Profiles tab → contacts worker via WhatsApp or call

---

## 3. Homepage Redesign

### Hero — Three Pillars
Replace current hero with a full-width three-column pillar section:

| Column | Color | CTA |
|---|---|---|
| 💡 Business Ideas | Green (`#16a34a`) | "Browse Ideas" → scrolls to ideas grid |
| 📍 Find Businesses | Blue (`#2563eb`) | "Open Map →" → opens LocateUG URL in new tab |
| 💼 Find Jobs | Purple (`#7c3aed`) | "Browse Jobs" → `/jobs` |

### Below the pillars (same page)
1. **Ideas section** — existing filter + cards grid (unchanged functionality)
2. **Jobs teaser strip** — 3 most recent job listings, purple theme, "View all jobs →" link
3. **WhatsApp CTA banner** — "List your business or post a job via WhatsApp"

### Nav update
Add "Jobs" link to the existing nav. Nav order: Ideas | Businesses | Jobs | Blog | Guides

---

## 4. Jobs Page (`/jobs`)

### Layout
Two tabs on a single page:
- **Tab 1: Browse Jobs** (default)
- **Tab 2: Worker Profiles**

### Tab 1 — Browse Jobs

**Filters (top of page):**
- Skill search (free text, e.g. "carpenter", "nurse", "boda")
- District dropdown (all 135 Uganda districts)

**Job card — always shown:**
- Job title
- Skill category (from Uganda skills list — see §6)
- District + Town/Stage
- Employer name
- Contact method (WhatsApp / Call / Walk-in)
- "Apply" button → opens WhatsApp or tel: link
- Posted date
- Featured badge (paid listings shown first, purple border)

**Job card — employer's optional choices (shown only if employer selected them):**
- Pay amount + period (daily / weekly / monthly in UGX)
- Job type: Permanent / Casual / Contract
- Gender preference
- Minimum education (None / PLE / UCE / UACE / Certificate / Diploma / Degree)
- Accommodation provided (Yes / No / Negotiable)
- Food provided (Yes / No / Negotiable)
- Languages required

### Tab 2 — Worker Profiles

**Filters:**
- Skill search
- District dropdown
- Availability toggle (Available now / All)

**Worker profile card — always shown:**
- Name (first name + last initial)
- Primary skill(s) — up to 3
- District + Town
- Availability status (Available / Not available)
- Contact: WhatsApp button + Call button

**Worker profile card — worker's optional choices:**
- Years of experience
- Pay expectation (UGX + period)
- Job type preference (Casual / Contract / Permanent)
- Education level
- Languages spoken (Luganda, English, Swahili, etc.)
- Own tools (Yes / No)
- Willing to travel (Yes / No)
- Short bio (max 100 characters)

---

## 5. Post a Job (`/jobs/post`)

### Form fields

**Required (always):**
- Job title (free text, max 60 chars)
- Skill category (dropdown — Uganda skills list)
- District (dropdown)
- Town / Stage / Area (free text)
- Contact method: WhatsApp number / Phone / Walk-in address (at least one)

**Optional (employer picks from checklist):**
- Pay amount + period
- Job type (Permanent / Casual / Contract)
- Gender preference
- Minimum education
- Accommodation provided
- Food provided
- Languages required
- Additional description (max 300 chars)

**Submission flow:**
1. Employer fills form on `/jobs/post`
2. Row inserted into `jobs` table with `status = 'pending'`
3. Confirmation screen: "Your job will go live after review. To speed up, send UGX 20,000 via WhatsApp for featured placement."
4. Admin reviews in existing admin panel → approves → `status = 'active'`

---

## 6. Worker Profile (`/jobs/worker/new`)

**Required:**
- Full name
- Primary skill (dropdown — Uganda skills list)
- District + Town
- Contact: WhatsApp number and/or phone number

**Optional (worker picks from checklist):**
- Additional skills (up to 2 more)
- Years of experience
- Pay expectation + period
- Job type preference
- Education level
- Languages spoken
- Own tools
- Willing to travel
- Short bio (max 100 characters)

**Submission flow:**
1. Worker fills form → row inserted into `worker_profiles` table, `status = 'active'` immediately
2. Worker gets confirmation with link to their public profile
3. Worker can share profile link on WhatsApp

---

## 7. Database Schema

### `jobs` table
```sql
CREATE TABLE jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  skill_category text NOT NULL,
  district      text NOT NULL,
  town          text,
  employer_name text NOT NULL,
  contact_whatsapp text,
  contact_phone text,
  contact_walkin text,
  -- optional fields (null if employer didn't select)
  pay_amount    integer,
  pay_period    text,           -- 'daily' | 'weekly' | 'monthly'
  job_type      text,           -- 'permanent' | 'casual' | 'contract'
  gender_pref   text,           -- 'male' | 'female' | 'any'
  min_education text,
  accommodation text,           -- 'yes' | 'no' | 'negotiable'
  food_provided text,
  languages     text[],
  description   text,
  -- meta
  status        text DEFAULT 'pending',  -- 'pending' | 'active' | 'rejected'
  featured      boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  expires_at    timestamptz DEFAULT now() + interval '30 days'
);
```

### `worker_profiles` table
```sql
CREATE TABLE worker_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  skill_primary   text NOT NULL,
  skills_extra    text[],
  district        text NOT NULL,
  town            text,
  contact_whatsapp text,
  contact_phone   text,
  -- optional
  experience_years integer,
  pay_expectation  integer,
  pay_period       text,
  job_type_pref    text[],
  education        text,
  languages        text[],
  own_tools        boolean,
  willing_to_travel boolean,
  bio              text,
  -- meta
  available        boolean DEFAULT true,
  status           text DEFAULT 'active',
  created_at       timestamptz DEFAULT now()
);
```

---

## 8. Uganda Skills List (seed data)

Categories and example skills (not exhaustive — expand as needed):

| Category | Skills |
|---|---|
| Construction & Trades | Carpenter, Mason, Painter, Plumber, Electrician, Welder, Roofer, Tiler |
| Transport | Boda rider, Taxi driver, Truck driver, Tuk-tuk driver |
| Domestic | House cleaner, Cook, Nanny/Babysitter, Gardener, Laundry |
| Healthcare | Nurse, Clinical officer, Lab technician, Pharmacist, Midwife |
| Security | Security guard, Watchman |
| Agriculture | Farm worker, Irrigation tech, Poultry worker, Dairy worker |
| Hospitality | Waiter, Bartender, Hotel receptionist, Chef |
| Digital & Office | Data entry, Receptionist, Accountant, Graphic designer, Social media |
| Retail | Shop attendant, Cashier, Market vendor |
| Education | Teacher (primary), Teacher (secondary), Tutor |
| Beauty | Hairdresser, Barber, Nail technician, Makeup artist |

---

## 9. Monetisation

| Revenue stream | How it works | Price |
|---|---|---|
| Featured job listing | Employer pays → job shown first with purple border + ⭐ badge | UGX 20,000 per post |
| Featured business listing | Business pays monthly → shown first in LocateUG results | UGX 50,000–200,000/month |

**Payment flow (Phase 1 — manual):**
- All payments collected via WhatsApp (admin confirms manually)
- Admin sets `featured = true` in Supabase after payment confirmed
- No payment gateway needed in Phase 1

---

## 10. LocateUG Integration

- "Find Businesses" pillar on homepage links to LocateUG URL (opens new tab)
- LocateUG URL to be confirmed once deployed to Vercel (currently `http://localhost:3000/map`)
- Both apps use identical nav style, color tokens, and font so they feel like one platform
- LocateUG embed widget (`/embed/[tag]`) available for future use on the hub if needed

---

## 11. What Is NOT in This Spec

- User accounts / login on the hub (Phase 2)
- In-app payment gateway (Phase 2)
- Employer dashboard / job management (Phase 2)
- Recruitment tools / applicant tracking (Phase 3 — future vision C)
- Merging `uganda-map` into this codebase (not planned)
- Automated scraping of registered businesses (manual admin entry only for now)
