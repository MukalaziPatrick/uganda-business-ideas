# Land Market Scraper & `/land/market` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-updating land market radar that scrapes OLX Uganda + Lamudi daily, enriches listings with AI, routes suspicious ones to a Telegram group for approval, and displays results on a new `/land/market` page in Business Yoo.

**Architecture:** A Python service on Railway scrapes two sources daily at 6AM EAT, sends each raw listing to OpenRouter/Claude for field extraction, scores trust 1–5, auto-publishes score 3–5 listings to Supabase `land_market`, and holds score 1–2 for Telegram group approval. The Next.js frontend reads from `land_market` on `/land/market` with full filtering. SafeLands verified listings (`land_listings`) are never touched.

**Tech Stack:** Python 3.11, httpx, BeautifulSoup4, APScheduler, python-telegram-bot, supabase-py, OpenRouter API (claude-sonnet-4-6), Next.js 14, Supabase, Railway, Vercel.

---

## File Map

### New files — Python scraper (Railway service)
| File | Responsibility |
|---|---|
| `scraper/main.py` | Entry point + APScheduler (daily 6AM EAT) |
| `scraper/scrapers/olx.py` | Scrape OLX Uganda /property/land pages |
| `scraper/scrapers/lamudi.py` | Scrape Lamudi Uganda land listings |
| `scraper/enricher.py` | OpenRouter call → structured JSON fields |
| `scraper/verifier.py` | Assign trust_score 1–5 + trust_flags list |
| `scraper/telegram_bot.py` | Send flagged listings + handle Approve/Reject callbacks |
| `scraper/db.py` | Supabase upsert with source_url dedup |
| `scraper/requirements.txt` | Python dependencies |
| `scraper/Dockerfile` | Railway container config |
| `scraper/.env.example` | Document required env vars |

### New files — Next.js (Business Yoo)
| File | Responsibility |
|---|---|
| `lib/land/market-queries.ts` | Supabase queries for `land_market` table |
| `app/land/market/page.tsx` | Server component — filter params + data fetch |
| `app/land/market/MarketClient.tsx` | Client component — filter UI + listing grid |
| `app/land/market/MarketListingCard.tsx` | Single card for a scraped listing |

### Modified files — Next.js (Business Yoo)
| File | Change |
|---|---|
| `app/layout.tsx` | Add nav bar with Land link |
| `app/apps/page.tsx` | Upgrade Land card to featured with search box |

---

## Phase 1 — Supabase Table + Scraper Skeleton

### Task 1: Create `land_market` Supabase table

**Files:**
- Create: `scraper/migrations/001_land_market.sql`

- [ ] **Step 1: Write the migration SQL**

Create `scraper/migrations/001_land_market.sql`:

```sql
create table if not exists land_market (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  raw_text text,
  price_ugx bigint,
  size_acres decimal,
  land_type text,
  district text,
  road_area text,
  has_title boolean,
  contact_phone text,
  trust_score int check (trust_score between 1 and 5),
  trust_flags text[] default '{}',
  status text not null default 'pending'
    check (status in ('pending','published','rejected')),
  source_url text unique not null,
  source_site text not null,
  scraped_at timestamptz not null default now(),
  reviewed_by text,
  reviewed_at timestamptz
);

create index if not exists land_market_status_idx on land_market(status);
create index if not exists land_market_district_idx on land_market(district);
create index if not exists land_market_scraped_idx on land_market(scraped_at desc);
```

- [ ] **Step 2: Run the migration in Supabase SQL editor**

Go to your Supabase project → SQL Editor → paste the contents of `001_land_market.sql` → Run.

Expected: "Success. No rows returned."

- [ ] **Step 3: Verify the table exists**

In Supabase Table Editor, confirm `land_market` appears with all columns. Check that `source_url` has a unique constraint.

- [ ] **Step 4: Commit**

```bash
git add scraper/migrations/001_land_market.sql
git commit -m "feat: add land_market Supabase table migration"
```

---

### Task 2: Scraper skeleton with db.py

**Files:**
- Create: `scraper/db.py`
- Create: `scraper/requirements.txt`
- Create: `scraper/.env.example`

- [ ] **Step 1: Create requirements.txt**

```
httpx==0.27.0
beautifulsoup4==4.12.3
apscheduler==3.10.4
python-telegram-bot==21.3
supabase==2.5.0
openai==1.30.0
python-dotenv==1.0.1
```

