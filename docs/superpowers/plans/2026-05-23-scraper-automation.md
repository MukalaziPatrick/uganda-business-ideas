# Scraper Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate Business Yoo's weekly Google Places scrape — n8n triggers every Sunday, runs a Python batch script across all 11 categories for one city, imports results into Supabase, and sends a Telegram summary.

**Architecture:** A Python wrapper script (`run_batch.py`) reads a queue file (`scrape_queue.json`) to pick the next city, calls `scrape_google.py` for each category non-interactively, POSTs results to the existing import API, then prints a JSON summary for n8n. n8n has 3 nodes: Cron → Execute Command → Telegram.

**Tech Stack:** Python 3.11, requests, n8n v2.20.9 (local), Telegram Bot API, existing Next.js `/api/admin/import-places` route.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scraper/scrape_queue.json` | Create | Tracks which cities are done/pending, categories list, cadence |
| `scraper/run_batch.py` | Create | Main automation script — reads queue, loops categories, imports, updates queue, prints summary |
| `scraper/scrape_google.py` | Modify | Add `--yes` flag to skip interactive prompt + suppress prints when running in batch mode |

No changes to Next.js app, Supabase, or admin UI.

---

## Task 1: Add `--yes` flag to `scrape_google.py`

**Files:**
- Modify: `scraper/scrape_google.py` (lines 144–158)

- [ ] **Step 1: Add `--yes` argument and suppress output in batch mode**

Open `scraper/scrape_google.py`. Replace the `main()` function's argument parsing and confirmation block:

```python
def main():
    parser = argparse.ArgumentParser(description="Scrape Google Places for Uganda businesses.")
    parser.add_argument("--type",     required=True, help="Google place type, e.g. hospital, school, bank")
    parser.add_argument("--district", required=True, help="Uganda district name, e.g. Kampala, Wakiso")
    parser.add_argument("--max",      type=int, default=60, help="Max results (default 60)")
    parser.add_argument("--yes",      action="store_true", help="Skip confirmation prompt and suppress output (for automation)")
    args = parser.parse_args()

    pages_estimate = min(3, (args.max + 19) // 20)
    cost_estimate = pages_estimate * 0.017

    if not args.yes:
        print(f"\nScraping: type={args.type}, district={args.district}, max={args.max}")
        print(f"Estimated cost: ~${cost_estimate:.3f} ({pages_estimate} API requests)")
        confirm = input("Continue? (y/n): ").strip().lower()
        if confirm != "y":
            print("Aborted.")
            return

    results = scrape_district(args.type, args.district, args.max)

    if not results:
        if not args.yes:
            print("No results found. Nothing saved.")
        return

    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)
    filename = f"{date.today()}-{args.type}-{args.district.lower().replace(' ', '-')}.json"
    output_path = output_dir / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    if not args.yes:
        print(f"\nSaved {len(results)} businesses to scraper/output/{filename}")
