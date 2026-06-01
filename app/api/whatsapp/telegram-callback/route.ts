// app/api/whatsapp/telegram-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  updateConversation,
  markReportApproved,
  markReportDelivered,
} from '@/lib/supabase/whatsapp';
import { sendWhatsAppMessage } from '../_lib/whatsapp';
import { deliveryMessage } from '../_lib/messages';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const callbackQuery = body?.callback_query;
  if (!callbackQuery) return NextResponse.json({ status: 'ok' });

  const data: string = callbackQuery.data ?? '';
  const [action, reportId] = data.split(':');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const callbackId = callbackQuery.id;

  // Acknowledge the button press to Telegram
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId }),
  });

  if (action === 'approve') {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return NextResponse.json({ status: 'server error' }, { status: 500 });
    const { data: report } = await supabase
      .from('whatsapp_reports')
      .select('id, conversation_id, report_text')
      .eq('id', reportId)
      .single();

    if (!report) return NextResponse.json({ status: 'not found' });

    const { data: conv } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('id', report.conversation_id)
      .single();

    if (!conv) return NextResponse.json({ status: 'conv not found' });

    await sendWhatsAppMessage(
      conv.phone_number,
      deliveryMessage(conv.business_type ?? 'business', report.report_text)
    );

    await markReportApproved(report.id);
    await markReportDelivered(report.id);
    await updateConversation(conv.id, { state: 'DELIVERED' });

    // Notify Patrick in Telegram that it was sent
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: callbackQuery.message.chat.id,
        text: `✅ Report sent to ${conv.phone_number}`,
      }),
    });
  }

  if (action === 'reject') {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: callbackQuery.message.chat.id,
        text: `❌ Report rejected. Send manually from your phone if needed.`,
      }),
    });
  }

  return NextResponse.json({ status: 'ok' });
}