- [ ] **Step 2: Create .env.example**

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
OPENROUTER_API_KEY=sk-or-...
TELEGRAM_BOT_TOKEN=123456:ABC-your-bot-token
TELEGRAM_GROUP_ID=-1001234567890
```

- [ ] **Step 3: Write db.py**

Create `scraper/db.py`:

```python
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
        result = sb.table("land_market").update({
            "price_ugx": listing.get("price_ugx"),
            "scraped_at": "now()",
        }).eq("id", row_id).execute()
        return result.data[0] if result.data else None

    result = sb.table("land_market").insert(listing).execute()
    return result.data[0] if result.data else None

def update_listing_status(listing_id: str, status: str, reviewed_by: str) -> None:
    sb = get_client()
    sb.table("land_market").update({
        "status": status,
        "reviewed_by": reviewed_by,
        "reviewed_at": "now()",
    }).eq("id", listing_id).execute()
```

- [ ] **Step 4: Install dependencies locally to verify no syntax errors**

```bash
cd scraper
pip install -r requirements.txt
python -c "import db; print('db.py OK')"
```

Expected: `db.py OK`

- [ ] **Step 5: Commit**

```bash
git add scraper/db.py scraper/requirements.txt scraper/.env.example
git commit -m "feat: scraper db layer with upsert and status update"
```

---

### Task 3: Dockerfile + Railway skeleton

**Files:**
- Create: `scraper/Dockerfile`
- Create: `scraper/main.py`

- [ ] **Step 1: Write Dockerfile**

Create `scraper/Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

- [ ] **Step 2: Write main.py skeleton**

Create `scraper/main.py`:

```python
import os
import logging
from dotenv import load_dotenv
from apscheduler.schedulers.blocking import BlockingScheduler

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

def run_scrape():
    log.info("Scrape job started")
    # Phase 2: scrapers will be called here
    log.info("Scrape job complete")

if __name__ == "__main__":
    scheduler = BlockingScheduler(timezone="Africa/Kampala")
    # Run daily at 6:00 AM EAT
    scheduler.add_job(run_scrape, "cron", hour=6, minute=0)
    log.info("Scheduler started — next run at 6:00 AM EAT")
    # Run once immediately on start so Railway logs show it working
    run_scrape()
    scheduler.start()
```

- [ ] **Step 3: Test locally**

```bash
cd scraper
python main.py
```

Expected output:
```
... INFO Scrape job started
... INFO Scrape job complete
... INFO Scheduler started — next run at 6:00 AM EAT
```

Press Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add scraper/Dockerfile scraper/main.py
git commit -m "feat: scraper Dockerfile and scheduler skeleton"
```

---

## Phase 2 — OLX + Lamudi Scrapers + AI Enrichment

### Task 4: OLX Uganda scraper

**Files:**
- Create: `scraper/scrapers/__init__.py`
- Create: `scraper/scrapers/olx.py`

- [ ] **Step 1: Create scrapers/__init__.py**

```python
```
(empty file)

- [ ] **Step 2: Write olx.py**

Create `scraper/scrapers/olx.py`:

```python
import httpx
from bs4 import BeautifulSoup
import logging

log = logging.getLogger(__name__)

BASE_URL = "https://www.olx.co.ug"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
}

