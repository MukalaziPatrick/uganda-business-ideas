# Businesses Vertical Scraper — Design Spec
**Date:** 2026-06-01  
**Project:** Business Yoo  
**Vertical:** /businesses  
**Status:** Approved — ready for implementation

---

## Goal

Fill the `businesses` table with 800–1,000 real Uganda businesses (Phase 1: 4 priority categories × 9 cities), then keep it fresh with a weekly automated top-up. Uses the proven Google Places (New API) scraper already in the repo.

---

## Architecture

Two scripts in `scraper/`, both extending the existing `scrape_google.py` logic:

### 1. `scraper/scrape_businesses_batch.py` — One-time batch fill
- Loops through 4 categories × 9 cities (36 combos)
- Calls Google Places API (`v1/places:searchNearby`) per combo
- Maps district → region via `map_districts.py`
- Upserts directly to Supabase `businesses` table via `db.py`
- Deduplicates on `external_id` (Google Place ID) — safe to re-run
- Run once manually on Railway to fill the DB

### 2. `scraper/scrape_businesses_topup.py` — Weekly top-up
- Same logic, scoped to Restaurants + Hotels in Kampala only (most dynamic)
- Runs via Railway cron every Sunday 3 AM EAT
- Only inserts new businesses (ON CONFLICT external_id DO NOTHING)

Both write `status = 'active'` directly. The existing `/admin/import-places` UI remains available as a manual fallback.

---

## Categories (Phase 1)

| Category | Google Places Type |
|---|---|
| Restaurants & Eateries | `restaurant` |
| Hotels & Accommodation | `lodging` |
| Hospitals & Clinics | `hospital` |
| Pharmacies & Drug Shops | `pharmacy` |

---

## Cities & Scrape Weight

| City | Weight | Radius | Notes |
|---|---|---|---|
| Kampala | 40% | 10 km | Largest city, most businesses |
| Entebbe | 10% | 5 km | Airport hub |
| Jinja | 10% | 5 km | Eastern hub |
| Mbarara | 10% | 5 km | Western hub |
| Masaka | 10% | 5 km | Western hub |
| Gulu | 5% | 4 km | Northern |
| Lira | 5% | 4 km | Northern |
| Mbale | 5% | 4 km | Eastern |
| Arua | 5% | 4 km | West Nile |

Weight translates to: Kampala fetches up to 5 pages of results per category; other cities fetch 1–2 pages.

---

## Data Flow

```
scrape_businesses_batch.py
  → Google Places API (v1/places:searchNearby)
  → map_districts.py (district → region lookup)
  → db.py upsert (ON CONFLICT external_id DO NOTHING)
  → businesses table (status = 'active')
```

### Fields mapped from Google Places response:
| DB Column | Source |
|---|---|
| `name` | `displayName.text` |
| `category` | mapped from Place type |
| `district` | reverse-geocoded from address components |
| `region` | `map_districts.py` lookup |
| `town` | locality from address components |
| `phone` | `nationalPhoneNumber` |
| `website` | `websiteUri` |
| `lat` | `location.latitude` |
| `lng` | `location.longitude` |
| `description` | `editorialSummary.text` (if present) |
| `hours` | `currentOpeningHours.weekdayDescriptions` joined as string |
| `external_id` | `name` (Place resource name, e.g. `places/ChIJ...`) |
| `source` | `"google_places"` |
| `status` | `"active"` |

---

## Weekly Cron (Railway)

In `railway.toml`:
```toml
[[crons]]
name = "businesses-topup"
command = "python scrape_businesses_topup.py"
schedule = "0 0 * * 0"  # Sunday midnight UTC = 3 AM EAT
```

---

## Cost Estimate

- Phase 1 batch: 4 categories × 9 cities × ~2 pages avg = ~72 API calls
- Google Places (New) pricing: ~$0.017/request × 72 = ~$1.22 for the batch
- Well within $300 GCP free credit

---

## Out of Scope (Phase 1)

- Remaining 9 categories (run after Phase 1 quality verified)
- All 135 Uganda districts (Phase 3)
- OSM free fallback scraping
- Business owner claiming / editing listings
- BrighterMonday-style headless scraping

---

## Files

| File | Purpose |
|---|---|
| `scraper/scrape_businesses_batch.py` | One-time batch fill (NEW) |
| `scraper/scrape_businesses_topup.py` | Weekly top-up cron (NEW) |
| `scraper/scrape_google.py` | Existing Places API client (REUSE) |
| `scraper/map_districts.py` | District → region lookup (REUSE) |
| `scraper/db.py` | Supabase upsert helper (REUSE) |
| `railway.toml` | Add cron entry (MODIFY or CREATE if not present) |
