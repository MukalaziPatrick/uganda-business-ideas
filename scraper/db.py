import os
from supabase import create_client, Client

def get_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    return create_client(url, key)

def upsert_listing(listing: dict) -> dict | None:
    """
    Insert a new listing or update price_ugx + scraped_at if source_url exists.
    Returns the saved row or None on error.
    """
    sb = get_client()
    source_url = listing.get("source_url")
    if not source_url:
        return None

    # Check for existing
    existing = sb.table("land_market").select("id").eq("source_url", source_url).execute()
    if existing.data:
        row_id = existing.data[0]["id"]
        sb.table("land_market").update({
            "price_ugx": listing.get("price_ugx"),
            "size_acres": listing.get("size_acres"),
            "district": listing.get("district"),
            "road_area": listing.get("road_area"),
            "contact_phone": listing.get("contact_phone"),
            "land_type": listing.get("land_type"),
            "has_title": listing.get("has_title"),
            "trust_score": listing.get("trust_score"),
            "trust_flags": listing.get("trust_flags"),
            "scraped_at": "now()",
        }).eq("id", row_id).execute()
        # Return None so Telegram is NOT re-sent for existing rows
        return None

    result = sb.table("land_market").insert(listing).execute()
    return result.data[0] if result.data else None

def update_listing_status(listing_id: str, status: str, reviewed_by: str) -> None:
    sb = get_client()
    sb.table("land_market").update({
        "status": status,
        "reviewed_by": reviewed_by,
        "reviewed_at": "now()",
    }).eq("id", listing_id).execute()