def scrape(max_pages: int = 5) -> list[dict]:
    """
    Scrape OLX Uganda land listings.
    Returns list of raw dicts with keys: title, raw_text, source_url, source_site.
    """
    listings = []
    for page in range(1, max_pages + 1):
        url = f"{BASE_URL}/property/land/?page={page}"
        try:
            resp = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
            resp.raise_for_status()
        except Exception as e:
            log.warning(f"OLX page {page} failed: {e}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        # OLX listing cards are <li> elements with data-aut-id="itemBox"
        cards = soup.select("li[data-aut-id='itemBox']")
        if not cards:
            log.info(f"OLX: no cards on page {page}, stopping")
            break

        for card in cards:
            link_el = card.select_one("a[data-aut-id='itemTitle']")
            if not link_el:
                continue
            href = link_el.get("href", "")
            title = link_el.get_text(strip=True)
            source_url = href if href.startswith("http") else BASE_URL + href

            # Grab all visible text from the card as raw context
            raw_text = card.get_text(separator=" ", strip=True)

            listings.append({
                "title": title,
                "raw_text": raw_text,
                "source_url": source_url,
                "source_site": "olx",
            })

        log.info(f"OLX page {page}: {len(cards)} listings found")

    log.info(f"OLX total raw listings: {len(listings)}")
    return listings
```

- [ ] **Step 3: Test the scraper manually**

```bash
cd scraper
python -c "
from scrapers.olx import scrape
results = scrape(max_pages=1)
print(f'Got {len(results)} listings')
if results:
    print(results[0])
"
```

Expected: prints count > 0 and a sample listing dict with title, raw_text, source_url.

- [ ] **Step 4: Commit**

```bash
git add scraper/scrapers/__init__.py scraper/scrapers/olx.py
git commit -m "feat: OLX Uganda land scraper"
```

---

### Task 5: Lamudi Uganda scraper

**Files:**
- Create: `scraper/scrapers/lamudi.py`

- [ ] **Step 1: Write lamudi.py**

Create `scraper/scrapers/lamudi.py`:

```python
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
        url = f"{BASE_URL}/land/buy/?page={page}"
        try:
            resp = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
            resp.raise_for_status()
        except Exception as e:
            log.warning(f"Lamudi page {page} failed: {e}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        # Lamudi uses article tags with class "js-listing-item"
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
```

- [ ] **Step 2: Test the scraper manually**

```bash
cd scraper
python -c "
from scrapers.lamudi import scrape
results = scrape(max_pages=1)
print(f'Got {len(results)} listings')
if results:
    print(results[0])
"
```

Expected: prints count > 0 and a sample listing dict.

- [ ] **Step 3: Commit**

```bash
git add scraper/scrapers/lamudi.py
git commit -m "feat: Lamudi Uganda land scraper"
```

---

### Task 6: AI enricher

**Files:**
- Create: `scraper/enricher.py`

- [ ] **Step 1: Write enricher.py**

Create `scraper/enricher.py`:

```python
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
```

- [ ] **Step 2: Test enricher with a fake listing**

```bash
cd scraper
python -c "
import os; os.environ['OPENROUTER_API_KEY'] = 'your-key-here'
from enricher import enrich
fake = {
    'title': '5 acres Milo land Kayunga road',
    'raw_text': '5 acres Mailo land along Kayunga road, Mukono district. Has land title. Price 9 million UGX. Call 0700123456.',
    'source_url': 'https://olx.co.ug/test',
    'source_site': 'olx',
}
result = enrich(fake)
print(result)
"
```

Expected: dict with `price_ugx=9000000`, `size_acres=5.0`, `district='Mukono'`, `has_title=True`.

- [ ] **Step 3: Commit**

```bash
git add scraper/enricher.py
git commit -m "feat: OpenRouter AI enricher for land listings"
```

---

## Phase 3 — Trust Scoring + Telegram Bot

### Task 7: Trust verifier

**Files:**
- Create: `scraper/verifier.py`

- [ ] **Step 1: Write verifier.py**

Create `scraper/verifier.py`:

```python
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
```

- [ ] **Step 2: Test verifier**

```bash
cd scraper
python -c "
from verifier import score
# Clean listing
clean = {'price_ugx': 9000000, 'size_acres': 5, 'contact_phone': '+256700123456', 'district': 'Mukono', 'road_area': 'Kayunga road'}
print('Clean:', score(clean)['trust_score'], score(clean)['trust_flags'])

# Suspicious listing
sus = {'price_ugx': 100000, 'size_acres': 5, 'contact_phone': None, 'district': None, 'road_area': None}
print('Suspicious:', score(sus)['trust_score'], score(sus)['trust_flags'])
"
```

Expected:
```
Clean: 5 []
Suspicious: 1 ['price_too_low', 'no_contact', 'vague_location', 'no_size_given']
```

Wait — `no_size_given` won't fire for suspicious since size=5. Expected:
```
Suspicious: 1 ['price_too_low', 'no_contact', 'vague_location']
```

- [ ] **Step 3: Commit**

```bash
git add scraper/verifier.py
git commit -m "feat: trust scorer for land market listings"
```

---

### Task 8: Telegram bot

**Files:**
- Create: `scraper/telegram_bot.py`

- [ ] **Step 1: Create a Telegram bot**

1. Open Telegram, search for `@BotFather`
2. Send `/newbot` → follow prompts → name it "Business Yoo Land" → username e.g. `businessyoo_land_bot`
3. Copy the bot token — save as `TELEGRAM_BOT_TOKEN` in Railway env vars
4. Create a Telegram group, add the bot, make it admin
5. Send a message in the group, then visit:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
   Find `"chat":{"id":...}` — that negative number is your `TELEGRAM_GROUP_ID`

- [ ] **Step 2: Write telegram_bot.py**

Create `scraper/telegram_bot.py`:

```python
import os
import logging
import asyncio
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CallbackQueryHandler, ContextTypes
from db import update_listing_status

log = logging.getLogger(__name__)

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
GROUP_ID = int(os.environ.get("TELEGRAM_GROUP_ID", "0"))

def format_price(ugx: int | None) -> str:
    if not ugx:
        return "Unknown"
    if ugx >= 1_000_000_000:
        return f"UGX {ugx/1_000_000_000:.1f}B"
    if ugx >= 1_000_000:
        return f"UGX {ugx/1_000_000:.0f}M"
    return f"UGX {ugx:,}"

async def send_for_review(listing: dict) -> None:
    """Send a flagged listing to the Telegram group for human review."""
    if not TOKEN or not GROUP_ID:
        log.warning("Telegram not configured — skipping review notification")
        return

    bot = Bot(token=TOKEN)
    flags_str = ", ".join(listing.get("trust_flags", [])) or "none"
    title_line = listing.get("title", "No title")
    size = listing.get("size_acres")
    road = listing.get("road_area") or "—"
    district = listing.get("district") or "—"
    price = format_price(listing.get("price_ugx"))
    land_type = listing.get("land_type") or "Unknown"
    has_title = "✓ Has title" if listing.get("has_title") else ("✗ No title" if listing.get("has_title") is False else "? Title unknown")
    contact = listing.get("contact_phone") or "No contact found"
    source_site = listing.get("source_site", "").upper()
    source_url = listing.get("source_url", "")
    listing_id = listing.get("id", "")

    text = (
        f"🚨 *New listing needs review*\n\n"
        f"📍 {size or '?'} acres, {road}, {district}\n"
        f"💰 {price}\n"
        f"🏷 {land_type} · {has_title}\n"
        f"📞 {contact}\n"
        f"⚠️ Flags: {flags_str}\n\n"
        f"Source: {source_site}"
    )

    keyboard = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("✅ Approve", callback_data=f"approve:{listing_id}"),
            InlineKeyboardButton("❌ Reject", callback_data=f"reject:{listing_id}"),
            InlineKeyboardButton("🔗 View", url=source_url),
        ]
    ])

    await bot.send_message(
        chat_id=GROUP_ID,
        text=text,
        parse_mode="Markdown",
        reply_markup=keyboard,
    )
    log.info(f"Sent to Telegram for review: {title_line}")

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    data = query.data or ""
    reviewer = f"@{query.from_user.username}" if query.from_user.username else query.from_user.first_name

    if ":" not in data:
        return
    action, listing_id = data.split(":", 1)

    if action == "approve":
        update_listing_status(listing_id, "published", reviewer)
        await query.edit_message_reply_markup(reply_markup=None)
        await query.message.reply_text(f"✅ Approved by {reviewer}")
    elif action == "reject":
        update_listing_status(listing_id, "rejected", reviewer)
        await query.edit_message_reply_markup(reply_markup=None)
        await query.message.reply_text(f"❌ Rejected by {reviewer}")

