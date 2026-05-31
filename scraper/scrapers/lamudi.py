import httpx
from bs4 import BeautifulSoup
import logging

log = logging.getLogger(__name__)

BASE_URL = "https://www.lamudi.co.ug"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
}

def scrape(max_pages: int = 5) -> list[dict]:
    """
    Scrape Lamudi Uganda land listings.
    Returns list of raw dicts with keys: title, raw_text, source_url, source_site.
    """
    listings = []
    for page in range(1, max_pages + 1):
        url = f"{BASE_URL}/land/for-sale/?page={page}"
        try:
            resp = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
            resp.raise_for_status()
        except Exception as e:
            log.warning(f"Lamudi page {page} failed: {e}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("article.js-listing-item")
        if not cards:
            log.info(f"Lamudi: no cards on page {page}, stopping")
            break

        for card in cards:
            link_el = card.select_one("a.card-image")
            title_el = card.select_one("h2.listing-title")
            if not link_el or not title_el:
                continue
            href = link_el.get("href", "")
            title = title_el.get_text(strip=True)
            source_url = href if href.startswith("http") else BASE_URL + href
            raw_text = card.get_text(separator=" ", strip=True)

            listings.append({
                "title": title,
                "raw_text": raw_text,
                "source_url": source_url,
                "source_site": "lamudi",
            })

        log.info(f"Lamudi page {page}: {len(cards)} listings found")

    log.info(f"Lamudi total raw listings: {len(listings)}")
    return listings
