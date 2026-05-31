import os
import re
import json
import logging
from openai import OpenAI

log = logging.getLogger(__name__)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY", ""),
)


def _parse_regex(text: str) -> dict:
    """Fast regex extraction from Lamudi QUICK SUMMARY block — no AI needed."""
    result = {}

    # Price: "Ugx 120,000,000/=" or "UGX 120,000,000"
    m = re.search(r'(?:Ugx|UGX|ugx)[^\d]*(\d[\d,]+)', text)
    if m:
        try:
            result["price_ugx"] = int(m.group(1).replace(",", ""))
        except ValueError:
            pass

    # Size in Decimals or Acres
    m = re.search(r'(\d+(?:\.\d+)?)\s*(Decimals?|Acres?|decimals?|acres?|perches?)', text)
    if m:
        val = float(m.group(1))
        unit = m.group(2).lower()
        # Convert decimals to acres (100 decimals = 1 acre)
        if "decimal" in unit or "perch" in unit:
            result["size_acres"] = round(val / 100, 4)
        else:
            result["size_acres"] = val

    # Land tenure
    for tenure in ["Private Mailo", "Mailo", "Freehold", "Leasehold", "Kibanja"]:
        if tenure.lower() in text.lower():
            result["land_type"] = tenure if tenure != "Private Mailo" else "Mailo"
            break

    # District
    m = re.search(r'District[:\s]+([A-Z][a-z]+)', text)
    if m:
        result["district"] = m.group(1)

    # Location / road area
    m = re.search(r'Location[:\s]+([^\n,]+?)(?:\s+District|\s+Price|\s*$)', text)
    if m:
        result["road_area"] = m.group(1).strip()

    # Has title (Mailo/Freehold = titled)
    if re.search(r'(title deed|titled land|freehold|private mailo)', text, re.I):
        result["has_title"] = True
    elif re.search(r'no title|kibanja', text, re.I):
        result["has_title"] = False

    # Contact phone — prefer "Call" number over support numbers
    m = re.search(r'(?:Call|Agent)[^\+\d]*(\+256\d{9}|07\d{8})', text)
    if not m:
        m = re.search(r'(\+256\d{9}|07\d{8})', text)
    if m:
        num = m.group(1)
        # Skip Lamudi support numbers
        if num not in ("+256705162000", "+256788162000"):
            result["contact_phone"] = num

    return result

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
    Tries regex first; falls back to AI for any missing fields.
    """
    raw_text = raw.get("raw_text", "")

    # --- Fast path: regex extraction ---
    extracted = _parse_regex(raw_text)
    log.info(f"Regex extracted for {raw.get('source_url','?')}: {extracted}")

    # --- AI fallback only if key fields still missing ---
    missing = [f for f in ("price_ugx", "size_acres", "district", "contact_phone") if not extracted.get(f)]
    if missing and os.environ.get("OPENROUTER_API_KEY"):
        prompt = f"Title: {raw.get('title', '')}\n\nFull text: {raw_text[:2000]}"
        try:
            resp = client.chat.completions.create(
                model="anthropic/claude-haiku-4-5",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=512,
                temperature=0,
            )
            text = resp.choices[0].message.content.strip()
            ai_data = json.loads(text)
            # Only fill in what regex missed
            for field in missing:
                if ai_data.get(field):
                    extracted[field] = ai_data[field]
            # AI can also fill title
            if not extracted.get("title") and ai_data.get("title"):
                extracted["title"] = ai_data["title"]
        except Exception as e:
            log.warning(f"AI enrichment failed for {raw.get('source_url')}: {e}")

    return {
        "title": extracted.get("title") or raw.get("title", "Untitled"),
        "raw_text": raw_text,
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