def start_bot() -> None:
    """Start the Telegram bot in polling mode (runs in background thread)."""
    if not TOKEN:
        log.warning("TELEGRAM_BOT_TOKEN not set — bot disabled")
        return
    import threading
    def run():
        app = Application.builder().token(TOKEN).build()
        app.add_handler(CallbackQueryHandler(handle_callback))
        log.info("Telegram bot started")
        app.run_polling(drop_pending_updates=True)
    t = threading.Thread(target=run, daemon=True)
    t.start()
```

- [ ] **Step 3: Commit**

```bash
git add scraper/telegram_bot.py
git commit -m "feat: Telegram bot for flagged listing review"
```

---

### Task 9: Wire everything in main.py

**Files:**
- Modify: `scraper/main.py`

- [ ] **Step 1: Update main.py to call all components**

Replace the contents of `scraper/main.py`:

```python
import os
import logging
from dotenv import load_dotenv
from apscheduler.schedulers.blocking import BlockingScheduler
from scrapers.olx import scrape as scrape_olx
from scrapers.lamudi import scrape as scrape_lamudi
from enricher import enrich
from verifier import score
from db import upsert_listing
from telegram_bot import send_for_review, start_bot
import asyncio

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

MAX_PER_SOURCE = 100

def process_listings(raw_listings: list[dict]) -> None:
    for raw in raw_listings:
        enriched = enrich(raw)
        scored = score(enriched)

        # Determine status
        trust = scored.get("trust_score", 1)
        if trust >= 3:
            scored["status"] = "published"
        else:
            scored["status"] = "pending"

        saved = upsert_listing(scored)

        # Send to Telegram if new and suspicious
        if saved and scored["status"] == "pending":
            scored["id"] = saved.get("id")
            asyncio.run(send_for_review(scored))

