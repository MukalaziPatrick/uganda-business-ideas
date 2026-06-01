// app/api/whatsapp/_lib/telegram.ts
import type { Conversation } from '@/lib/supabase/whatsapp';

export async function notifyPatrick(
  conv: Conversation,
  reportText: string,
  reportId: string
): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');

  const summary = `📋 New Report Ready for Approval

Customer: ${conv.phone_number}
Business: ${conv.business_type}
Location: ${conv.location}
Budget: ${conv.budget}
Challenge: ${conv.concern}

--- REPORT ---
${reportText.slice(0, 3000)}${reportText.length > 3000 ? '\n\n[truncated — full report in DB]' : ''}`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: summary,
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Approve — Send to Customer', callback_data: `approve:${reportId}` },
            { text: '❌ Reject', callback_data: `reject:${reportId}` },
          ],
        ],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram notify failed: ${err}`);
  }

  const data = await res.json();
  return String(data.result.message_id);
}
