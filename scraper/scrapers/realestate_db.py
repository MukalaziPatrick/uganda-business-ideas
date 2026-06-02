import httpx
from bs4 import BeautifulSoup
import logging
import time

log = logging.getLogger(__name__)

BASE_URL = "https://www.realestatedatabase.net"
LAND_URL = f"{BASE_URL}/FindAHouse/Index.aspx?Category=Land&Status=For+Sale"
RED_DIR = f"{BASE_URL}/FindAHouse"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": LAND_URL,
}


def _build_detail_url(href: str) -> str:
    if href.startswith("http"):
        return href
    href = href.split("#")[0]
    return RED_DIR + "/" + href.lstrip("/")


def _scrape_detail(client: httpx.Client, url: str) -> str:
    try:
        resp = client.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
        resp.raise_for_status()
    except Exception as e:
        log.warning(f"RED detail fetch failed for {url}: {e}")
        return ""

    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    # Extract QUICK SUMMARY block (same structure as Lamudi)
    summary = None
    for tag in soup.find_all(string=lambda t: t and "QUICK SUMMARY" in t.upper()):
        summary = tag.find_parent()
        if summary:
            for _ in range(5):
                if summary.parent:
                    summary = summary.parent
                if len(summary.get_text(strip=True)) > 200:
                    break

    desc = None
    for tag in soup.find_all(string=lambda t: t and "DESCRIPTION" in t.upper()):
        desc = tag.find_parent()
        if desc:
            for _ in range(3):
                if desc.parent:
                    desc = desc.parent
                if len(desc.get_text(strip=True)) > 100:
                    break

    parts = []
    if summary:
        parts.append(summary.get_text(separator=" ", strip=True))
    if desc:
        parts.append(desc.get_text(separator=" ", strip=True)[:500])

    if parts:
        return " ".join(parts)

    body = soup.body
    full = body.get_text(separator=" ", strip=True) if body else soup.get_text(separator=" ", strip=True)
    return full[:3000]


def scrape(max_listings: int = 20) -> list[dict]:
    listings = []

    with httpx.Client() as client:
        try:
            resp = client.get(LAND_URL, headers=HEADERS, timeout=20, follow_redirects=True)
            resp.raise_for_status()
        except Exception as e:
            log.warning(f"RED index page failed: {e}")
            return listings

        soup = BeautifulSoup(resp.text, "html.parser")

        # Collect unique HouseCode links
        seen = set()
        hrefs = []
        for a in soup.select("a[href]"):
            href = a.get("href", "")
            if "HouseCode=" in href:
                href_clean = href.split("#")[0]
                if href_clean not in seen:
                    seen.add(href_clean)
                    hrefs.append(href_clean)
            if len(hrefs) >= max_listings:
                break

        if not hrefs:
            log.info("RED: no listing links found")
            return listings

        for href in hrefs:
            detail_url = _build_detail_url(href)
            title_hint = ""  # will be filled from detail page text

            detail_text = _scrape_detail(client, detail_url)
            if not detail_text:
                continue

            # Extract title from first line of summary
            title_hint = detail_text.split("Code:")[0].strip()[:80] if "Code:" in detail_text else "Land for sale"

            listings.append({
                "title": title_hint,
                "raw_text": detail_text,
                "source_url": detail_url,
                "source_site": "realestate_db",
            })

            time.sleep(1)

    log.info(f"RED total raw listings: {len(listings)}")
    return listings
