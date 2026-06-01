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
