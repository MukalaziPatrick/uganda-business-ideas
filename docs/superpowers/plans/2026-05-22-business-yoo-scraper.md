# Business Yoo — Uganda Business Scraper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the Business Yoo `/businesses` map with thousands of real Ugandan businesses scraped from Google Places API and OpenStreetMap, reviewable via a new `/admin/import-places` page before going live.

**Architecture:** A Python scraper runs locally, fetches from Google Places Nearby Search + OSM Overpass API, and saves JSON files to `scraper/output/`. An admin import page in the Next.js app reads those JSON files, previews the data, and bulk-inserts selected rows into Supabase with `status = "pending"`. The existing `/admin/businesses` approve/reject flow handles the final review.

**Tech Stack:** Python 3.x, `requests`, `python-dotenv`; Next.js 14 App Router (TypeScript); Supabase (postgres); Google Places Nearby Search API; OSM Overpass API (free)

---

## File Map

### New files
| File | Responsibility |
|---|---|
| `scraper/scrape_google.py` | Fetch one category + one district from Google Places, save JSON |
| `scraper/scrape_osm.py` | Fetch petrol stations + bus parks from OSM Overpass, save JSON |
| `scraper/map_districts.py` | District name → Uganda region lookup table |
| `scraper/requirements.txt` | Python deps: requests, python-dotenv |
| `scraper/.env.example` | Template showing required env vars |
| `scraper/output/.gitkeep` | Keep output dir in git, ignore actual JSON files |
| `app/admin/import-places/page.tsx` | Server component shell + auth check |
| `app/admin/import-places/ImportPlacesClient.tsx` | Client: file upload, preview table, import button |
| `app/api/admin/import-places/route.ts` | POST: receives array of businesses, deduplicates, inserts |

### Modified files
| File | Change |
|---|---|
| `app/data/businesses.ts` | Add 7 new categories + their emoji |
| `lib/supabase/types.ts` | Add `external_id` and `source` fields to `Business` and `BusinessInsert` |
| `app/admin/businesses/page.tsx` | Add link to `/admin/import-places` at top |

### DB migration (run in Supabase SQL editor)
```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS source text;
CREATE UNIQUE INDEX IF NOT EXISTS businesses_external_id_idx
  ON businesses (external_id) WHERE external_id IS NOT NULL;
```

---

## Task 1: DB Migration — add `external_id` and `source` columns

**Files:**
- No code files — run SQL in Supabase dashboard

- [ ] **Step 1: Run migration in Supabase SQL editor**

Go to your Supabase project → SQL Editor → New query. Paste and run:

```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS source text;
CREATE UNIQUE INDEX IF NOT EXISTS businesses_external_id_idx
  ON businesses (external_id) WHERE external_id IS NOT NULL;
```

Expected output: `Success. No rows returned.`

- [ ] **Step 2: Verify columns exist**

Run this query in Supabase SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'businesses'
  AND column_name IN ('external_id', 'source');
