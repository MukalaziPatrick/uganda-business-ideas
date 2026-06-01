// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateConversation, updateConversation, saveReport } from '@/lib/supabase/whatsapp';
import { transition } from '../_lib/state-machine';
import { sendWhatsAppMessage } from '../_lib/whatsapp';
import { generateReport } from '../_lib/claude';
import { notifyPatrick } from '../_lib/telegram';
import { pitchMessage } from '../_lib/messages';

// GET — Meta webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST — incoming WhatsApp messages
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Meta sends test pings — acknowledge silently
  const entry = body?.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (!message || message.type !== 'text') {
    return NextResponse.json({ status: 'ok' });
  }

  const phone = message.from as string;
  const text = message.text.body as string;

  try {
    const conv = await getOrCreateConversation(phone);
    const { updates, reply } = transition(conv, text);

    // Apply updates first
    if (Object.keys(updates).length > 0) {
      await updateConversation(conv.id, updates);
    }

    const updatedConv = { ...conv, ...updates };

    // Special case: finishing QUALIFYING — send pitch with final concern filled in
    if (conv.state === 'QUALIFYING' && !conv.concern && updates.concern) {
      const pitch = pitchMessage(updatedConv as typeof conv);
      await sendWhatsAppMessage(phone, pitch);
      return NextResponse.json({ status: 'ok' });
    }

    // Special case: PAID received — trigger generation pipeline
    if (updates.state === 'GENERATING') {
      if (reply) await sendWhatsAppMessage(phone, reply);

      const reportText = await generateReport(updatedConv as typeof conv);
      const telegramMsgId = await notifyPatrick(
        updatedConv as typeof conv,
        reportText,
        conv.id
      );
      await saveReport(conv.id, reportText, telegramMsgId);
      await updateConversation(conv.id, { state: 'AWAITING_APPROVAL' });
      return NextResponse.json({ status: 'ok' });
    }

    if (reply) await sendWhatsAppMessage(phone, reply);
  } catch (err) {
    console.error('[whatsapp webhook error]', err);
  }

  return NextResponse.json({ status: 'ok' });
}
