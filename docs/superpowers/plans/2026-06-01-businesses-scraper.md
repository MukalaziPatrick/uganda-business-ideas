# Businesses Scraper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the `businesses` Supabase table with ~800–1,000 real Uganda businesses (4 priority categories × 9 cities) via a one-time batch script, then keep it fresh with a weekly Railway cron top-up.

**Architecture:** Two new Python scripts in `scraper/` — `scrape_businesses_batch.py` (one-time batch, run manually on Railway) and `scrape_businesses_topup.py` (weekly cron, Kampala Restaurants + Hotels only). Both reuse the existing `scrape_google.py` core logic and write directly to Supabase via a new `upsert_business()` helper in `db.py`. A `railway.toml` cron entry triggers the top-up every Sunday 3 AM EAT (midnight UTC).

**Tech Stack:** Python 3.11, `supabase-py`, `requests`, Google Places API (New, `v1/places:searchNearby`), Railway cron

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scraper/db.py` | Modify | Add `upsert_business()` helper |
| `scraper/scrape_businesses_batch.py` | Create | One-time batch: 4 categories × 9 cities |
| `scraper/scrape_businesses_topup.py` | Create | Weekly top-up: Restaurants + Hotels in Kampala |
| `railway.toml` | Create | Railway cron schedule for top-up |

---

## Task 1: Add `upsert_business()` to `db.py`

**Files:**
- Modify: `scraper/db.py`

The existing `db.py` only has `upsert_listing()` for land. We need a separate function for businesses that deduplicates on `external_id` (Google Place ID).

- [ ] **Step 1: Open `scraper/db.py` and append the new function**

Add this to the end of `scraper/db.py`:

```python
def upsert_business(business: dict) -> bool:
    """
    Insert a business row if external_id doesn't exist yet.
    Returns True if inserted, False if already existed.
    """
    sb = get_client()
    external_id = business.get("external_id")
    if not external_id:
        return False

    existing = sb.table("businesses").select("id").eq("external_id", external_id).execute()
    if existing.data:
        return False  # already in DB

    sb.table("businesses").insert({
        "name":        business.get("name"),
        "category":    business.get("category"),
        "region":      business.get("region"),
        "district":    business.get("district"),
        "town":        business.get("town"),
        "phone":       business.get("phone"),
        "website":     business.get("website"),
        "address":     business.get("address"),
        "description": business.get("description"),
        "hours":       business.get("hours"),
        "lat":         business.get("lat"),
        "lng":         business.get("lng"),
        "external_id": external_id,
        "source":      business.get("source", "google_places"),
        "status":      "active",
    }).execute()
    return True
