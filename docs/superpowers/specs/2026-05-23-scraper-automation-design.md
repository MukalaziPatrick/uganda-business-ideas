# Business Yoo — Scraper Automation Design
**Date:** 2026-05-23
**Status:** Approved
**Goal:** Automate the weekly scraping, importing, and Telegram notification for Business Yoo's business directory — zero manual effort beyond approving businesses in the admin panel.

---

## 1. Architecture Overview

```
n8n (local, weekly cron — Sunday 6am EAT)
    │
    ├─ 1. Cron trigger fires
    ├─ 2. Execute Command → runs scraper/run_batch.py
    │       └─ reads scrape_queue.json → picks next city
    │       └─ loops 12 categories → calls scrape_google.py each
    │       └─ POSTs each output file to /api/admin/import-places
    │       └─ updates scrape_queue.json (marks city done, sets next)
    │       └─ returns JSON summary { city, imported, skipped, nextCity }
    ├─ 3. Telegram node → sends detailed summary message
    └─ Done. User opens admin panel, scans, clicks Approve.
```

**Key principle:** n8n stays simple (3 nodes). All scraping logic lives in Python. n8n only triggers and notifies.

---

## 2. Queue File (`scraper/scrape_queue.json`)

Single source of truth for progress. n8n reads it, `run_batch.py` updates it.

```json
{
  "cadence": "weekly",
  "cities": [
    { "district": "Kampala",    "status": "pending" },
    { "district": "Wakiso",     "status": "pending" },
    { "district": "Mukono",     "status": "pending" },
    { "district": "Jinja",      "status": "pending" },
    { "district": "Mbale",      "status": "pending" },
    { "district": "Mbarara",    "status": "pending" },
    { "district": "Gulu",       "status": "pending" },
    { "district": "Arua",       "status": "pending" },
    { "district": "Fort Portal", "status": "pending" }
  ],
  "categories": [
    "hospital", "pharmacy", "school", "bank",
    "supermarket", "lodging", "gym", "church",
    "mosque", "police", "local_government_office"
  ],
  "last_run": null,
  "next_city": "Kampala"
}
```

**Status values:**
- `pending` — not yet scraped
- `next` — will be scraped on next run (only one city has this at a time)
- `done` — fully scraped

**When all cities are `done`:** `run_batch.py` resets all statuses back to `pending` and sets `cadence` to `"monthly"`. This triggers re-scraping to catch newly opened businesses, starting from Kampala again.

---

## 3. Wrapper Script (`scraper/run_batch.py`)

New Python script. This is the brain of the automation.

### What it does (in order):

1. **Load queue** — reads `scraper/scrape_queue.json`
2. **Pick city** — finds the first city with `status: "pending"` (or `"next"`)
3. **Scrape all categories** — for each of the 12 categories, calls `scrape_google.py` subprocess for that city, max 60 results each. Skips confirmation prompt (uses `--yes` flag to be added to `scrape_google.py`).
4. **Import each output file** — POSTs each JSON file directly to `http://localhost:3000/api/admin/import-places` with the `admin_token` cookie header.
5. **Update queue** — marks current city as `done`, marks the next pending city as `next`. If no pending cities remain, resets all to `pending` and switches cadence to `monthly`.
6. **Print summary JSON** to stdout — n8n reads this:

```json
{
  "city": "Wakiso",
  "categories_scraped": 11,
  "imported": 284,
  "skipped": 12,
  "next_city": "Mukono",
  "cadence": "weekly",
  "all_cities_done": false
}
```

### Error handling:
- If a category returns 0 results (normal for small districts), log and continue — don't fail the whole run.
- If the import API returns an error, log it and continue — partial imports are acceptable.
- If `scrape_google.py` crashes for a category, log and skip — the city is still marked done so the queue advances.
- Final summary always prints to stdout regardless of per-category errors.

---

## 4. Changes to Existing Scraper (`scrape_google.py`)

One small change only: add a `--yes` flag to skip the interactive confirmation prompt, so `run_batch.py` can call it non-interactively.

```python
parser.add_argument("--yes", action="store_true", help="Skip confirmation prompt")
# Replace the input() block with:
if not args.yes:
    confirm = input("Continue? (y/n): ").strip().lower()
    if confirm != "y":
        print("Aborted.")
        return
```

When `--yes` is passed, `scrape_google.py` also suppresses all `print()` output (cost estimates, saved path) so stdout stays clean for the parent process. `run_batch.py` reads the output file path from a known naming convention, not from stdout.

---

## 5. n8n Workflow

**Workflow name:** `Business Yoo — Weekly Scraper`

### Node 1 — Cron Trigger
- Schedule: Every Sunday at 06:00 EAT (UTC+3 = 03:00 UTC)
- When all cities done and cadence switches to `monthly`: manually change cron to first Sunday of month (or build a second workflow — out of scope for now)

### Node 2 — Execute Command
- Command: `python d:\projects\uganda-business-ideas\scraper\run_batch.py`
- Capture stdout → parse as JSON
- Pass fields (`city`, `imported`, `skipped`, `next_city`, `all_cities_done`) to next node

### Node 3 — Telegram
- Bot: new Telegram bot created via @BotFather (takes 2 minutes — get token + your chat ID)
- Chat ID: Mukalazi's personal Telegram chat ID
- Message template:

```
✅ Business Yoo — Weekly Scrape Done
📍 City: {{ $json.city }}
📦 Categories scraped: {{ $json.categories_scraped }}
🏢 New businesses: {{ $json.imported }}
⏭️ Next city: {{ $json.next_city }} (next Sunday)
👉 Approve now: http://localhost:3000/admin/businesses
```

If `all_cities_done` is true, message changes to:
```
🎉 Business Yoo — All Cities Scraped!
Uganda is fully covered. Switching to monthly re-scrapes.
Total this run: {{ $json.imported }} businesses imported.
👉 Approve now: http://localhost:3000/admin/businesses
```

---

## 6. What Is NOT In Scope

- Auto-approving businesses (manual approval is kept intentionally for quality control)
- Railway/cloud deployment (local n8n is sufficient; laptop must be on Sunday mornings)
- OSM scraping automation (OSM is free and can be run manually any time)
- Telegram bot replies / two-way interaction
- Changing the weekly→monthly cadence automatically inside n8n (done inside `run_batch.py` via the queue file)

---

## 7. Files Changed / Created

| File | Action |
|------|--------|
| `scraper/run_batch.py` | **New** — automation wrapper script |
| `scraper/scrape_queue.json` | **New** — queue + progress tracker |
| `scraper/scrape_google.py` | **Edit** — add `--yes` flag |
| n8n workflow JSON | **New** — imported into local n8n |

No changes to the Next.js app, Supabase schema, admin UI, or import API.

---

## 8. Phased Rollout (updated)

| Phase | What | Status |
|-------|------|--------|
| Phase 1 | Manual scrape — Kampala hospitals (smoke test) | ✅ Done |
| Phase 2 | Add lat/lng/address to scraper + DB | ✅ Done (2026-05-23) |
| Phase 3 | Build automation (this spec) | 🔲 Next |
| Phase 4 | Run automation — all 8 cities weekly | After Phase 3 |
| Phase 5 | OSM import (petrol stations, bus parks) | Manual, any time |
| Phase 6 | Monthly re-scrape cadence | Auto after Phase 4 completes |
