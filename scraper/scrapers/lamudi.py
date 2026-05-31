import httpx
from bs4 import BeautifulSoup
import logging
import time

log = logging.getLogger(__name__)

BASE_URL = "https://www.lamudi.co.ug"
LAND_URL = f"{BASE_URL}/Lamudi/Index.aspx"
# Base for resolving relative links from pages under /Lamudi/
LAMUDI_DIR = f"{BASE_URL}/Lamudi"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": LAND_URL,
}


def _build_detail_url(href: str) -> str:
    """Resolve a relative href from the /Lamudi/ directory."""
    if href.startswith("http"):
        return href
    # Strip fragment (#...) before building URL
    href = href.split("#")[0]
    return LAMUDI_DIR + "/" + href.lstrip("/")


def _scrape_detail(client: httpx.Client, url: str) -> str:
    """Fetch the HouseDetails page and return all visible text."""
    try:
        resp = client.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
        resp.raise_for_status()
    except Exception as e:
        log.warning(f"Lamudi detail fetch failed for {url}: {e}")
        return ""

    soup = BeautifulSoup(resp.text, "html.parser")

    # Remove script/style noise
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    # Target the main content area — Lamudi ASP.NET uses a table-based layout
    # Try common content wrappers first, fall back to full body text
    # Try to find the QUICK SUMMARY section by label text
    # Lamudi renders a table with Code/Location/District/Price/Size/Tenure/Agent/Contact
    summary = None
    for tag in soup.find_all(string=lambda t: t and "QUICK SUMMARY" in t.upper()):
        summary = tag.find_parent()
        if summary:
            # Walk up to a container that holds the full summary table
            for _ in range(5):
                if summary.parent:
                    summary = summary.parent
                if len(summary.get_text(strip=True)) > 200:
                    break

    # Also grab description block
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
        parts.append(desc.get_text(separator=" ", strip=True))

    if parts:
        return " ".join(parts)

    # Fallback: full body but capped at 3000 chars to keep AI prompt small
    body = soup.body
    full = body.get_text(separator=" ", strip=True) if body else soup.get_text(separator=" ", strip=True)
    return full[:3000]


def _page_url(page: int) -> str:
    if page == 1:
        return LAND_URL
    return f"{LAND_URL}?page={page}"


def scrape(max_pages: int = 5) -> list[dict]:
    listings = []
    seen_urls: set[str] = set()

    with httpx.Client() as client:
        for page_num in range(1, max_pages + 1):
            page_url = _page_url(page_num)
            log.info(f"Lamudi: fetching page {page_num} — {page_url}")
            try:
                resp = client.get(page_url, headers=HEADERS, timeout=20, follow_redirects=True)
                resp.raise_for_status()
            except Exception as e:
                log.warning(f"Lamudi page {page_num} failed: {e}")
                break

            soup = BeautifulSoup(resp.text, "html.parser")

            cards = soup.select("div[id*='DataList5_Panel1_']")
            if not cards:
                log.info(f"Lamudi: no cards on page {page_num} — stopping pagination")
                break

            new_on_page = 0
            for card in cards:
                link_el = card.select_one("a[href]")
                if not link_el:
                    continue

                href = link_el.get("href", "")
                if not href or href.startswith("#") or href.startswith("javascript"):
                    continue

                detail_url = _build_detail_url(href)

                if "HouseCode=" not in detail_url and "HouseDetails" not in detail_url:
                    house_code = None
                    for a in card.select("a[href]"):
                        h = a.get("href", "")
                        if "HouseCode=" in h or "HouseDetails" in h:
                            house_code = h
                            break
                    if house_code:
                        detail_url = _build_detail_url(house_code)

                if detail_url in seen_urls:
                    continue
                seen_urls.add(detail_url)

                title_el = (
                    card.select_one("span[id*='ManualTitleLabel']")
                    or card.select_one("span[id*='PropertyType']")
                )
                title = card.get("title", "") or (title_el.get_text(strip=True) if title_el else "")
                card_text = card.get_text(separator=" ", strip=True)

                detail_text = _scrape_detail(client, detail_url)
                raw_text = detail_text if detail_text else card_text

                listings.append({
                    "title": title,
                    "raw_text": raw_text,
                    "source_url": detail_url,
                    "source_site": "lamudi",
                })
                new_on_page += 1
                time.sleep(1)

            log.info(f"Lamudi page {page_num}: {new_on_page} new listings")

            if new_on_page == 0:
                break

            time.sleep(2)

    log.info(f"Lamudi total raw listings: {len(listings)}")
    return listings
