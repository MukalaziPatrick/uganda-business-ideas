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

APPROVE_URL = f"{N8N_BASE}/webhook/farm-beacon-wait"
REJECT_URL  = f"{N8N_BASE}/webhook/farm-beacon-wait"


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    data = query.data or ""

    if data == "fb_approve":
        action = "approve"
        url = APPROVE_URL
        reply = "✅ Approved — post will go live at 7 AM EAT"
    elif data == "fb_reject":
        action = "reject"
        url = REJECT_URL
        reply = "❌ Skipped today ✅"
    else:
        return

    # Remove buttons so it can't be double-tapped
    await query.edit_message_reply_markup(reply_markup=None)

    # Notify n8n wait node
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.post(url, json={"action": action})
            log.info(f"n8n response: {resp.status_code} — action={action}")
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