```

Expected: 2 rows returned — `external_id text` and `source text`.

---

## Task 2: Update TypeScript types

**Files:**
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Add `external_id` and `source` to the `Business` type**

Open `lib/supabase/types.ts`. The `Business` type currently ends with `created_at: string`. Add two new fields after `status`:

```typescript
export type Business = {
  id: string;
  name: string;
  category: string;
  region: "Central" | "Eastern" | "Northern" | "Western";
  district: string;
  town: string | null;
  description: string | null;
  hours: string | null;
  whatsapp: string | null;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  view_count: number;
  whatsapp_clicks: number;
  contact_clicks: number;
  status: BusinessStatus;
  external_id: string | null;   // ← new
  source: string | null;        // ← new
  created_at: string;
};
```

- [ ] **Step 2: Add `external_id` and `source` to `BusinessInsert`**

`BusinessInsert` currently ends with `tiktok?: string`. Add:

```typescript
export type BusinessInsert = {
  name: string;
  category: string;
  region: "Central" | "Eastern" | "Northern" | "Western";
  district: string;
  town?: string;
  description?: string;
  hours?: string;
  whatsapp?: string;
  phone?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  external_id?: string;   // ← new
  source?: string;        // ← new
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd d:/projects/uganda-business-ideas
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "feat: add external_id and source fields to Business types"
```

---

## Task 3: Add 7 new categories to `app/data/businesses.ts`

**Files:**
- Modify: `app/data/businesses.ts`

- [ ] **Step 1: Add new categories to `BUSINESS_CATEGORIES`**

Open `app/data/businesses.ts`. Replace the existing `BUSINESS_CATEGORIES` array with:

```typescript
export const BUSINESS_CATEGORIES = [
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
  "Banks & Finance",
  "Gym & Fitness",
  "Church",
  "Mosque",
  "Police & Security",
  "Government Office",
  "Petrol Station",
  "Other",
] as const;
```

- [ ] **Step 2: Add emoji for the new categories in `categoryEmoji`**

In the same file, update the `categoryEmoji` function's map to include the new categories:

```typescript
export function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "Restaurant": "🍽️",
    "Street Food": "🌯",
    "Salon & Barbershop": "💇",
    "Plumber": "🔧",
    "Electrician": "⚡",
    "Retail Shop": "🛒",
    "Agriculture & Farming": "🌾",
    "Transport & Boda": "🏍️",
    "Health & Pharmacy": "💊",
    "Education & Tutoring": "📚",
    "Hotel & Accommodation": "🏨",
    "Banks & Finance": "🏦",
    "Gym & Fitness": "🏋️",
    "Church": "⛪",
    "Mosque": "🕌",
    "Police & Security": "🚔",
    "Government Office": "🏛️",
    "Petrol Station": "⛽",
    "Other": "💼",
  };
  return map[category] ?? "💼";
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd d:/projects/uganda-business-ideas
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/data/businesses.ts
git commit -m "feat: add 7 new business categories (banks, gym, church, mosque, police, gov, petrol)"
```

---

## Task 4: Python scraper setup

**Files:**
- Create: `scraper/requirements.txt`
- Create: `scraper/.env.example`
- Create: `scraper/output/.gitkeep`
- Create: `scraper/map_districts.py`

- [ ] **Step 1: Create `scraper/requirements.txt`**

```
requests==2.31.0
python-dotenv==1.0.0
```

- [ ] **Step 2: Create `scraper/.env.example`**

```
GOOGLE_PLACES_API_KEY=your_key_here
```

Copy this file to `scraper/.env` and fill in your actual Google Places API key from the GCP Console.

- [ ] **Step 3: Create `scraper/output/.gitkeep`**

Create an empty file at `scraper/output/.gitkeep`. Then add to `.gitignore` (root of project):

```
scraper/output/*.json
scraper/.env
```

- [ ] **Step 4: Create `scraper/map_districts.py`**

This file maps every Uganda district name → its region. Used by both scrapers.

```python
# Maps Uganda district names to Business Yoo regions.
# Source: Uganda Bureau of Statistics administrative divisions.

DISTRICT_TO_REGION: dict[str, str] = {
    # Central
    "Kampala": "Central", "Wakiso": "Central", "Mukono": "Central",
    "Luwero": "Central", "Masaka": "Central", "Kalangala": "Central",
    "Kiboga": "Central", "Mubende": "Central", "Mityana": "Central",
    "Nakaseke": "Central", "Nakasongola": "Central", "Buikwe": "Central",
    "Buvuma": "Central", "Gomba": "Central", "Kalungu": "Central",
    "Kyankwanzi": "Central", "Lwengo": "Central", "Lyantonde": "Central",
    "Mpigi": "Central", "Rakai": "Central", "Sembabule": "Central",
    # Eastern
    "Jinja": "Eastern", "Mbale": "Eastern", "Tororo": "Eastern",
    "Iganga": "Eastern", "Soroti": "Eastern", "Kumi": "Eastern",
    "Kapchorwa": "Eastern", "Pallisa": "Eastern", "Kamuli": "Eastern",
    "Bugiri": "Eastern", "Mayuge": "Eastern", "Sironko": "Eastern",
    "Busia": "Eastern", "Budaka": "Eastern", "Bududa": "Eastern",
    "Bukedea": "Eastern", "Butaleja": "Eastern", "Buyende": "Eastern",
    "Kaliro": "Eastern", "Kibuku": "Eastern", "Luuka": "Eastern",
    "Manafwa": "Eastern", "Namayingo": "Eastern", "Namutumba": "Eastern",
    "Ngora": "Eastern", "Serere": "Eastern", "Butebo": "Eastern",
    "Namisindwa": "Eastern",
    # Northern
    "Gulu": "Northern", "Lira": "Northern", "Arua": "Northern",
    "Kitgum": "Northern", "Apac": "Northern", "Moroto": "Northern",
    "Kotido": "Northern", "Nebbi": "Northern", "Adjumani": "Northern",
    "Moyo": "Northern", "Pader": "Northern", "Amuria": "Northern",
    "Nakapiripirit": "Northern", "Abim": "Northern", "Amolatar": "Northern",
    "Amuru": "Northern", "Dokolo": "Northern", "Kaabong": "Northern",
    "Koboko": "Northern", "Maracha": "Northern", "Oyam": "Northern",
    "Agago": "Northern", "Alebtong": "Northern", "Amudat": "Northern",
    "Kole": "Northern", "Lamwo": "Northern", "Napak": "Northern",
    "Nwoya": "Northern", "Otuke": "Northern", "Zombo": "Northern",
    # Western
    "Mbarara": "Western", "Kabale": "Western", "Kasese": "Western",
    "Fort Portal": "Western", "Bushenyi": "Western", "Hoima": "Western",
    "Masindi": "Western", "Rukungiri": "Western", "Ntungamo": "Western",
    "Kibaale": "Western", "Kyenjojo": "Western", "Kamwenge": "Western",
    "Kabarole": "Western", "Kanungu": "Western", "Kiruhura": "Western",
    "Isingiro": "Western", "Kiryandongo": "Western", "Buliisa": "Western",
    "Buhweju": "Western", "Ibanda": "Western", "Kagadi": "Western",
    "Kakumiro": "Western", "Mitooma": "Western", "Rubanda": "Western",
    "Rubirizi": "Western", "Rwampara": "Western", "Sheema": "Western",
}


def get_region(district: str) -> str:
    """Return region for a district name, or 'Central' as fallback."""
    return DISTRICT_TO_REGION.get(district, "Central")
```

- [ ] **Step 5: Install Python deps**

```bash
cd d:/projects/uganda-business-ideas/scraper
pip install -r requirements.txt
```

Expected: Successfully installed requests-2.31.0 python-dotenv-1.0.0 (or similar).

- [ ] **Step 6: Commit**

```bash
cd d:/projects/uganda-business-ideas
git add scraper/requirements.txt scraper/.env.example scraper/output/.gitkeep scraper/map_districts.py .gitignore
git commit -m "feat: add Python scraper scaffold and district→region mapping"
```

---

## Task 5: Google Places scraper (`scraper/scrape_google.py`)

**Files:**
- Create: `scraper/scrape_google.py`

- [ ] **Step 1: Create `scraper/scrape_google.py`**

```python
"""
Fetches Uganda businesses from Google Places Nearby Search.

Usage:
  python scrape_google.py --type hospital --district Kampala --max 200
  python scrape_google.py --type school --district Wakiso --max 200

Output: scraper/output/YYYY-MM-DD-<type>-<district>.json

Google Places Nearby Search cost: $0.017 per request (20 results per page, max 3 pages = 60 results per search point).
For large districts, multiple search points are used with 10km radius.
"""

import argparse
import json
import os
import sys
import time
from datetime import date
from pathlib import Path

import requests
from dotenv import load_dotenv

from map_districts import get_region

load_dotenv()

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
if not API_KEY:
    sys.exit("ERROR: GOOGLE_PLACES_API_KEY not set in scraper/.env")

# District centre coordinates (lat, lng) for Nearby Search
DISTRICT_CENTRES: dict[str, tuple[float, float]] = {
    "Kampala":    (0.3476, 32.5825),
    "Wakiso":     (0.3983, 32.4882),
    "Mukono":     (0.3535, 32.7551),
    "Jinja":      (0.4244, 33.2041),
    "Mbale":      (1.0750, 34.1750),
    "Gulu":       (2.7747, 32.2990),
    "Mbarara":    (-0.6072, 30.6545),
    "Arua":       (3.0200, 30.9113),
    "Fort Portal": (0.6710, 30.2749),
    "Lira":       (2.2499, 32.8997),
    "Masaka":     (-0.3390, 31.7360),
    "Kabale":     (-1.2492, 29.9894),
    "Kasese":     (0.1866, 30.0857),
    "Hoima":      (1.4330, 31.3520),
    "Soroti":     (1.7147, 33.6110),
    "Tororo":     (0.6920, 34.1800),
}

# Maps Google place types to Business Yoo categories
TYPE_TO_CATEGORY: dict[str, str] = {
    "hospital":                  "Health & Pharmacy",
    "pharmacy":                  "Health & Pharmacy",
    "school":                    "Education & Tutoring",
    "university":                "Education & Tutoring",
    "bank":                      "Banks & Finance",
    "supermarket":               "Retail Shop",
    "lodging":                   "Hotel & Accommodation",
    "gym":                       "Gym & Fitness",
    "church":                    "Church",
    "mosque":                    "Mosque",
    "police":                    "Police & Security",
    "local_government_office":   "Government Office",
}

NEARBY_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"


def fetch_page(lat: float, lng: float, place_type: str, page_token: str | None = None) -> dict:
    params: dict = {
        "key": API_KEY,
        "location": f"{lat},{lng}",
        "radius": 10000,
        "type": place_type,
    }
    if page_token:
        params = {"key": API_KEY, "pagetoken": page_token}
    resp = requests.get(NEARBY_SEARCH_URL, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


def scrape_district(place_type: str, district: str, max_results: int) -> list[dict]:
    if district not in DISTRICT_CENTRES:
        sys.exit(f"ERROR: No coordinates for district '{district}'. Add it to DISTRICT_CENTRES in scrape_google.py.")

    lat, lng = DISTRICT_CENTRES[district]
    region = get_region(district)
    category = TYPE_TO_CATEGORY.get(place_type, "Other")

    results: list[dict] = []
    page_token: str | None = None
    page_num = 0
    request_count = 0

    while len(results) < max_results:
        if page_num > 0 and page_token is None:
            break  # no more pages

        if page_token:
            time.sleep(2)  # Google requires a short delay before using a page token

        data = fetch_page(lat, lng, place_type, page_token)
        request_count += 1
        status = data.get("status")

        if status == "ZERO_RESULTS":
            break
        if status not in ("OK", "ZERO_RESULTS"):
            print(f"  WARNING: API returned status '{status}' — stopping pagination.")
            break

        for place in data.get("results", []):
            if len(results) >= max_results:
                break
            results.append({
                "name":        place.get("name", "").strip(),
                "category":    category,
                "region":      region,
                "district":    district,
                "town":        None,
                "phone":       None,
                "source":      "google_places",
                "external_id": place.get("place_id"),
            })

        page_token = data.get("next_page_token")
        page_num += 1

    print(f"  Fetched {len(results)} results in {request_count} API requests (~${request_count * 0.017:.3f})")
    return results


def main():
    parser = argparse.ArgumentParser(description="Scrape Google Places for Uganda businesses.")
    parser.add_argument("--type",     required=True, help="Google place type, e.g. hospital, school, bank")
    parser.add_argument("--district", required=True, help="Uganda district name, e.g. Kampala, Wakiso")
    parser.add_argument("--max",      type=int, default=60, help="Max results (default 60, max ~180 per search point)")
    args = parser.parse_args()

    pages_estimate = min(3, (args.max + 19) // 20)
    cost_estimate = pages_estimate * 0.017
    print(f"\nScraping: type={args.type}, district={args.district}, max={args.max}")
    print(f"Estimated cost: ~${cost_estimate:.3f} ({pages_estimate} API requests)")
    confirm = input("Continue? (y/n): ").strip().lower()
    if confirm != "y":
        print("Aborted.")
        return

    results = scrape_district(args.type, args.district, args.max)

    if not results:
        print("No results found. Nothing saved.")
        return

    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)
    filename = f"{date.today()}-{args.type}-{args.district.lower().replace(' ', '-')}.json"
    output_path = output_dir / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(results)} businesses to scraper/output/{filename}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run a test scrape (Phase 1 — Kampala hospitals, max 20)**

```bash
cd d:/projects/uganda-business-ideas/scraper
python scrape_google.py --type hospital --district Kampala --max 20
```

Expected: Asks "Continue? (y/n):" → type `y` → prints something like "Saved 20 businesses to scraper/output/2026-05-22-hospital-Kampala.json"

- [ ] **Step 3: Inspect the output file**

Open `scraper/output/2026-05-22-hospital-kampala.json` and verify it looks like:

```json
[
  {
    "name": "Mulago National Referral Hospital",
    "category": "Health & Pharmacy",
    "region": "Central",
    "district": "Kampala",
    "town": null,
    "phone": null,
    "source": "google_places",
    "external_id": "ChIJ..."
  }
]
```

If the file is empty or has no `external_id` values, check your `GOOGLE_PLACES_API_KEY` in `scraper/.env`.

- [ ] **Step 4: Commit**

```bash
cd d:/projects/uganda-business-ideas
git add scraper/scrape_google.py
git commit -m "feat: add Google Places scraper script"
```

---

## Task 6: OSM scraper (`scraper/scrape_osm.py`)

**Files:**
- Create: `scraper/scrape_osm.py`

- [ ] **Step 1: Create `scraper/scrape_osm.py`**

```python
"""
Fetches petrol stations and bus parks in Uganda from OpenStreetMap Overpass API.
Completely free — no API key required.

Usage:
  python scrape_osm.py --amenity fuel
  python scrape_osm.py --amenity bus_station

Output: scraper/output/YYYY-MM-DD-osm-<amenity>.json
"""

import argparse
import json
import sys
import time
from datetime import date
from pathlib import Path

import requests

from map_districts import get_region

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Uganda bounding box: south, west, north, east
UGANDA_BBOX = "-1.48, 29.57, 4.22, 35.00"

AMENITY_TO_CATEGORY: dict[str, str] = {
    "fuel":        "Petrol Station",
    "bus_station": "Transport & Boda",
}

# Maps OSM addr:district values to the nearest known district.
# OSM data is inconsistent — many nodes have no district tag at all.
# When missing, we fall back to "Kampala" (most common urban area).
DEFAULT_DISTRICT = "Kampala"


def fetch_osm(amenity: str) -> list[dict]:
    query = f"""
    [out:json][timeout:60];
    (
      node["amenity"="{amenity}"]({UGANDA_BBOX});
      way["amenity"="{amenity}"]({UGANDA_BBOX});
    );
    out center;
    """
    print(f"Querying OSM Overpass for amenity={amenity} in Uganda...")
    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=90)
    resp.raise_for_status()
    data = resp.json()
    elements = data.get("elements", [])
    print(f"  Raw elements returned: {len(elements)}")
    return elements


def parse_elements(elements: list[dict], amenity: str) -> list[dict]:
    category = AMENITY_TO_CATEGORY.get(amenity, "Other")
    results = []

    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name", "").strip()
        if not name:
            continue  # skip unnamed nodes

        district = tags.get("addr:district") or tags.get("is_in:district") or DEFAULT_DISTRICT
        region = get_region(district)

        # OSM way elements have a 'center' key instead of lat/lon directly
        osm_id = f"osm-{el['type']}-{el['id']}"

        results.append({
            "name":        name,
            "category":    category,
            "region":      region,
            "district":    district,
            "town":        tags.get("addr:city") or tags.get("addr:town") or None,
            "phone":       tags.get("phone") or tags.get("contact:phone") or None,
            "source":      "osm",
            "external_id": osm_id,
        })

    return results


def main():
    parser = argparse.ArgumentParser(description="Scrape OSM for Uganda places (free).")
    parser.add_argument("--amenity", required=True, choices=["fuel", "bus_station"],
                        help="OSM amenity type: fuel or bus_station")
    args = parser.parse_args()

    elements = fetch_osm(args.amenity)
    results = parse_elements(elements, args.amenity)

    if not results:
        print("No named results found. Nothing saved.")
        return

    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)
    filename = f"{date.today()}-osm-{args.amenity.replace('_', '-')}.json"
    output_path = output_dir / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(results)} businesses to scraper/output/{filename}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run a test scrape (petrol stations — free)**

```bash
cd d:/projects/uganda-business-ideas/scraper
python scrape_osm.py --amenity fuel
```

Expected: "Saved X businesses to scraper/output/YYYY-MM-DD-osm-fuel.json" — typically 300–800 results for Uganda.

- [ ] **Step 3: Commit**

```bash
cd d:/projects/uganda-business-ideas
git add scraper/scrape_osm.py
git commit -m "feat: add OSM scraper for petrol stations and bus parks (free)"
```

---

## Task 7: API route — `/api/admin/import-places`

**Files:**
- Create: `app/api/admin/import-places/route.ts`

- [ ] **Step 1: Create `app/api/admin/import-places/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { BusinessInsert } from "@/lib/supabase/types";

export type ImportRow = {
  name: string;
  category: string;
  region: "Central" | "Eastern" | "Northern" | "Western";
  district: string;
  town: string | null;
  phone: string | null;
  source: string;
  external_id: string;
};

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows: ImportRow[] = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch existing external_ids to skip duplicates
  const externalIds = rows.map((r) => r.external_id).filter(Boolean);
  const { data: existing } = await supabase
    .from("businesses")
    .select("external_id")
    .in("external_id", externalIds);

  const existingSet = new Set((existing ?? []).map((r) => r.external_id));
  const newRows = rows.filter((r) => !existingSet.has(r.external_id));

  if (newRows.length === 0) {
    return NextResponse.json({ imported: 0, skipped: rows.length });
  }

  const inserts: BusinessInsert[] = newRows.map((r) => ({
    name:        r.name,
    category:    r.category,
    region:      r.region,
    district:    r.district,
    ...(r.town  && { town: r.town }),
    ...(r.phone && { phone: r.phone }),
    source:      r.source,
    external_id: r.external_id,
  }));

  const { error } = await supabase.from("businesses").insert(inserts);
  if (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: newRows.length, skipped: rows.length - newRows.length });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd d:/projects/uganda-business-ideas
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/import-places/route.ts
git commit -m "feat: add /api/admin/import-places POST endpoint with deduplication"
```

---

## Task 8: Admin import page UI

**Files:**
- Create: `app/admin/import-places/page.tsx`
- Create: `app/admin/import-places/ImportPlacesClient.tsx`

- [ ] **Step 1: Create `app/admin/import-places/page.tsx`**

```typescript
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ImportPlacesClient from "./ImportPlacesClient";

export default async function ImportPlacesPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-black text-[#1C3A2A] mb-1">Import Places</h1>
      <p className="text-sm text-gray-500 mb-6">
        Upload a JSON file from the Python scraper. Review the preview, then click Import.
      </p>
      <ImportPlacesClient />
    </main>
  );
}
```

- [ ] **Step 2: Create `app/admin/import-places/ImportPlacesClient.tsx`**

```typescript
"use client";

import { useRef, useState } from "react";
import type { ImportRow } from "@/app/api/admin/import-places/route";

type RowWithSelection = ImportRow & { selected: boolean };

export default function ImportPlacesClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<RowWithSelection[]>([]);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError("");
    setResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error("File must be a JSON array.");
        const withSelection: RowWithSelection[] = parsed.map((r: ImportRow) => ({
          ...r,
          selected: true,
        }));
        setRows(withSelection);
      } catch {
        setParseError("Invalid JSON file. Make sure it came from the scraper.");
      }
    };
    reader.readAsText(file);
  };

  const toggleAll = (selected: boolean) => {
    setRows((prev) => prev.map((r) => ({ ...r, selected })));
  };

  const toggleRow = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
    );
  };

  const selectedRows = rows.filter((r) => r.selected);

  const handleImport = async () => {
    if (selectedRows.length === 0) return;
    setImporting(true);
    setResult(null);

    const res = await fetch("/api/admin/import-places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedRows),
    });

    const data = await res.json();
    setImporting(false);

    if (!res.ok) {
      setParseError(data.error ?? "Import failed.");
    } else {
      setResult(data);
      setRows([]);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">
          Upload scraper JSON file
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFile}
          className="block border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        />
      </div>

      {parseError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {parseError}
        </div>
      )}

      {result && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Done! {result.imported} imported, {result.skipped} skipped (already existed).{" "}
          <a href="/admin/businesses" className="font-bold underline">
            Review pending businesses →
          </a>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              {rows.length} businesses found · {selectedRows.length} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAll(true)}
                className="text-xs font-bold text-[#1C3A2A] underline"
              >
                Select all
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="text-xs font-bold text-gray-400 underline"
              >
                Deselect all
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#1C3A2A] text-white">
                  <th className="p-3 text-left w-8"></th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Region</th>
                  <th className="p-3 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.external_id}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      !r.selected ? "opacity-40" : ""
                    }`}
                    onClick={() => toggleRow(idx)}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={r.selected}
                        onChange={() => toggleRow(idx)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 text-gray-600">{r.category}</td>
                    <td className="p-3 text-gray-600">{r.district}</td>
                    <td className="p-3 text-gray-600">{r.region}</td>
                    <td className="p-3 text-gray-400 text-xs">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={importing || selectedRows.length === 0}
            className="w-full rounded-xl bg-[#1C3A2A] py-3 text-sm font-black text-[#F5C842] disabled:opacity-50"
          >
            {importing
              ? "Importing..."
              : `Import ${selectedRows.length} businesses →`}
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd d:/projects/uganda-business-ideas
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/admin/import-places/page.tsx app/admin/import-places/ImportPlacesClient.tsx
git commit -m "feat: add /admin/import-places UI for reviewing and bulk-importing scraped businesses"
```

---

## Task 9: Add import link to admin navigation

**Files:**
- Modify: `app/admin/businesses/page.tsx`

- [ ] **Step 1: Add import link at top of admin businesses page**

Open `app/admin/businesses/page.tsx`. After the `<h1>` tag, add a link to the import page:

```typescript
// In AdminBusinessesPage, after the <h1> tag:
<div className="flex items-center justify-between mb-4">
  <h1 className="text-xl font-black text-[#1C3A2A]">Pending Businesses ({businesses.length})</h1>
  <a
    href="/admin/import-places"
    className="rounded-lg bg-[#1C3A2A] px-4 py-2 text-xs font-bold text-[#F5C842]"
  >
    + Import from scraper
  </a>
</div>
```

Replace the existing standalone `<h1>` line with this `<div>` block.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd d:/projects/uganda-business-ideas
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/businesses/page.tsx
git commit -m "feat: add import-places link to admin businesses page"
```

---

## Task 10: End-to-end smoke test

- [ ] **Step 1: Start the dev server**

```bash
cd d:/projects/uganda-business-ideas
npm run dev
```

- [ ] **Step 2: Run a small scrape if you haven't already**

```bash
cd d:/projects/uganda-business-ideas/scraper
python scrape_google.py --type hospital --district Kampala --max 20
```

- [ ] **Step 3: Log in to admin and navigate to import page**

Open `http://localhost:3000/admin/login` → log in → navigate to `http://localhost:3000/admin/businesses` → click "Import from scraper".

- [ ] **Step 4: Upload the JSON and import**

Upload `scraper/output/YYYY-MM-DD-hospital-kampala.json` → verify table shows businesses → click "Import X businesses" → verify success message says "X imported".

- [ ] **Step 5: Check they appear as pending**

Go to `http://localhost:3000/admin/businesses` → verify the imported hospitals appear with Approve/Reject buttons.

- [ ] **Step 6: Approve one and verify it appears on the map**

Click Approve on one hospital → go to `http://localhost:3000/businesses` → filter by Central region → verify the hospital appears.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: complete Uganda business scraper + admin import pipeline"
```

---

## Phased Scraping Schedule (after smoke test passes)

Run these commands one at a time. Each costs a few dollars at most.

**Phase 1 — Already done above (Kampala hospitals, ~$0.50)**

**Phase 2 — All categories, 8 major cities (~$60)**

```bash
# Run each of these from scraper/
python scrape_google.py --type hospital             --district Kampala --max 60
python scrape_google.py --type school               --district Kampala --max 60
python scrape_google.py --type bank                 --district Kampala --max 60
python scrape_google.py --type pharmacy             --district Kampala --max 60
python scrape_google.py --type supermarket          --district Kampala --max 60
python scrape_google.py --type lodging              --district Kampala --max 60
python scrape_google.py --type gym                  --district Kampala --max 60
python scrape_google.py --type church               --district Kampala --max 60
python scrape_google.py --type mosque               --district Kampala --max 60
python scrape_google.py --type police               --district Kampala --max 60
python scrape_google.py --type local_government_office --district Kampala --max 20
# Repeat above block for: Wakiso, Jinja, Mbale, Gulu, Mbarara, Arua, Fort Portal

# OSM (free — run any time)
python scrape_osm.py --amenity fuel
python scrape_osm.py --amenity bus_station
```

**Phase 3 — Remaining 127 districts (~$65)**

Add remaining district coordinates to `DISTRICT_CENTRES` in `scrape_google.py`, then repeat Phase 2 commands per district.