```

- [ ] **Step 2: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are in `scraper/.env`**

Run:
```powershell
Get-Content d:\projects\uganda-business-ideas\scraper\.env
```
Expected: both `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` lines present. If missing, add them (values from Supabase project settings → API → service role key).

- [ ] **Step 3: Smoke-test the helper manually**

From `scraper/` directory:
```powershell
cd d:\projects\uganda-business-ideas\scraper
python -c "
from db import upsert_business
result = upsert_business({
    'name': 'Test Clinic',
    'category': 'Health & Pharmacy',
    'region': 'Central',
    'district': 'Kampala',
    'town': 'Kampala',
    'external_id': 'test_smoke_001',
    'source': 'google_places',
})
print('Inserted:', result)
"
```
Expected: `Inserted: True`

Run again — expected: `Inserted: False` (dedup works).

Then delete the test row from Supabase dashboard (businesses table, filter external_id = test_smoke_001).

- [ ] **Step 4: Commit**

```bash
git add scraper/db.py
git commit -m "feat: add upsert_business helper to db.py"
```

---

## Task 2: Extend `scrape_google.py` field mask to include phone, website, description, hours

**Files:**
- Modify: `scraper/scrape_google.py`

The current `fetch_page()` only requests `displayName`, `id`, `formattedAddress`, `location`. We need phone, website, editorialSummary, and currentOpeningHours for the businesses scraper.

- [ ] **Step 1: Update the `X-Goog-FieldMask` in `fetch_page()`**

In `scraper/scrape_google.py`, find the `headers` dict in `fetch_page()` (line ~74) and replace the `X-Goog-FieldMask` value:

```python
"X-Goog-FieldMask": (
    "places.displayName,places.id,places.formattedAddress,"
    "places.location,places.nationalPhoneNumber,places.websiteUri,"
    "places.editorialSummary,places.currentOpeningHours"
),
```

- [ ] **Step 2: Update `scrape_district()` to extract the new fields**

In `scrape_district()`, find the `results.append({...})` block (line ~122) and replace it:

```python
hours_raw = place.get("currentOpeningHours", {}).get("weekdayDescriptions", [])
results.append({
    "name":        place.get("displayName", {}).get("text", "").strip(),
    "category":    category,
    "region":      region,
    "district":    district,
    "town":        None,
    "phone":       place.get("nationalPhoneNumber"),
    "website":     place.get("websiteUri"),
    "description": place.get("editorialSummary", {}).get("text"),
    "hours":       "; ".join(hours_raw) if hours_raw else None,
    "address":     place.get("formattedAddress"),
    "lat":         loc.get("latitude"),
    "lng":         loc.get("longitude"),
    "source":      "google_places",
    "external_id": place.get("id"),
})
```

- [ ] **Step 3: Verify the existing CLI still works**

```powershell
cd d:\projects\uganda-business-ideas\scraper
python scrape_google.py --type hospital --district Kampala --max 5
```
When prompted `Continue? (y/n):` type `n`. Expected: "Aborted." — no error, script ran cleanly.

- [ ] **Step 4: Commit**

```bash
git add scraper/scrape_google.py
git commit -m "feat: expand Places field mask to include phone, website, description, hours"
```

---

## Task 3: Create `scrape_businesses_batch.py`

**Files:**
- Create: `scraper/scrape_businesses_batch.py`

This script loops through 4 categories × 9 cities, calls `scrape_district()` from `scrape_google.py` for each combo, and upserts results directly to Supabase via `upsert_business()`.

Kampala gets `max=100` (40% weight → more results), Entebbe/Jinja/Mbarara/Masaka get `max=50` (20%), and Gulu/Lira/Mbale/Arua get `max=25` (5% each).

- [ ] **Step 1: Create `scraper/scrape_businesses_batch.py`**

```python
"""
One-time batch fill: 4 priority categories × 9 Uganda cities → Supabase businesses table.

Run once on Railway (or locally) to seed the /businesses vertical.

Usage:
  python scrape_businesses_batch.py
  python scrape_businesses_batch.py --dry-run   # prints combos, no API calls
"""

import argparse
import sys
import time
from dotenv import load_dotenv

load_dotenv()

from scrape_google import scrape_district
from db import upsert_business

# 4 priority categories (Google Places type → DB category label)
BATCH_TYPES = [
    "restaurant",
    "lodging",
    "hospital",
    "pharmacy",
]

# 9 cities with max results per city (reflects scrape weight)
CITY_CONFIG: list[tuple[str, int]] = [
    ("Kampala",  100),  # 40%
    ("Entebbe",   50),  # 10% — NOTE: Entebbe is in Wakiso district; we pass district=Wakiso below
    ("Jinja",     50),  # 10%
    ("Mbarara",   50),  # 10%
    ("Masaka",    50),  # 10%
    ("Gulu",      25),  # 5%
    ("Lira",      25),  # 5%
    ("Mbale",     25),  # 5%
    ("Arua",      25),  # 5%
]

