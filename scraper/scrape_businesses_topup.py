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