def run_scrape() -> None:
    log.info("=== Scrape run started ===")
    try:
        olx_raw = scrape_olx(max_pages=5)[:MAX_PER_SOURCE]
        log.info(f"OLX: {len(olx_raw)} raw listings")
        process_listings(olx_raw)
    except Exception as e:
        log.error(f"OLX scrape error: {e}")

    try:
        lamudi_raw = scrape_lamudi(max_pages=5)[:MAX_PER_SOURCE]
        log.info(f"Lamudi: {len(lamudi_raw)} raw listings")
        process_listings(lamudi_raw)
    except Exception as e:
        log.error(f"Lamudi scrape error: {e}")

    log.info("=== Scrape run complete ===")

if __name__ == "__main__":
    start_bot()
    scheduler = BlockingScheduler(timezone="Africa/Kampala")
    scheduler.add_job(run_scrape, "cron", hour=6, minute=0)
    log.info("Scheduler started — next run at 6:00 AM EAT")
    run_scrape()  # run once on start
    scheduler.start()
```

- [ ] **Step 2: Test full pipeline with env vars set**

```bash
cd scraper
# Set env vars (replace with real values)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"
export OPENROUTER_API_KEY="sk-or-..."
export TELEGRAM_BOT_TOKEN="your-bot-token"
export TELEGRAM_GROUP_ID="-100your-group-id"

python main.py
```

Expected: logs show OLX + Lamudi scraped, enriched, scored, saved to Supabase. Suspicious listings trigger Telegram messages.

- [ ] **Step 3: Check Supabase**

In Supabase Table Editor → `land_market` → confirm rows appear with all fields populated, `status` = `published` or `pending`.

- [ ] **Step 4: Commit**

```bash
git add scraper/main.py
git commit -m "feat: wire full scrape pipeline in main.py"
```

---

### Task 10: Deploy to Railway

**Files:** No code changes — deployment config only.

- [ ] **Step 1: Push scraper to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Deploy on Railway**

1. Go to railway.app → your workspace → New Project → Deploy from GitHub repo
2. Select your repo → set Root Directory to `scraper`
3. Railway will auto-detect the Dockerfile

- [ ] **Step 3: Set environment variables on Railway**

In Railway service → Variables tab, add:
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
OPENROUTER_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_GROUP_ID=
```

- [ ] **Step 4: Verify deployment**

Check Railway logs — you should see the scrape run output within 2 minutes of deploy.

---

## Phase 4 — `/land/market` Next.js Page

### Task 11: Supabase query layer

**Files:**
- Create: `lib/land/market-queries.ts`

- [ ] **Step 1: Write market-queries.ts**

Create `lib/land/market-queries.ts`:

```typescript
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type MarketListing = {
  id: string;
  title: string;
  price_ugx: number | null;
  size_acres: number | null;
  land_type: string | null;
  district: string | null;
  road_area: string | null;
  has_title: boolean | null;
  contact_phone: string | null;
  trust_score: number | null;
  trust_flags: string[];
  source_url: string;
  source_site: string;
  scraped_at: string;
};

export type MarketFilters = {
  q?: string;
  district?: string;
  land_type?: string;
  has_title?: boolean;
  price_min?: number;
  price_max?: number;
  size_min?: number;
  size_max?: number;
  source_site?: string;
};

export async function getMarketListings(
  filters: MarketFilters = {},
  limit = 48
): Promise<MarketListing[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from('land_market')
    .select('id,title,price_ugx,size_acres,land_type,district,road_area,has_title,contact_phone,trust_score,trust_flags,source_url,source_site,scraped_at')
    .eq('status', 'published')
    .order('scraped_at', { ascending: false })
    .limit(limit);

  if (filters.q) query = query.or(`title.ilike.%${filters.q}%,road_area.ilike.%${filters.q}%,district.ilike.%${filters.q}%`);
  if (filters.district) query = query.eq('district', filters.district);
  if (filters.land_type) query = query.eq('land_type', filters.land_type);
  if (filters.has_title !== undefined) query = query.eq('has_title', filters.has_title);
  if (filters.price_min) query = query.gte('price_ugx', filters.price_min);
  if (filters.price_max) query = query.lte('price_ugx', filters.price_max);
  if (filters.size_min) query = query.gte('size_acres', filters.size_min);
  if (filters.size_max) query = query.lte('size_acres', filters.size_max);
  if (filters.source_site) query = query.eq('source_site', filters.source_site);

  const { data, error } = await query;
  if (error) { console.error('getMarketListings:', error); return []; }
  return (data ?? []) as MarketListing[];
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/land/market-queries.ts
git commit -m "feat: Supabase query layer for land_market table"
```

