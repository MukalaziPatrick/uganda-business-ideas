# Business Yoo — Uganda Business Scraper Design
**Date:** 2026-05-22  
**Status:** Approved  
**Goal:** Populate Business Yoo's `/businesses` map with thousands of real Ugandan businesses scraped from Google Places API and OpenStreetMap.

---

## 1. Architecture Overview

Three components, connected in sequence:

```
[1] Python scraper  (runs locally on Windows)
        │
        │  fetches Google Places API + OSM Overpass API
        │  saves → scraper/output/YYYY-MM-DD-<category>-<district>.json
        ▼
[2] Admin import page  (/admin/import-places in Business Yoo)
        │
        │  upload JSON → preview table → select rows → click Import
        │  saves to Supabase businesses table with status = "pending"
        ▼
[3] Existing admin review  (/admin/businesses)
        │
        │  already has Approve / Reject buttons
        │  Approve → status = "active" → appears on /businesses map
        ▼
[4] /businesses map
        (no changes needed — already reads from Supabase)
```

Phase 2 (future): once data quality is confirmed, automate steps 1→2→3 via n8n.

---

## 2. Categories & Data Sources

| # | Display Category | Google Places Type | Source | Est. Volume |
|---|---|---|---|---|
| 1 | Health & Pharmacy (hospitals) | `hospital` | Google Places | ~1,200 |
| 2 | Education & Tutoring (schools) | `school` | Google Places | ~2,500 |
| 3 | Banks & Finance | `bank` | Google Places | ~600 |
| 4 | Health & Pharmacy (pharmacies) | `pharmacy` | Google Places | ~800 |
| 5 | Retail Shop (supermarkets) | `supermarket` | Google Places | ~400 |
| 6 | Hotel & Accommodation | `lodging` | Google Places | ~700 |
| 7 | Gym & Fitness | `gym` | Google Places | ~120 |
| 8 | Church | `church` | Google Places (cities only) | ~500 |
| 9 | Mosque | `mosque` | Google Places (cities only) | ~300 |
| 10 | Police & Security | `police` | Google Places | ~250 |
| 11 | Government Office | `local_government_office` | Google Places | ~135 |
| 12 | Petrol Station | OSM `amenity=fuel` | **OSM (free)** | ~800 |
| 13 | Transport & Boda (bus parks) | OSM `amenity=bus_station` | **OSM (free)** | ~400 |

**Google Places total:** ~7,505 places → estimated cost ~$128 (at $0.017/request)  
**OSM total:** ~1,200 places → $0  
**GCP budget used:** ~$128 of $300 free trial

### District scraping priority (Google Places)
Kampala → Wakiso → Jinja → Mbale → Gulu → Mbarara → Arua → Fort Portal → remaining 127 districts

Rationale: most users and businesses are in the 8 major cities. Rural districts have thin Google coverage — OSM fills the gap there.

### Category → Business Yoo mapping
The scraper maps Google types to the existing `BUSINESS_CATEGORIES` in `app/data/businesses.ts`:

| Google type | Business Yoo category |
|---|---|
| `hospital` | `Health & Pharmacy` |
| `pharmacy` | `Health & Pharmacy` |
| `school` | `Education & Tutoring` |
| `bank` | `Other` → **new category: "Banks & Finance"** |
| `supermarket` | `Retail Shop` |
| `lodging` | `Hotel & Accommodation` |
| `gym` | `Other` → **new category: "Gym & Fitness"** |
| `church` | `Other` → **new category: "Church"** |
| `mosque` | `Other` → **new category: "Mosque"** |
| `police` | `Other` → **new category: "Police & Security"** |
| `local_government_office` | `Other` → **new category: "Government Office"** |
| OSM `amenity=fuel` | `Other` → **new category: "Petrol Station"** |
| OSM `amenity=bus_station` | `Transport & Boda` |

**DB change required:** Add new categories to `BUSINESS_CATEGORIES` in `app/data/businesses.ts`.

---

## 3. Python Scraper (`scraper/`)

### File structure
```
scraper/
  scrape_google.py        — fetches from Google Places Nearby Search
  scrape_osm.py           — fetches from OSM Overpass API (free)
  map_districts.py        — maps district names → Uganda region
  dedupe.py               — removes duplicates before export
  requirements.txt        — requests, python-dotenv
  .env                    — GOOGLE_PLACES_API_KEY=...
  output/                 — scraped JSON files land here
    2026-05-22-hospital-kampala.json
    2026-05-22-school-wakiso.json
    ...
```

