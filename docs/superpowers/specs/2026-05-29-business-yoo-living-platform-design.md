# Business Yoo — Living Platform Design Spec
**Date:** 2026-05-29  
**Status:** Approved for implementation  
**Author:** Brainstorming session — Patrick Mukalazi + Ssenkali

---

## 1. Vision

Business Yoo becomes **Uganda's opportunity platform** — one brand, six verticals, one Supabase database, powered by an AI + n8n nervous system that keeps everything alive automatically.

> "Business Yoo — Uganda's platform for land, work, business, and opportunity."

The platform stops being just a business ideas site. Each vertical is a real product that earns revenue independently. The `/land` vertical (SafeLands UG) is the flagship launch — a verified land marketplace combining Zillow's property discovery UX, Google Earth's map intelligence, and Felt's approachable sharing model.

---

## 2. Architecture — Hub + Satellites

### Decision
Option B: Hub + Satellites. Business Yoo is the consumer-facing hub. SafeLands Admin stays as a separate surveyor back-office. A sync API pushes verified listings into Business Yoo's Supabase.

### System Map

```
BUSINESS YOO (consumer hub)          SAFELANDS ADMIN (back-office)
Next.js + Supabase + Vercel          Next.js + Neon + Clerk + Vercel
businessyoo.lugandastudio.com        smart-surveyor-kohl-sooty.vercel.app

/ideas                               Job management
/businesses                          Boundary imports
/salons                              Verification stages
/travel                              PDF report generation
/jobs                                Trust score assignment
/land  ← NEW                         ↓
/apps  ← HOLDING HUB         POST /api/land/sync (on verification)
         ↑                           ↓
         └────────── Supabase ←──────┘
                    land_* tables
                         ↓
                    n8n (Railway)
                    6 automated workflows
```

### Key Principle
SafeLands Admin is the professional tool. Business Yoo `/land` is the public-facing marketplace. They share data via one sync API call. Neither depends on the other's codebase.

---

## 3. The Six Verticals

| Route | Name | Purpose | Revenue |
|---|---|---|---|
| `/land` | SafeLands UG | Verified land marketplace + map intelligence | UGX 10k/assisted check · agent subscriptions |
| `/businesses` | Business Directory | Find and list real Ugandan businesses | Featured listings · ads |
| `/ideas` | Business Ideas | 48 curated ideas + AI pitch generator | Pitch generator · guides |
| `/salons` | Salon Finder | Find nearby salons, book via WhatsApp | Featured slots · bookings |
| `/travel` | ZuulaUganda | Local tourism, destinations, stays | Booking fees · promoted stays |
| `/jobs` | Jobs Board | Post and find jobs, worker profiles | Job posting fees · CV access |

### Homepage Rule
**Do NOT modify the homepage** (`app/page.tsx` or `HomeClient.tsx`) during this implementation. Patrick is deciding the multi-app homepage navigation strategy. All new verticals get their own routes. The `/apps` hub serves as the internal holding page.

---

## 4. The /land Module

### Pages

| Route | Purpose |
|---|---|
| `/land` | Hero + trust strip + featured verified listings + district browse |
| `/land/browse` | Zillow-style split: map left + listing grid right, filter chips, draw-on-map search |
| `/land/browse/[id]` | Full listing detail + trust panel + Mapbox map with all layers + WhatsApp CTA + AI chat bubble + assisted check CTA |
| `/land/verify/[qr]` | QR trust certificate — title status, surveyor stage, parcel summary, risk notes. No login required. |
| `/land/ask` | Full AI research chat — ask anything about Ugandan land |
| `/land/guides` | AI-generated articles — planting guides, district spotlights, title explainers |
| `/land/check` | Paid assisted land check — UGX 10,000 / 24hr. MTN/Airtel + WhatsApp fallback |
| `/land/agents` | Verified agents directory — profile, listings, WhatsApp contact |

### /apps Hub Page

Lives at `/apps`. Not linked from homepage. Internal nav to all verticals while homepage strategy is decided. Shows 6 cards: icon + name + tagline + link. Can be shared with testers and partners.

---

## 5. Map Experience

### Philosophy
Inspired by Google Earth Pro basemap modes. Users never see raw GIS controls. Three preset modes + custom panel.

### Map Modes
- **Clean** — Satellite only, no overlays. For visual inspection.
- **Explore** — Satellite + roads + labels + nearby places. Default mode.
- **Full** — Everything on: roads, plot boundaries, water, terrain, 3D buildings, places, transport, planting zones, district borders.
- **Custom** — User toggles individual layers.