```

- [ ] **Step 2: Verify manual mode still works**

Run from `scraper/` directory:
```
python scrape_google.py --type hospital --district Kampala --max 5
```
Expected: prints cost estimate, asks "Continue? (y/n):", type `n` → prints "Aborted."

- [ ] **Step 3: Verify `--yes` mode is silent**

Run:
```
python scrape_google.py --type hospital --district Kampala --max 5 --yes
```
Expected: no output to terminal, file appears in `scraper/output/` named `YYYY-MM-DD-hospital-kampala.json`.

- [ ] **Step 4: Commit**

```bash
git add scraper/scrape_google.py
git commit -m "feat(scraper): add --yes flag for non-interactive batch mode"
```

---

## Task 2: Create `scraper/scrape_queue.json`

**Files:**
- Create: `scraper/scrape_queue.json`

- [ ] **Step 1: Create the queue file**

Create `scraper/scrape_queue.json` with this exact content:

```json
{
  "cadence": "weekly",
  "cities": [
    { "district": "Kampala",     "status": "pending" },
    { "district": "Wakiso",      "status": "pending" },
    { "district": "Mukono",      "status": "pending" },
    { "district": "Jinja",       "status": "pending" },
    { "district": "Mbale",       "status": "pending" },
    { "district": "Mbarara",     "status": "pending" },
    { "district": "Gulu",        "status": "pending" },
    { "district": "Arua",        "status": "pending" },
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

- [ ] **Step 2: Commit**

```bash
git add scraper/scrape_queue.json
git commit -m "feat(scraper): add scrape_queue.json for city-by-city automation tracking"
```

---

## Task 3: Create `scraper/run_batch.py`

**Files:**
- Create: `scraper/run_batch.py`

This script is the brain of the automation. It reads the queue, scrapes all categories for the next city, imports the results, updates the queue, and prints a JSON summary to stdout for n8n to consume.

- [ ] **Step 1: Create the file**

Create `scraper/run_batch.py`:

```python
"""
Business Yoo — Batch scraper runner.
Reads scrape_queue.json, scrapes the next pending city across all categories,
imports results via the admin API, updates the queue, prints JSON summary to stdout.

Usage (manual test):
  python run_batch.py

Usage (from n8n Execute Command node):
  python d:\projects\uganda-business-ideas\scraper\run_batch.py
"""

import json
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path

import requests

QUEUE_FILE = Path(__file__).parent / "scrape_queue.json"
OUTPUT_DIR = Path(__file__).parent / "output"
IMPORT_API  = "http://localhost:3000/api/admin/import-places"

# Read ADMIN_SECRET from the project .env.local
import os
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env.local")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "")


def load_queue() -> dict:
    with open(QUEUE_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_queue(queue: dict) -> None:
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)


def pick_next_city(queue: dict) -> dict | None:
    for city in queue["cities"]:
        if city["status"] in ("pending", "next"):
            return city
    return None


def scrape_category(district: str, category: str) -> Path | None:
    filename = f"{date.today()}-{category}-{district.lower().replace(' ', '-')}.json"
    output_path = OUTPUT_DIR / filename

    result = subprocess.run(
        [sys.executable, str(Path(__file__).parent / "scrape_google.py"),
         "--type", category, "--district", district, "--max", "60", "--yes"],
        capture_output=True, text=True
    )

    if result.returncode != 0:
        print(f"  [WARN] scrape_google.py failed for {category}/{district}: {result.stderr.strip()}", file=sys.stderr)
        return None

    if output_path.exists():
        return output_path
    return None


def import_file(output_path: Path) -> tuple[int, int]:
    with open(output_path, encoding="utf-8") as f:
        rows = json.load(f)

    if not rows:
        return 0, 0

    try:
        resp = requests.post(
            IMPORT_API,
            json=rows,
            cookies={"admin_token": ADMIN_SECRET},
            timeout=30,
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("imported", 0), data.get("skipped", 0)
        else:
            print(f"  [WARN] Import API returned {resp.status_code}: {resp.text[:200]}", file=sys.stderr)
            return 0, 0
    except requests.RequestException as e:
        print(f"  [WARN] Import API request failed: {e}", file=sys.stderr)
        return 0, 0


def advance_queue(queue: dict, done_district: str) -> str | None:
    cities = queue["cities"]
    done_idx = next(i for i, c in enumerate(cities) if c["district"] == done_district)
    cities[done_idx]["status"] = "done"

    # Find next pending city
    next_city = None
    for city in cities:
        if city["status"] == "pending":
            city["status"] = "next"
            next_city = city["district"]
            break

    # If all done, reset for next cycle with monthly cadence
    if next_city is None:
        for city in cities:
            city["status"] = "pending"
        cities[0]["status"] = "next"
        queue["cadence"] = "monthly"
        next_city = cities[0]["district"]

    queue["last_run"] = datetime.utcnow().isoformat()
    queue["next_city"] = next_city
    return next_city


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    queue = load_queue()

    city = pick_next_city(queue)
    if city is None:
        print(json.dumps({"error": "No pending cities in queue"}))
        sys.exit(1)

    district = city["district"]
    categories = queue["categories"]

    total_imported = 0
    total_skipped  = 0
    categories_scraped = 0

    for category in categories:
        output_path = scrape_category(district, category)
        if output_path is None:
            continue
        categories_scraped += 1
        imported, skipped = import_file(output_path)
        total_imported += imported
        total_skipped  += skipped

    all_done_before = all(c["status"] == "done" for c in queue["cities"] if c["district"] != district)
    next_city = advance_queue(queue, district)
    all_cities_done = queue["cadence"] == "monthly" and all_done_before
    save_queue(queue)

    summary = {
        "city":               district,
        "categories_scraped": categories_scraped,
        "imported":           total_imported,
        "skipped":            total_skipped,
        "next_city":          next_city,
        "cadence":            queue["cadence"],
        "all_cities_done":    all_cities_done,
    }

    print(json.dumps(summary))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Check your ADMIN_SECRET is in `.env.local`**

Open `d:\projects\uganda-business-ideas\.env.local` and confirm it has:
```
ADMIN_SECRET=<your admin password>
```
This must match the cookie the import API checks. If it's missing, add it now.

- [ ] **Step 3: Start your dev server in a separate terminal**

```bash
cd d:\projects\uganda-business-ideas
npm run dev
```
Leave this running. The script needs `http://localhost:3000` to be live.

- [ ] **Step 4: Run a dry test with one city**

From `scraper/` directory:
```bash
python run_batch.py
```

Expected output (JSON printed to terminal, one line):
```json
{"city": "Kampala", "categories_scraped": 11, "imported": 247, "skipped": 0, "next_city": "Wakiso", "cadence": "weekly", "all_cities_done": false}
```

Also check `scrape_queue.json` — Kampala should now be `"done"`, Wakiso should be `"next"`.

- [ ] **Step 5: Commit**

```bash
git add scraper/run_batch.py
git commit -m "feat(scraper): add run_batch.py automation wrapper"
```

---

## Task 4: Set up Telegram Bot

- [ ] **Step 1: Create a bot via @BotFather**

1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Name it: `Business Yoo Alerts`
4. Username: `businessyoo_alerts_bot` (or any available name ending in `_bot`)
5. BotFather replies with your **bot token** — looks like `7123456789:AAHxyz...`
6. Copy and save it somewhere safe

- [ ] **Step 2: Get your personal Telegram chat ID**

1. Search for `@userinfobot` in Telegram
2. Send it any message
3. It replies with your **Chat ID** — a number like `123456789`
4. Copy and save it

- [ ] **Step 3: Test the bot sends a message**

Run this in your terminal (replace with your real token and chat ID):
```bash
curl -s "https://api.telegram.org/bot<YOUR_TOKEN>/sendMessage?chat_id=<YOUR_CHAT_ID>&text=Hello+from+Business+Yoo!"
```
Expected: you receive "Hello from Business Yoo!" in Telegram. The API response JSON should have `"ok": true`.

---

## Task 5: Build the n8n Workflow

- [ ] **Step 1: Open n8n**

Go to `http://localhost:5678` in your browser. Make sure n8n is running (if not, start it).

- [ ] **Step 2: Create a new workflow**

Click `+ New Workflow`. Name it: `Business Yoo — Weekly Scraper`.

- [ ] **Step 3: Add Node 1 — Schedule Trigger**

1. Click `+` to add a node → search "Schedule Trigger"
2. Set **Trigger Interval** to `Weeks`
3. Set **Week Interval** to `1`
4. Set **Trigger at Day** to `Sunday`
5. Set **Trigger at Hour** to `6` (6am)
6. Set **Timezone** to `Africa/Kampala`

- [ ] **Step 4: Add Node 2 — Execute Command**

1. Add node → search "Execute Command"
2. Set **Command** to:
   ```
   python d:\projects\uganda-business-ideas\scraper\run_batch.py
   ```
3. Under **Options**, enable **Include Execution Environment Variables** if visible
4. Click the node's output panel → confirm it shows the JSON summary when you click "Execute Node" (dev server must be running)

- [ ] **Step 5: Parse the JSON output**

The Execute Command node returns stdout as a string. Add a **Code** node between Execute Command and Telegram:

1. Add node → search "Code"
2. Set **Mode** to `Run Once for All Items`
3. Set code to:
```javascript
const raw = $input.first().json.stdout;
const summary = JSON.parse(raw);
return [{ json: summary }];
```

- [ ] **Step 6: Add Node 3 — Telegram**

1. Add node → search "Telegram"
2. Click **Credential** → `Create New` → paste your bot token → Save
3. Set **Chat ID** to your personal chat ID (e.g. `123456789`)
4. Set **Text** to (use Expression mode — click the `{}` button):

```
{{ $json.all_cities_done ? 
"🎉 Business Yoo — All Cities Scraped!\nUganda is fully covered. Switching to monthly re-scrapes.\nTotal this run: " + $json.imported + " businesses imported.\n👉 Approve now: http://localhost:3000/admin/businesses"
:
"✅ Business Yoo — Weekly Scrape Done\n📍 City: " + $json.city + "\n📦 Categories scraped: " + $json.categories_scraped + "\n🏢 New businesses: " + $json.imported + "\n⏭️ Next city: " + $json.next_city + " (next Sunday)\n👉 Approve now: http://localhost:3000/admin/businesses"
}}
```

- [ ] **Step 7: Connect the nodes**

Wire them in order: Schedule Trigger → Execute Command → Code → Telegram

- [ ] **Step 8: Test the full workflow manually**

1. Click `Test Workflow` (top right)
2. Expected: workflow runs all 4 nodes green, Telegram message arrives on your phone
3. Check `scrape_queue.json` — next city should have advanced

- [ ] **Step 9: Activate the workflow**

Toggle the workflow from `Inactive` to `Active` (top right switch). It will now fire automatically every Sunday at 6am EAT.

---

## Task 6: Final verification

- [ ] **Step 1: Confirm queue state is correct**

Open `scraper/scrape_queue.json`. Verify:
- Kampala is `"done"` (from Task 3 test run)
- Wakiso is `"next"` (will be scraped next Sunday)
- All others are `"pending"`

If you don't want Kampala counted as done (test run), reset it manually:
```json
{ "district": "Kampala", "status": "pending" }
```
And set Wakiso back to `"pending"` too, then save.

- [ ] **Step 2: Check businesses appeared in admin panel**

Go to `http://localhost:3000/admin/businesses` — you should see the Kampala businesses from the test run with status `pending`. Approve a few to confirm the full pipeline works end to end.

- [ ] **Step 3: Commit final state**

```bash
git add scraper/scrape_queue.json
git commit -m "chore: reset queue to correct state after test run"
```

- [ ] **Step 4: Update memory / dashboard**

Note in dashboard.html that Business Yoo scraper automation is live and running weekly.