# Entebbe is a town in Wakiso district — scrape_district needs the district name
CITY_TO_DISTRICT: dict[str, str] = {
    "Entebbe": "Wakiso",
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Print combos without calling the API")
    args = parser.parse_args()

    combos = [(place_type, city, max_results) for place_type in BATCH_TYPES for city, max_results in CITY_CONFIG]
    total = len(combos)

    if args.dry_run:
        print(f"DRY RUN — {total} combos:")
        for i, (t, c, m) in enumerate(combos, 1):
            print(f"  {i:2}. type={t}, city={c}, max={m}")
        return

    print(f"\nBatch scrape: {total} combos ({len(BATCH_TYPES)} types × {len(CITY_CONFIG)} cities)")
    print("Estimated API cost: ~${:.2f}".format(total * 5 * 0.017))  # avg 5 requests per combo
    confirm = input("Continue? (y/n): ").strip().lower()
    if confirm != "y":
        print("Aborted.")
        return

    inserted_total = 0
    skipped_total = 0

    for i, (place_type, city, max_results) in enumerate(combos, 1):
        district = CITY_TO_DISTRICT.get(city, city)
        print(f"\n[{i}/{total}] type={place_type}, city={city} (district={district}), max={max_results}")
        try:
            results = scrape_district(place_type, district, max_results)
        except Exception as e:
            print(f"  ERROR: {e} — skipping")
            continue

        inserted = 0
        skipped = 0
        for business in results:
            if upsert_business(business):
                inserted += 1
            else:
                skipped += 1

        inserted_total += inserted
        skipped_total += skipped
        print(f"  Inserted: {inserted}, Skipped (duplicate): {skipped}")

        # Polite delay between combos to avoid rate limits
        if i < total:
            time.sleep(1)

    print(f"\nDone. Total inserted: {inserted_total}, Total skipped: {skipped_total}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run dry-run to verify combo list**

```powershell
cd d:\projects\uganda-business-ideas\scraper
python scrape_businesses_batch.py --dry-run
```

Expected output (36 lines):
```
DRY RUN — 36 combos:
   1. type=restaurant, city=Kampala, max=100
   2. type=restaurant, city=Entebbe, max=50
   ...
  36. type=pharmacy, city=Arua, max=25
```

- [ ] **Step 3: Run a single combo as a live test (Kampala hospitals, max=5)**

Temporarily edit the `BATCH_TYPES` list to just `["hospital"]` and `CITY_CONFIG` to just `[("Kampala", 5)]`, run the script, verify 5 rows appear in Supabase businesses table, then restore the original lists.

```powershell
python scrape_businesses_batch.py
```
Type `y` when prompted. Expected: "Inserted: 5, Skipped: 0" (or fewer if some already existed from the May 22 smoke test).

Check Supabase dashboard → businesses table → filter source = google_places. Confirm rows have name, category, district, lat, lng populated.

- [ ] **Step 4: Restore original BATCH_TYPES and CITY_CONFIG, commit**

```bash
git add scraper/scrape_businesses_batch.py
git commit -m "feat: add scrape_businesses_batch.py — 4 categories × 9 cities"
```

---

## Task 4: Run the full batch

**Files:** none (operational step)

This is the real Phase 1 fill. Run the full batch script on Railway (Uganda's internet blocks Google APIs, so run from Railway or locally via VPN if needed).

- [ ] **Step 1: Push to Railway**

```bash
git push origin master
```

Wait for Railway to deploy (watch Railway dashboard → Deployments).

- [ ] **Step 2: Open Railway shell and run the batch**

In Railway dashboard → your scraper service → Shell tab:

```bash
cd scraper
python scrape_businesses_batch.py
```

Type `y` when prompted. The script will take ~10–15 minutes for all 36 combos. Watch the output — each combo prints inserted/skipped counts.

- [ ] **Step 3: Verify in Supabase**

Go to Supabase dashboard → Table Editor → businesses. Expected: 600–1,000 new rows with `source = google_places` and `status = active`.

Also verify the `/businesses` page on the live site shows the new listings.

- [ ] **Step 4: Note final count in a comment**

No commit needed — this is a data operation, not a code change.

---

## Task 5: Create `scrape_businesses_topup.py`

**Files:**
- Create: `scraper/scrape_businesses_topup.py`

Weekly top-up: Restaurants + Hotels in Kampala only (most dynamic). Runs non-interactively (no `input()` prompt) so Railway cron can call it.

- [ ] **Step 1: Create `scraper/scrape_businesses_topup.py`**

```python
"""
Weekly top-up: Restaurants + Hotels in Kampala → Supabase businesses table.

Runs non-interactively (no confirmation prompt) — designed for Railway cron.

Schedule: Sunday 3 AM EAT (midnight UTC) via railway.toml cron.
"""

import sys
import time
from dotenv import load_dotenv

load_dotenv()

from scrape_google import scrape_district
from db import upsert_business

TOPUP_COMBOS = [
    ("restaurant", "Kampala", 60),
    ("lodging",    "Kampala", 60),
]


def main():
    inserted_total = 0
    skipped_total = 0

    for place_type, district, max_results in TOPUP_COMBOS:
        print(f"Scraping type={place_type}, district={district}, max={max_results}")
        try:
            results = scrape_district(place_type, district, max_results)
        except Exception as e:
            print(f"ERROR scraping {place_type}/{district}: {e}", file=sys.stderr)
            continue

        for business in results:
            if upsert_business(business):
                inserted_total += 1
            else:
                skipped_total += 1

        time.sleep(1)

    print(f"Top-up complete. Inserted: {inserted_total}, Skipped: {skipped_total}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test locally (non-destructive dry check)**

```powershell
cd d:\projects\uganda-business-ideas\scraper
python -c "
import scrape_businesses_topup
print('Import OK — no syntax errors')
"
```
Expected: `Import OK — no syntax errors`

- [ ] **Step 3: Commit**

```bash
git add scraper/scrape_businesses_topup.py
git commit -m "feat: add scrape_businesses_topup.py — weekly Kampala restaurants + hotels"
```

---

## Task 6: Add Railway cron via `railway.toml`

**Files:**
- Create: `railway.toml` (in repo root, next to `package.json`)

Railway reads `railway.toml` for cron schedules. The cron runs `scrape_businesses_topup.py` every Sunday midnight UTC (3 AM EAT).

- [ ] **Step 1: Check if `railway.toml` already exists**

```powershell
Test-Path d:\projects\uganda-business-ideas\railway.toml
```

If `True`, read it first before editing. If `False`, create it fresh.

- [ ] **Step 2: Create (or add to) `railway.toml`**

If the file does not exist, create `d:/projects/uganda-business-ideas/railway.toml`:

```toml
[build]
# No special build config needed — Railway auto-detects Python

[[crons]]
name = "businesses-topup"
command = "cd scraper && python scrape_businesses_topup.py"
schedule = "0 0 * * 0"
```

If it already exists, add only the `[[crons]]` block to the existing file.

- [ ] **Step 3: Verify TOML syntax**

```powershell
python -c "
import tomllib
with open('d:/projects/uganda-business-ideas/railway.toml', 'rb') as f:
    data = tomllib.load(f)
print('Valid TOML:', list(data.keys()))
"
```
Expected: `Valid TOML: ['build', 'crons']` (or similar, no error).

- [ ] **Step 4: Commit and push**

```bash
git add railway.toml
git commit -m "feat: add Railway cron for weekly businesses top-up (Sundays 3 AM EAT)"
git push origin master
```

- [ ] **Step 5: Verify cron appears in Railway**

In Railway dashboard → your scraper service → Cron Jobs tab. Expected: `businesses-topup` listed with schedule `0 0 * * 0`.

---

## Task 7: Verify end-to-end on live site

**Files:** none (verification step)

- [ ] **Step 1: Check `/businesses` page shows new listings**

Open `https://ugandabiz.lugandastudio.com/businesses` in browser. Expected: businesses with `source = google_places` visible, category filters work (Health & Pharmacy, Hotel & Accommodation, Restaurant/Eatery).

- [ ] **Step 2: Check a detail page loads correctly**

Click any listing card → `/businesses/[id]`. Expected: name, category, district, phone (if scraped), map embed all present.

- [ ] **Step 3: Manually trigger the top-up cron to confirm it runs clean**

In Railway dashboard → Cron Jobs → `businesses-topup` → Run Now. Watch logs. Expected: "Top-up complete. Inserted: X, Skipped: Y" with no errors.

- [ ] **Step 4: Done ✅**

The businesses vertical now has ~800–1,000 real listings and self-refreshes weekly.