### Layer Toggles
| Layer | Icon | Default |
|---|---|---|
| Satellite imagery | 🛰 | On |
| Roads | 🛣 | Explore+ |
| Plot boundaries | 📐 | Full/Custom |
| Water bodies | 💧 | Full/Custom |
| Terrain/elevation | ⛰ | Full/Custom |
| 3D buildings | 🏗 | Custom only |
| Nearby places | 🏫 | Explore+ |
| Transport | 🚌 | Full/Custom |
| Planting zones | 🌿 | Custom only |
| District borders | 🗺 | Full/Custom |

### Mobile Map UX
- Full-screen map with floating controls
- Layer panel slides up as a bottom sheet
- Large tap targets (min 44px)
- Draw-on-map search: user draws polygon to define search area
- Map pin clusters for dense listing areas

### Reference Products
- **Zillow**: map + listing split layout, filter chips, draw-on-map, save search, listing cards
- **Google Earth**: basemap modes (Clean/Explore/Everything/Custom), 3D buildings toggle, terrain
- **Felt**: friendly layer controls in plain language, link-based sharing, shareable trust page

---

## 6. AI Land Assistant

### Two Modes

**Chat Bubble (listing pages)**
- Floating bottom-right corner
- Knows the current listing (listing ID passed as context)
- Handles: "Is this good for maize?", "What's the title risk?", "How do I visit this land?", "How do I do an assisted check?"

**Full Research Page (/land/ask)**
- Full chat UI, no listing context
- Answers general Uganda land questions
- Powered by Claude via OpenRouter

### Training (System Prompt Context)
Injected at runtime:
- Uganda land tenure types: Mailo, Freehold, Leasehold, Customary
- Title checking process: MLHUD portal, UgNLIS steps
- District planting seasons: bimodal (Mar–May, Sep–Nov); northern Uganda (Apr–Jun)
- Current listing data from Supabase (when on listing page)
- Verified agent contact info
- Assisted check pricing and process (UGX 10,000 / 24hr)

### Model
Claude via OpenRouter (`anthropic/claude-sonnet-4-6` or best available). Streaming responses for chat feel.

---

## 7. The Living System — 6 n8n Workflows

Deployed on Railway n8n instance (`https://n8n-production-c3c3.up.railway.app`).

### Workflow 1: Listing Sync
- **Trigger:** Webhook from SafeLands Admin on listing verification
- **Actions:** Upsert land_listings in Supabase · upsert land_agents · generate qr_token · trigger AI insights workflow · send WhatsApp to agent ("Your listing is live at [url]")
- **Returns:** listing URL + QR certificate URL to SafeLands Admin

### Workflow 2: AI Listing Insights (Daily)
- **Trigger:** 6:00 AM EAT every day
- **Actions:** Fetch listings with no insight or insight older than 7 days · for each, call Claude via OpenRouter · generate farming suitability, access road quality, nearby infrastructure notes, risk notes · save to land_insights table
- **Model:** Claude via OpenRouter

### Workflow 3: Content Engine (Weekly)
- **Trigger:** Monday 7:00 AM EAT
- **Actions:** Pick content type (rotate: district spotlight / planting guide / title explainer / land buying tips) · Claude writes full article · save to land_content table · auto-published to /land/guides

### Workflow 4: Planting Season Alerts (Seasonal)
- **Trigger:** February 15 + August 15 each year
- **Actions:** Claude generates season-specific farming advice per district · update planting zone data · notify users with saved farming-use searches via WhatsApp · publish seasonal guide to /land/guides

### Workflow 5: Payment + Assisted Check
- **Trigger:** User submits assisted check request
- **Actions:** Initiate Flutterwave (primary) MTN or Airtel Mobile Money payment — Pesapal as fallback if Flutterwave Uganda onboarding is blocked · on success: create land_payments record (24hr expiry) · WhatsApp to buyer ("Your check is active. Agent will contact you.") · WhatsApp to assigned agent · fallback: if payment fails, offer WhatsApp manual collection

### Workflow 6: Trust Score Refresh (Weekly)
- **Trigger:** Sunday midnight EAT
- **Actions:** Recalculate trust score for every listing · factors: verification stage (40%), agent rating (20%), inquiry response time (20%), title status age (20%) · update land_listings.trust_score · listings re-ranked on browse page

---

## 8. Database Schema (Supabase)

### land_listings
```sql
id uuid primary key default gen_random_uuid()
title text not null
district text not null
parish text
coordinates point  -- (lat, lng)
size_acres numeric
price_ugx bigint
land_type text  -- mailo | freehold | leasehold | customary
intended_use text  -- farming | residential | commercial | mixed
title_status text  -- clean | caution | pending | unknown
verification_stage text  -- unverified | submitted | in-review | verified
trust_score integer  -- 0-100
qr_token text unique  -- powers /land/verify/[qr]
agent_id uuid references land_agents(id)
photos text[]
is_featured boolean default false
safelands_id text unique  -- FK to SafeLands Neon DB
created_at timestamptz default now()
verified_at timestamptz
updated_at timestamptz default now()
```