### How `scrape_google.py` works
1. Takes `--type` (Google place type) and `--district` as arguments
2. Calls Google Places Nearby Search with a center lat/lng for that district + radius 10km
3. Pages through results (up to 60 per search area, 3 pages × 20)
4. For each result, records: `place_id`, `name`, `vicinity` (address), `phone` (requires a Details call — optional to save budget)
5. Maps district → region using `map_districts.py`
6. Saves to `output/YYYY-MM-DD-<type>-<district>.json`

### How `scrape_osm.py` works
1. Queries OSM Overpass API with Uganda bounding box
2. Fetches `amenity=fuel` and `amenity=bus_station` nodes
3. Extracts: `name`, `lat`, `lon`, `addr:district` (where available)
4. Saves to `output/YYYY-MM-DD-osm-<amenity>.json`

### Output JSON format (both scrapers produce same shape)
```json
[
  {
    "name": "Mulago National Referral Hospital",
    "category": "Health & Pharmacy",
    "region": "Central",
    "district": "Kampala",
    "town": "Mulago",
    "phone": "+256414530020",
    "source": "google_places",
    "external_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"
  }
]
```

### Budget control
- `scrape_google.py` prints estimated cost before running and asks for confirmation
- Each Nearby Search page = 1 request = $0.017
- Details call (for phone) = 1 extra request = $0.017 — **skip by default, only fetch when phone is needed**
- User can run by district one at a time to stay in control

---

## 4. Admin Import Page (`/admin/import-places`)

### Route
`app/admin/import-places/page.tsx` — server component wrapper  
`app/admin/import-places/ImportPlacesClient.tsx` — client component (file upload + table)  
`app/api/admin/import-places/route.ts` — POST endpoint (receives array, saves to Supabase)

### UI flow
1. User uploads a JSON file (output from scraper)
2. Page parses the file and shows a preview table: Name | Category | District | Region | Source
3. Rows already in Supabase (matched by `external_id`) are greyed out and labelled "Already imported"
4. User selects rows (default: all new rows selected)
5. Clicks "Import X businesses" → POST to `/api/admin/import-places`
6. API inserts rows into `businesses` table with `status = "pending"`
7. Success message: "247 businesses imported. Review them at /admin/businesses"

### Deduplication logic
- The API route checks `external_id` against existing rows before insert
- Any row with a matching `external_id` is silently skipped
- `external_id` needs to be added as a nullable column to the `businesses` table

### DB migration required
```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS source text;
CREATE UNIQUE INDEX IF NOT EXISTS businesses_external_id_idx 
  ON businesses (external_id) WHERE external_id IS NOT NULL;
```

---

## 5. Changes to Existing Files

| File | Change |
|---|---|
| `app/data/businesses.ts` | Add 7 new categories: "Banks & Finance", "Gym & Fitness", "Church", "Mosque", "Police & Security", "Government Office", "Petrol Station" |
| `lib/supabase/types.ts` | Add `external_id?: string` and `source?: string` to `Business` and `BusinessInsert` types |
| `app/admin/page.tsx` | Add link to new `/admin/import-places` page |

No changes to the map component, businesses page, or Supabase queries.

---

## 6. Phased Rollout

| Phase | What | Districts | Est. Cost | When |
|---|---|---|---|---|
| Phase 1 | Test run — hospitals + schools only | Kampala only | ~$3 | Day 1 |
| Phase 2 | All categories | 8 major cities | ~$60 | After Phase 1 verified |
| Phase 3 | All categories | All 135 districts | ~$65 | After Phase 2 clean |
| Phase 4 | OSM import | All Uganda | $0 | Any time |
| Phase 5 (future) | Automate via n8n | — | — | After quality confirmed |

---

## 7. What Is Not In Scope

- Salons: already handled by the dedicated `/salons` section — importing here would create duplicates
- Hotels: can be imported but the `/travel` section already covers accommodation — import sparingly
- User-submitted businesses: existing `/businesses/register` flow remains unchanged
- Automatic approval: all scraped businesses require manual admin approval before going live
