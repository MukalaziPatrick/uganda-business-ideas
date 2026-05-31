import os
import json
import logging
from openai import OpenAI

log = logging.getLogger(__name__)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)

SYSTEM_PROMPT = """You are a Uganda land listing data extractor.
Given raw text from a land listing, extract structured fields.
Return ONLY valid JSON with these exact keys:
{
  "title": "clean listing title",
  "price_ugx": 9000000,
  "size_acres": 5.0,
  "land_type": "Mailo",
  "district": "Mukono",
  "road_area": "Kayunga road",
  "has_title": true,
  "contact_phone": "+256700123456"
}
Rules:
- price_ugx: integer in UGX. Convert "9M" to 9000000. null if unknown.
- size_acres: decimal. null if unknown.
- land_type: one of "Mailo", "Freehold", "Leasehold", "Kibanja", or null.
- district: Uganda district name only. null if unclear.
- road_area: road or area name. null if not mentioned.
- has_title: true if title deed mentioned, false if "no title", null if unclear.
- contact_phone: Uganda phone number starting with +256 or 07x. null if not found.
Return only the JSON object, no explanation."""

def enrich(raw: dict) -> dict:
    """
    Takes a raw listing dict (title, raw_text, source_url, source_site).
    Returns enriched dict with all land_market fields populated.
    """
    prompt = f"Title: {raw.get('title', '')}\n\nFull text: {raw.get('raw_text', '')}"
    try:
        resp = client.chat.completions.create(
            model="anthropic/claude-sonnet-4-6",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_tokens=512,
            temperature=0,
        )
        text = resp.choices[0].message.content.strip()
        extracted = json.loads(text)
    except Exception as e:
        log.warning(f"Enrichment failed for {raw.get('source_url')}: {e}")
        extracted = {}

    return {
        "title": extracted.get("title") or raw.get("title", "Untitled"),
        "raw_text": raw.get("raw_text"),
        "price_ugx": extracted.get("price_ugx"),
        "size_acres": extracted.get("size_acres"),
        "land_type": extracted.get("land_type"),
        "district": extracted.get("district"),
        "road_area": extracted.get("road_area"),
        "has_title": extracted.get("has_title"),
        "contact_phone": extracted.get("contact_phone"),
        "source_url": raw.get("source_url"),
        "source_site": raw.get("source_site"),
    }
