# Land Market Scraper & `/land/market` Design Spec
**Date:** 2026-05-31  
**Status:** Approved for implementation  
**Author:** Brainstorming session — Patrick Mukalazi + Ssenkali

---

## 1. Vision

Add a self-updating open market land radar to Business Yoo. A Python scraper runs daily, pulls land-for-sale listings from OLX Uganda and Lamudi Uganda, enriches them with AI, and publishes clean structured listings to `/land/market`. Suspicious listings are held for human review via a Telegram group bot.

This solves two problems:
1. Patrick cannot easily find land on the Business Yoo dashboard
2. `/land/browse` (SafeLands verified) has no open market complement

**Separation principle:** SafeLands verified listings (`/land/browse`) and scraped open market listings (`/land/market`) never mix. Two pipelines, two pages, one Supabase database.

---

## 2. System Architecture

```
OLX Uganda ──┐
              ├──► Python Scraper (Railway) ──► OpenRouter AI ──► Supabase
Lamudi UG ───┘         (runs daily 6AM EAT)      (enrichment)    land_market table
                                                                       │
                                                              Telegram Bot
                                                         (flags suspicious → group)
                                                                       │
                                                              /land/market (Next.js)
                                                         Business Yoo public page
```

### Two land pipelines
| Table | Source | Page | Trust |
|---|---|---|---|
| `land_listings` | SafeLands Admin (surveyors) | `/land/browse` | Verified |
| `land_market` | Scraper (OLX + Lamudi) | `/land/market` | Unverified / AI-scored |

### Future sources (noted, not in scope)
- Facebook Groups ("Land for Sale Uganda")
- Additional classified sites

---

## 3. Supabase — `land_market` Table

```sql
create table land_market (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  raw_text text,
  price_ugx bigint,
  size_acres decimal,
  land_type text,           -- Mailo, Freehold, Leasehold
  district text,
  road_area text,
  has_title boolean,
  contact_phone text,
  trust_score int,          -- 1–5 (AI assigned)
  trust_flags text[],       -- e.g. ['price_too_low', 'no_contact']
  status text default 'pending', -- pending | published | rejected
  source_url text unique,   -- duplicate prevention key
  source_site text,         -- olx | lamudi
  scraped_at timestamptz default now(),
  reviewed_by text,         -- telegram username of reviewer
  reviewed_at timestamptz
);
```

---

## 4. Python Scraper (Railway Service)

### File structure
```
scraper/
├── main.py              — APScheduler: runs daily 6AM EAT
├── scrapers/
│   ├── olx.py           — OLX Uganda /property/land listings
│   └── lamudi.py        — Lamudi Uganda land listings
├── enricher.py          — OpenRouter/Claude: extract structured fields
├── verifier.py          — trust score + flag assignment
├── telegram_bot.py      — bot setup + flagged listing notifications
├── db.py                — Supabase upsert (source_url = unique key)
├── requirements.txt
└── Dockerfile
```

### Scraper behaviour
- Uses `httpx` + `BeautifulSoup` for static pages
- Pagination handled per source (OLX: page param; Lamudi: offset)
- Duplicate check: if `source_url` exists → update `price_ugx` + `scraped_at` only, no re-enrichment
- Max 200 listings per source per run

### AI enrichment (enricher.py)
Each raw listing text is sent to OpenRouter (claude-sonnet-4-6) with a structured extraction prompt. Returns JSON with all `land_market` fields. Cost: ~$0.001 per listing → ~$0.20/day for 200 listings.

### Trust scoring (verifier.py)
| Score | Condition | Action |
|---|---|---|
| 5 | Price reasonable + contact present + location specific + title mentioned | Auto-publish |
| 4 | Minor gaps but nothing suspicious | Auto-publish |
| 3 | Some missing fields | Auto-publish with "Unverified" badge |
| 2 | Missing contact OR suspiciously cheap | Hold → Telegram |
| 1 | Multiple red flags | Hold → Telegram |

**Red flags:** `price_too_low` (< 500k/acre), `no_contact`, `vague_location`, `duplicate_suspected`, `no_size_given`

---

## 5. Telegram Verification Bot

### Setup
- One bot created via @BotFather (free)
- One Telegram group: Patrick + trusted team members + bot
- Bot token stored as Railway env var `TELEGRAM_BOT_TOKEN`
- Group chat ID stored as `TELEGRAM_GROUP_ID`

### Flagged listing message format
```
🚨 New listing needs review

📍 [size] acres, [road_area], [district]
💰 UGX [price_ugx formatted]
🏷 [land_type] · [Has title ✓ / No title ✗]
📞 [contact or "No contact found"]
⚠️ Flags: [trust_flags joined]

Source: [source_site] · scraped [scraped_at]

[✅ Approve]  [❌ Reject]  [🔗 View listing]
```

### Button actions
- ✅ Approve → `status = published`, `reviewed_by = telegram username`, `reviewed_at = now()`
- ❌ Reject → `status = rejected`, same audit fields
- 🔗 View → opens `source_url` in browser

### Multi-user rule
First tap wins. Bot replies "✅ Approved by @patrick" so all group members see the action.

---

## 6. `/land/market` Page (Next.js)

### Route
`/land/market` — server component, `revalidate = 300` (5 min refresh)

### Filters
- District (dropdown)
- Road/area (text search)
- Price range (min–max UGX millions)
- Size in acres (min–max)
- Land type (Mailo / Freehold / Leasehold)
- Has title (toggle)
- Source site (OLX / Lamudi)

### Listing card fields
- Size, road_area, district, land_type
- Price formatted (e.g. "9M" not "9,000,000")
- Has title badge (✓ green / ✗ red)
- Source + days since scraped
- "Unverified" warning badge
- Trust score (subtle 1–5 dots)
- WhatsApp button → `wa.me/[contact_phone]`

### Bottom CTA
Persistent strip: "Want a surveyor-verified listing? → Browse SafeLands ↗" linking to `/land/browse`

### Empty state
"No listings found for your search. The scraper runs daily at 6AM — check back tomorrow." + link to SafeLands.

---

## 7. Navigation & `/apps` Hub Fixes

### Change 1 — Site header nav
Add "Land" link pointing to `/land` in the main nav alongside Ideas, Businesses, Jobs, Salons, Travel.

### Change 2 — `/apps` hub page
Land gets the first featured card with an inline search box:
- Search input pre-wired to `/land/market?q=[query]`
- Two quick links: "Browse Verified" → `/land/browse` and "Open Market" → `/land/market`

No changes to `app/page.tsx` or `HomeClient.tsx` (homepage freeze rule maintained).

---

## 8. Implementation Phases

| Phase | Deliverable | Can deploy independently |
|---|---|---|
| 1 | Supabase `land_market` table migration + Railway scraper skeleton (no real scraping yet) | Yes |
| 2 | OLX + Lamudi scrapers + OpenRouter enrichment + daily schedule | Yes |
| 3 | Trust scoring + Telegram bot + auto-publish rules | Yes |
| 4 | `/land/market` Next.js page with all filters and cards | Yes |
| 5 | Nav bar "Land" link + `/apps` hub featured land card | Yes |

---

## 9. Environment Variables

### Railway (scraper service)
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
OPENROUTER_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_GROUP_ID=
```

### Vercel (already set, no changes needed)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 10. Cost Summary

| Item | Cost |
|---|---|
| Railway Hobby plan | $5/month (already paying) |
| OpenRouter enrichment (~200 listings/day) | ~$2/month |
| Telegram bot | Free |
| Supabase (within existing project) | Free |
| **Total new cost** | **~$2/month** |