### land_agents
```sql
id uuid primary key default gen_random_uuid()
name text not null
phone text not null
whatsapp text
photo text
district text
bio text
is_verified boolean default false
response_time_hrs integer
rating numeric  -- 0-5
safelands_agent_id text unique
created_at timestamptz default now()
```

### land_insights
```sql
id uuid primary key default gen_random_uuid()
listing_id uuid references land_listings(id) on delete cascade
farming_suitability text
access_road_quality text
nearby_infrastructure text
risk_notes text
planting_season_fit text
generated_at timestamptz default now()
model_used text
```

### land_payments
```sql
id uuid primary key default gen_random_uuid()
listing_id uuid references land_listings(id)
buyer_phone text not null
amount_ugx integer default 10000
payment_method text  -- mtn | airtel | whatsapp-manual
status text default 'pending'  -- pending | paid | expired
access_expires_at timestamptz  -- paid_at + 24 hours
agent_id uuid references land_agents(id)
flutterwave_ref text
paid_at timestamptz
created_at timestamptz default now()
```

### land_content
```sql
id uuid primary key default gen_random_uuid()
title text not null
slug text unique not null
body text  -- markdown
content_type text  -- guide | spotlight | seasonal | explainer
district text  -- nullable, for district spotlights
published_at timestamptz default now()
generated_by text  -- n8n workflow id
```

### land_saved_searches
```sql
id uuid primary key default gen_random_uuid()
user_phone text not null
district text
price_max bigint
size_min numeric
land_type text
intended_use text
notify_whatsapp boolean default true
created_at timestamptz default now()
last_notified_at timestamptz
```

---

## 9. Sync API

### Endpoint
`POST /api/land/sync` — on Business Yoo, protected by `SYNC_SECRET` env var (bearer token).

### Request Payload (from SafeLands Admin)
```json
{
  "safelands_id": "sl_123",
  "title": "2 Acres in Mukono, Seeta",
  "district": "Mukono",
  "parish": "Seeta",
  "coordinates": { "lat": 0.3476, "lng": 32.5825 },
  "size_acres": 2,
  "price_ugx": 45000000,
  "land_type": "mailo",
  "intended_use": "farming",
  "title_status": "clean",
  "verification_stage": "verified",
  "trust_score": 87,
  "photos": ["https://..."],
  "agent": {
    "safelands_agent_id": "ag_456",
    "name": "James Ssekitto",
    "phone": "+256772000000",
    "whatsapp": "+256772000000",
    "district": "Mukono"
  }
}
```

### Response
```json
{
  "success": true,
  "listing_url": "https://businessyoo.lugandastudio.com/land/browse/[id]",
  "qr_url": "https://businessyoo.lugandastudio.com/land/verify/[qr_token]"
}
```

### Logic
1. Upsert land_listings on `safelands_id`
2. Upsert land_agents on `safelands_agent_id`
3. Generate `qr_token` if new listing (nanoid, 10 chars)
4. Trigger n8n AI insights webhook
5. Return listing + QR URLs

---

## 10. Payment Flow (Assisted Check)

1. User on `/land/check` or listing detail page clicks "Get assisted check — UGX 10,000"
2. Enters phone number
3. Primary: Flutterwave/Pesapal initiates MTN or Airtel Mobile Money prompt
4. On payment success webhook: n8n creates `land_payments` record with `access_expires_at = now() + 24h`
5. WhatsApp sent to buyer with agent contact + listing link
6. WhatsApp sent to agent with buyer phone + listing
7. Fallback: if payment fails → "Pay via WhatsApp" button → opens WhatsApp to agent with pre-filled message

---

## 11. Design System

### Colors
| Vertical | Accent | Usage |
|---|---|---|
| /land | Forest Green `#2d6a4f` | Headers, badges, CTAs |
| /jobs | Royal Blue `#1a56db` | Headers, badges, CTAs |
| /ideas | Amber `#c05621` | Headers, badges, CTAs |
| /salons | Plum `#6b21a8` | Headers, badges, CTAs |
| /travel | Teal `#0e7490` | Headers, badges, CTAs |
| /businesses | Charcoal `#374151` | Headers, badges, CTAs |
| Platform shell | Neutral `#111827` | Navbar, footer, /apps |

### Typography
- **Display/Hero:** Playfair Display — premium, trustworthy
- **Body/UI:** Inter — clean, readable on all phone screens
- **Map labels:** Source Sans 3
- **Scale:** 12 · 14 · 16 · 20 · 24 · 32 · 48px
- **Weight:** 400 body · 600 UI labels · 700 headings · 800 hero

