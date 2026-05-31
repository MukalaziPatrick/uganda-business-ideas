def score(listing: dict) -> dict:
    """
    Assigns trust_score (1-5) and trust_flags to an enriched listing.
    Returns the listing dict with trust_score and trust_flags added.
    """
    flags = []

    price = listing.get("price_ugx")
    size = listing.get("size_acres")
    contact = listing.get("contact_phone")
    district = listing.get("district")
    road = listing.get("road_area")

    # Flag: suspiciously cheap (< 500k per acre)
    if price and size and size > 0 and (price / size) < 500_000:
        flags.append("price_too_low")

    # Flag: no contact
    if not contact:
        flags.append("no_contact")

    # Flag: vague location (no district AND no road)
    if not district and not road:
        flags.append("vague_location")

    # Flag: no size
    if not size:
        flags.append("no_size_given")

    # Compute score
    if len(flags) == 0 and contact and district:
        score_val = 5
    elif len(flags) == 0:
        score_val = 4
    elif len(flags) == 1 and "price_too_low" not in flags and "no_contact" not in flags:
        score_val = 3
    elif len(flags) >= 2 or "price_too_low" in flags or "no_contact" in flags:
        score_val = 2 if len(flags) < 3 else 1
    else:
        score_val = 3

    listing["trust_score"] = score_val
    listing["trust_flags"] = flags
    return listing
