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
from datetime import date
from pathlib import Path

import requests

from map_districts import get_region

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

UGANDA_BBOX = "-1.48, 29.57, 4.22, 35.00"

AMENITY_TO_CATEGORY: dict[str, str] = {
    "fuel":        "Petrol Station",
    "bus_station": "Transport & Boda",
}

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
            continue

        district = tags.get("addr:district") or tags.get("is_in:district") or DEFAULT_DISTRICT
        region = get_region(district)
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
