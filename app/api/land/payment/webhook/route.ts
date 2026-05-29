import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/land/flutterwave';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('verif-hash') ?? '';
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== 'charge.completed' || event.data?.status !== 'successful') {
    return NextResponse.json({ received: true });
  }

  const tx_ref: string = event.data.tx_ref;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  const accessExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data: payment } = await supabase
    .from('land_payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      access_expires_at: accessExpiresAt,
    })
    .eq('flutterwave_ref', tx_ref)
    .select('*, listing:land_listings(title, id), agent:land_agents(whatsapp, name)')
    .single();

  if (!payment) return NextResponse.json({ received: true });

  if (process.env.N8N_PAYMENT_WEBHOOK) {
    await fetch(process.env.N8N_PAYMENT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': process.env.N8N_LAND_SYNC_SECRET ?? '',
      },
      body: JSON.stringify({
        buyer_phone: payment.buyer_phone,
        agent_whatsapp: payment.agent?.whatsapp,
        agent_name: payment.agent?.name,
        listing_title: payment.listing?.title,
        listing_url: `${process.env.NEXT_PUBLIC_SITE_URL}/land/browse/${payment.listing?.id}`,
        access_expires_at: accessExpiresAt,
      }),
    }).catch(console.error);
  }

  return NextResponse.json({ received: true });
}
