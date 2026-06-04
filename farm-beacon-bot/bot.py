import os
import logging
import asyncio
import httpx
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CallbackQueryHandler, ContextTypes

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

TOKEN = os.environ["FARM_BEACON_BOT_TOKEN"]
N8N_BASE = os.environ.get("N8N_BASE_URL", "https://n8n-production-c3c3.up.railway.app")

APPROVE_URL = f"{N8N_BASE}/webhook/farm-beacon-approve"
REJECT_URL  = f"{N8N_BASE}/webhook/farm-beacon-reject"


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    data = query.data or ""

    # data format: "fb_approve:rec123abc" or "fb_reject:rec123abc"
    parts = data.split(":", 1)
    action_key = parts[0]
    record_id = parts[1] if len(parts) > 1 else ""

    if action_key == "fb_approve":
        url = APPROVE_URL
        reply = "✅ Approved — posting to Facebook now"
    elif action_key == "fb_reject":
        url = REJECT_URL
        reply = "❌ Skipped today"
    else:
        return

    # Remove buttons so it can't be double-tapped
    await query.edit_message_reply_markup(reply_markup=None)

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.post(url, json={"record_id": record_id})
            log.info(f"n8n response: {resp.status_code} — action={action_key} record={record_id}")
        except Exception as e:
            log.error(f"Failed to notify n8n: {e}")
            await query.message.reply_text("⚠️ Could not reach n8n. Try again.")
            return

    await query.message.reply_text(reply)


def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CallbackQueryHandler(handle_callback))
    log.info("Farm Beacon Telegram bot started — polling")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