### Components
- **Border radius:** 12px cards · 8px inputs · 24px pills · 999px badges
- **Shadows:** `0 2px 8px rgba(0,0,0,.08)` on cards · none on map overlays
- **Spacing:** 4px base unit · 16/24/32px section gaps
- **Dark mode:** Full support

### Trust Badges
- ✅ Surveyor Verified
- 📋 Title Checked
- ⭐ Top Agent
- ⚠️ Unverified — Proceed with caution

### Design Principles
1. **Map-first** — the map is the emotional center of /land
2. **Mobile-first** — bottom sheets, large tap targets, horizontal scroll filters
3. **Trust-first** — verification badges appear before price and photos
4. **Plain language** — "Show roads" not "toggle vector layer"
5. **WhatsApp-native** — every human CTA ends in WhatsApp

---

## 12. Copy

### /land
- **Hero:** "Discover land you can trust."
- **Sub:** "Browse verified plots across Uganda — inspect visually, check the title, and connect with a certified agent."
- **CTA primary:** "Browse Land"
- **CTA secondary:** "Ask about land"
- **Trust strip:** ✅ Surveyor-verified listings · 🗺 Visual land inspection · 📲 WhatsApp agents instantly
- **Assisted check CTA:** "Get a full land check — UGX 10,000 for 24-hour expert access"
- **Empty state:** "No listings found in this area yet. Save your search and we'll WhatsApp you when something matches."
- **QR page headline:** "This listing has been verified."
- **AI assistant greeting:** "Hi — ask me anything about this land or about buying land in Uganda."
- **Save search CTA:** "Get WhatsApp alerts for new listings here"

### /apps Hub
- **Headline:** "Everything on Business Yoo"
- **Sub:** "Explore land, jobs, business ideas, salons, travel, and more — all in one place."
- **Cards:** 🏞 Find Land · 💡 Business Ideas · 💼 Find Businesses · ✂️ Find Salons · ✈️ Explore Uganda · 👷 Find Work

### Platform Tagline
> "Business Yoo — Uganda's platform for land, work, business, and opportunity."

---

## 13. Implementation Phases

### Phase 1 — Foundation (Week 1-2)
- Supabase `land_*` tables + migrations
- `POST /api/land/sync` endpoint on Business Yoo
- `/apps` holding hub page
- SafeLands Admin: add sync trigger on verification

### Phase 2 — /land Core (Week 3-4)
- `/land` homepage
- `/land/browse` with Mapbox map + filter chips + listing grid
- `/land/browse/[id]` detail page + trust panel + map layers
- `/land/verify/[qr]` trust certificate page

### Phase 3 — Intelligence (Week 5-6)
- `/land/ask` AI research page
- Chat bubble on listing detail pages
- `/land/guides` + content display
- n8n: Listing Sync + AI Insights workflows

### Phase 4 — Commerce (Week 7-8)
- `/land/check` payment page
- Flutterwave/Pesapal integration
- n8n: Payment workflow + Trust Score Refresh
- `/land/agents` directory

### Phase 5 — Living System (Week 9-10)
- n8n: Content Engine + Planting Season Alerts + Save Search notifications
- Draw-on-map search
- Map preset modes (Clean/Explore/Full/Custom)
- Save search + WhatsApp alert system

---

## 14. Environment Variables Needed

```bash
# Business Yoo
SYNC_SECRET=                    # Shared secret with SafeLands Admin
NEXT_PUBLIC_MAPBOX_TOKEN=       # Mapbox public token
OPENROUTER_API_KEY=             # Already configured
FLUTTERWAVE_SECRET_KEY=         # Payment processing
FLUTTERWAVE_PUBLIC_KEY=
N8N_WEBHOOK_SECRET=             # Secure n8n webhooks

# SafeLands Admin (add)
BUSINESS_YOO_SYNC_URL=https://businessyoo.lugandastudio.com/api/land/sync
BUSINESS_YOO_SYNC_SECRET=      # Same as SYNC_SECRET above
```

---

## 15. Stack Summary

| Layer | Technology |
|---|---|
| Consumer hub | Next.js 15 + TypeScript + Tailwind CSS |
| Database | Supabase (Postgres) |
| Map | Mapbox GL JS |
| Auth (admin) | Clerk (SafeLands only — /land is public) |
| Payments | Flutterwave or Pesapal (MTN/Airtel Uganda) |
| AI | Claude via OpenRouter |
| Automation | n8n on Railway |
| Hosting | Vercel |
| Back-office | SafeLands Admin (existing Next.js + Neon + Clerk) |
