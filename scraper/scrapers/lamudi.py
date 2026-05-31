import httpx
from bs4 import BeautifulSoup
import logging

log = logging.getLogger(__name__)

BASE_URL = "https://www.lamudi.co.ug"
LAND_URL = f"{BASE_URL}/Lamudi/Index.aspx"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

def scrape(max_pages: int = 5) -> list[dict]:
    listings = []
    try:
        resp = httpx.get(LAND_URL, headers=HEADERS, timeout=20, follow_redirects=True)
        resp.raise_for_status()
    except Exception as e:
        log.warning(f"Lamudi page 1 failed: {e}")
        return listings

    soup = BeautifulSoup(resp.text, "html.parser")

    # Cards are divs with a title attribute containing "for sale" or "for rent"
    cards = soup.select("div[id*='DataList5_Panel1_']")
    if not cards:
        log.info("Lamudi: no cards found on homepage")
        return listings

    for card in cards:
        link_el = card.select_one("a[href]")
        title_el = card.select_one("span[id*='ManualTitleLabel']") or card.select_one("span[id*='PropertyType']")
        if not link_el:
            continue
        href = link_el.get("href", "")
        title = card.get("title", "") or (title_el.get_text(strip=True) if title_el else "")
        source_url = href if href.startswith("http") else BASE_URL + "/" + href.lstrip("/")
        raw_text = card.get_text(separator=" ", strip=True)

        listings.append({
            "title": title,
            "raw_text": raw_text,
            "source_url": source_url,
            "source_site": "lamudi",
        })

    log.info(f"Lamudi total raw listings: {len(listings)}")
    return listings
