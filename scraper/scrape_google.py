"""
Fetches Uganda businesses from Google Places Nearby Search.

Usage:
  python scrape_google.py --type hospital --district Kampala --max 200
  python scrape_google.py --type school --district Wakiso --max 200

Output: scraper/output/YYYY-MM-DD-<type>-<district>.json

Google Places Nearby Search cost: $0.017 per request (20 results per page, max 3 pages = 60 results per search point).
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

DISTRICT_CENTRES: dict[str, tuple[float, float]] = {
    "Kampala":     (0.3476, 32.5825),
    "Wakiso":      (0.3983, 32.4882),
    "Mukono":      (0.3535, 32.7551),
    "Jinja":       (0.4244, 33.2041),
    "Mbale":       (1.0750, 34.1750),
    "Gulu":        (2.7747, 32.2990),
    "Mbarara":     (-0.6072, 30.6545),
    "Arua":        (3.0200, 30.9113),
    "Fort Portal": (0.6710, 30.2749),
    "Lira":        (2.2499, 32.8997),
    "Masaka":      (-0.3390, 31.7360),
    "Kabale":      (-1.2492, 29.9894),
    "Kasese":      (0.1866, 30.0857),
    "Hoima":       (1.4330, 31.3520),
    "Soroti":      (1.7147, 33.6110),
    "Tororo":      (0.6920, 34.1800),
}

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

NEARBY_SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby"


def fetch_page(lat: float, lng: float, place_type: str, page_token: str | None = None) -> dict:
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": (
            "places.displayName,places.id,places.formattedAddress,"
            "places.location,places.nationalPhoneNumber,places.websiteUri,"
            "places.editorialSummary,places.currentOpeningHours"
        ),
    }
    body: dict = {
        "includedTypes": [place_type],
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 10000.0,
            }
        },
    }
    if page_token:
        body["pageToken"] = page_token
    resp = requests.post(NEARBY_SEARCH_URL, json=body, headers=headers, timeout=10)
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
            break

        if page_token:
            time.sleep(2)

        data = fetch_page(lat, lng, place_type, page_token)
        request_count += 1

        places = data.get("places", [])
        if not places:
            break

        for place in places:
            if len(results) >= max_results:
                break
            loc = place.get("location", {})
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

        page_token = data.get("nextPageToken")
        page_num += 1

    print(f"  Fetched {len(results)} results in {request_count} API requests (~${request_count * 0.017:.3f})")
    return results


def main():
    parser = argparse.ArgumentParser(description="Scrape Google Places for Uganda businesses.")
    parser.add_argument("--type",     required=True, help="Google place type, e.g. hospital, school, bank")
    parser.add_argument("--district", required=True, help="Uganda district name, e.g. Kampala, Wakiso")
    parser.add_argument("--max",      type=int, default=60, help="Max results (default 60)")
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