---

### Task 12: Market listing card component

**Files:**
- Create: `app/land/market/MarketListingCard.tsx`

- [ ] **Step 1: Write MarketListingCard.tsx**

Create `app/land/market/MarketListingCard.tsx`:

```tsx
import type { MarketListing } from '@/lib/land/market-queries';

function formatPrice(ugx: number | null): string {
  if (!ugx) return 'Price on request';
  if (ugx >= 1_000_000_000) return `UGX ${(ugx / 1_000_000_000).toFixed(1)}B`;
  if (ugx >= 1_000_000) return `UGX ${(ugx / 1_000_000).toFixed(0)}M`;
  return `UGX ${ugx.toLocaleString()}`;
}

function daysSince(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1d ago';
  return `${diff}d ago`;
}

function TrustDots({ score }: { score: number | null }) {
  const s = score ?? 0;
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= s ? 'bg-green-500' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export function MarketListingCard({ listing }: { listing: MarketListing }) {
  const whatsappHref = listing.contact_phone
    ? `https://wa.me/${listing.contact_phone.replace(/\D/g, '')}`
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col gap-2">
      {/* Unverified badge */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
          ⚠️ Unverified
        </span>
        <TrustDots score={listing.trust_score} />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{listing.title}</h3>

      {/* Meta */}
      <div className="text-xs text-gray-500 space-y-0.5">
        {listing.district && <div>📍 {listing.district}{listing.road_area ? `, ${listing.road_area}` : ''}</div>}
        {listing.size_acres && <div>📐 {listing.size_acres} acres</div>}
        {listing.land_type && <div>🏷 {listing.land_type}</div>}
        <div>
          {listing.has_title === true && <span className="text-green-600">✓ Has title · </span>}
          {listing.has_title === false && <span className="text-red-500">✗ No title · </span>}
          {listing.source_site.toUpperCase()} · {daysSince(listing.scraped_at)}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <span className="font-bold text-[#2d6a4f] text-sm">{formatPrice(listing.price_ugx)}</span>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-700 border border-green-200 rounded-full px-3 py-1 hover:bg-green-50 transition-colors"
          >
            📲 WhatsApp
          </a>
        ) : (
          <a
            href={listing.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors"
          >
            View listing ↗
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/land/market/MarketListingCard.tsx
git commit -m "feat: MarketListingCard component for scraped listings"
```

---

### Task 13: Market client (filter UI)

**Files:**
- Create: `app/land/market/MarketClient.tsx`

- [ ] **Step 1: Write MarketClient.tsx**

Create `app/land/market/MarketClient.tsx`:

```tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { MarketListing } from '@/lib/land/market-queries';
import { MarketListingCard } from './MarketListingCard';
import Link from 'next/link';

const DISTRICTS = ['Kampala','Wakiso','Mukono','Entebbe','Jinja','Mbale','Gulu','Mbarara','Masaka','Lira','Fort Portal','Arua'];
const LAND_TYPES = ['Mailo','Freehold','Leasehold','Kibanja'];
const SOURCES = ['olx','lamudi'];

export default function MarketClient({ listings, total }: { listings: MarketListing[]; total: number }) {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.push(`/land/market?${p.toString()}`);
  }, [params, router]);

  const q = params.get('q') ?? '';
  const district = params.get('district') ?? '';
  const land_type = params.get('land_type') ?? '';
  const has_title = params.get('has_title') ?? '';
  const source_site = params.get('source_site') ?? '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Open Market Land Radar</h1>
          <p className="text-sm text-gray-500 mb-4">Scraped daily from OLX and Lamudi · {total} listings · Not verified by surveyors</p>

          {/* Search bar */}
          <input
            type="text"
            defaultValue={q}
            placeholder="Search by location, road, or keyword..."
            onKeyDown={(e) => { if (e.key === 'Enter') setParam('q', (e.target as HTMLInputElement).value); }}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] mb-3"
          />

          {/* Filter row */}
          <div className="flex flex-wrap gap-2">
            <select
              value={district}
              onChange={(e) => setParam('district', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">All districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={land_type}
              onChange={(e) => setParam('land_type', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">All types</option>
              {LAND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={has_title}
              onChange={(e) => setParam('has_title', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">Title: any</option>
              <option value="true">Has title</option>
              <option value="false">No title</option>
            </select>

            <select
              value={source_site}
              onChange={(e) => setParam('source_site', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">All sources</option>
              {SOURCES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>

            {(q || district || land_type || has_title || source_site) && (
              <button
                onClick={() => router.push('/land/market')}
                className="border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-sm hover:bg-red-50"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listings grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {listings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium mb-1">No listings found for your search.</p>
            <p className="text-sm">The scraper runs daily at 6AM — check back tomorrow.</p>
            <Link href="/land/browse" className="inline-block mt-4 text-sm text-[#2d6a4f] hover:underline">
              Browse SafeLands verified listings →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(l => <MarketListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>

      {/* SafeLands CTA */}
      <div className="bg-[#2d6a4f] text-white py-8 px-4 text-center">
        <p className="font-medium mb-2">Want a surveyor-verified listing?</p>
        <Link href="/land/browse" className="inline-block bg-white text-[#2d6a4f] font-semibold px-6 py-2 rounded-full hover:bg-green-50 transition-colors text-sm">
          Browse SafeLands ↗
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/land/market/MarketClient.tsx
git commit -m "feat: MarketClient filter UI for land market page"
```

---

### Task 14: `/land/market` page server component

**Files:**
- Create: `app/land/market/page.tsx`

- [ ] **Step 1: Write page.tsx**

Create `app/land/market/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getMarketListings, type MarketFilters } from '@/lib/land/market-queries';
import MarketClient from './MarketClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Open Market Land Radar — Uganda | Business Yoo',
  description: 'Daily-updated land listings scraped from OLX and Lamudi Uganda. Search by district, price, size and type.',
};

type Props = {
  searchParams: {
    q?: string;
    district?: string;
    land_type?: string;
    has_title?: string;
    price_min?: string;
    price_max?: string;
    size_min?: string;
    size_max?: string;
    source_site?: string;
  };
};

export default async function LandMarketPage({ searchParams }: Props) {
  const filters: MarketFilters = {
    q: searchParams.q,
    district: searchParams.district,
    land_type: searchParams.land_type,
    has_title: searchParams.has_title === 'true' ? true : searchParams.has_title === 'false' ? false : undefined,
    price_min: searchParams.price_min ? Number(searchParams.price_min) : undefined,
    price_max: searchParams.price_max ? Number(searchParams.price_max) : undefined,
    size_min: searchParams.size_min ? Number(searchParams.size_min) : undefined,
    size_max: searchParams.size_max ? Number(searchParams.size_max) : undefined,
    source_site: searchParams.source_site,
  };

  const listings = await getMarketListings(filters, 48);

  return <MarketClient listings={listings} total={listings.length} />;
}
```

- [ ] **Step 2: Test locally**

```bash
cd d:/projects/uganda-business-ideas
npm run dev
```

Visit `http://localhost:3000/land/market` — page should load (empty state if no data yet).

- [ ] **Step 3: Commit**

```bash
git add app/land/market/page.tsx
git commit -m "feat: /land/market server page with filter params"
```

---

## Phase 5 — Nav Link + `/apps` Hub Featured Card

### Task 15: Add Land to navigation

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add nav bar to layout.tsx**

In `app/layout.tsx`, replace the `<body>` opening:

```tsx
// Old:
      <body>
        {children}
        {/* Floating WhatsApp button — visible on every page */}
        <WhatsAppFloat />
      </body>

// New:
      <body>
        <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto">
            <a href="/" className="font-bold text-[#2d6a4f] text-sm shrink-0 mr-3">Business Yoo</a>
            {[
              { href: '/ideas', label: 'Ideas' },
              { href: '/businesses', label: 'Businesses' },
              { href: '/jobs', label: 'Jobs' },
              { href: '/salons', label: 'Salons' },
              { href: '/travel', label: 'Travel' },
              { href: '/land', label: 'Land', highlight: true },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                className={`shrink-0 text-sm px-3 py-1.5 rounded-full transition-colors ${
                  item.highlight
                    ? 'bg-[#2d6a4f] text-white font-medium hover:bg-[#1e4d38]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
        {children}
        <WhatsAppFloat />
      </body>
```

- [ ] **Step 2: Test locally**

```bash
npm run dev
```

Visit `http://localhost:3000` — nav bar should appear on every page. Land link should be green/highlighted.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add site nav bar with Land highlighted"
```

---

### Task 16: Upgrade `/apps` hub Land card

**Files:**
- Modify: `app/apps/page.tsx`

- [ ] **Step 1: Replace the Land card with a featured card**

In `app/apps/page.tsx`, replace the entire file contents:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Everything on Business Yoo',
  description: 'Explore land, jobs, business ideas, salons, travel, and more — all in one place.',
  robots: { index: false, follow: false },
};

const APPS = [
  {
    href: '/ideas',
    emoji: '💡',
    name: 'Business Ideas',
    tagline: '48 curated ideas to start your business',
    color: '#c05621',
    bg: '#fff8f0',
  },
  {
    href: '/businesses',
    emoji: '💼',
    name: 'Find Businesses',
    tagline: 'Discover real businesses across Uganda',
    color: '#374151',
    bg: '#f9fafb',
  },
  {
    href: '/salons',
    emoji: '✂️',
    name: 'Find Salons',
    tagline: 'Book nearby salons via WhatsApp',
    color: '#6b21a8',
    bg: '#faf5ff',
  },
  {
    href: '/travel',
    emoji: '✈️',
    name: 'Explore Uganda',
    tagline: 'Destinations, stays, and local tourism',
    color: '#0e7490',
    bg: '#f0fdff',
  },
  {
    href: '/jobs',
    emoji: '👷',
    name: 'Find Work',
    tagline: 'Browse jobs and post your skills',
    color: '#1a56db',
    bg: '#eff6ff',
  },
];

export default function AppsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Everything on Business Yoo</h1>
          <p className="text-gray-500">Explore land, jobs, business ideas, salons, travel, and more — all in one place.</p>
        </div>

        {/* Featured Land card */}
        <div className="mb-6 p-5 rounded-2xl border-2 border-[#2d6a4f] bg-[#f0faf4]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏞</span>
            <div>
              <div className="font-bold text-[#2d6a4f] text-lg">Find Land in Uganda</div>
              <div className="text-xs text-gray-500">Verified listings + open market radar · updated daily</div>
            </div>
          </div>
          <form action="/land/market" method="get" className="flex gap-2 mb-3">
            <input
              name="q"
              type="text"
              placeholder="Kayunga road, 5 acres, Milo land..."
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            />
            <button type="submit" className="bg-[#2d6a4f] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1e4d38] transition-colors">
              Search
            </button>
          </form>
          <div className="flex gap-3 text-sm">
            <Link href="/land/browse" className="text-[#2d6a4f] font-medium hover:underline">Browse Verified →</Link>
            <Link href="/land/market" className="text-gray-500 hover:underline">Open Market Radar →</Link>
          </div>
        </div>

        {/* Other apps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {APPS.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: app.bg }}
              >
                {app.emoji}
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:underline" style={{ color: app.color }}>
                  {app.name}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{app.tagline}</div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-10 text-center">
          Business Yoo — Uganda&apos;s platform for land, work, business, and opportunity.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Test locally**

```bash
npm run dev
```

Visit `http://localhost:3000/apps` — Land card should appear first, featured with green border + search box. Other app cards below.

- [ ] **Step 3: Commit and push to Vercel**

```bash
git add app/apps/page.tsx
git commit -m "feat: featured Land card with search on /apps hub"
git push origin main
```

- [ ] **Step 4: Verify on Vercel**

Wait ~2 minutes for Vercel to deploy, then visit your live URL → `/apps`. Confirm the featured Land card and search box appear.

---

## Self-Review

**Spec coverage check:**
- ✅ `land_market` table — Task 1
- ✅ Python scraper skeleton + scheduler — Tasks 2, 3
- ✅ OLX scraper — Task 4
- ✅ Lamudi scraper — Task 5
- ✅ AI enricher (OpenRouter) — Task 6
- ✅ Trust scorer — Task 7
- ✅ Telegram bot with Approve/Reject — Task 8
- ✅ Full pipeline wired — Task 9
- ✅ Railway deployment — Task 10
- ✅ Supabase query layer for land_market — Task 11
- ✅ MarketListingCard — Task 12
- ✅ Filter UI (MarketClient) — Task 13
- ✅ `/land/market` server page — Task 14
- ✅ Nav bar with Land link — Task 15
- ✅ `/apps` hub featured Land card — Task 16

**Type consistency:** `MarketListing` defined in `market-queries.ts` Task 11, imported correctly in Tasks 12, 13, 14. `MarketFilters` defined Task 11, used in Tasks 13, 14. `upsert_listing` / `update_listing_status` defined in `db.py` Task 2, used in Tasks 9, 8. All consistent.

**Placeholder scan:** No TBDs, no "implement later", all code blocks complete. ✅
