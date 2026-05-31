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
