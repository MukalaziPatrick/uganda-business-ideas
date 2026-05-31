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
            loop = asyncio.new_event_loop()
            try:
                loop.run_until_complete(send_for_review(scored))
            finally:
                loop.close()

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
