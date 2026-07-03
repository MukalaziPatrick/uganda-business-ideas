import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { getTransactionStatus } from '@/lib/land/pesapal';

// Pesapal calls this URL after payment (GET with query params, then optionally POST)
export async function GET(req: NextRequest) {
  return handleIpn(req);
}

export async function POST(req: NextRequest) {
  return handleIpn(req);
}

async function handleIpn(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderTrackingId = searchParams.get('OrderTrackingId') ?? searchParams.get('orderTrackingId');

  if (!orderTrackingId) {
    return NextResponse.json({ error: 'Missing OrderTrackingId' }, { status: 400 });
  }

  let status: Awaited<ReturnType<typeof getTransactionStatus>>;
  try {
    status = await getTransactionStatus(orderTrackingId);
  } catch (err) {
    console.error('[IPN] getTransactionStatus failed:', err);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }

  // Only proceed on confirmed Completed payments
  if (status?.payment_status_description !== 'Completed') {
    return NextResponse.json({ received: true, status: status?.payment_status_description });
  }

  // The merchant_reference we set is our tx_ref (land_<listing_id>_<ts>)
  const tx_ref: string = status.merchant_reference ?? '';

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  const accessExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Guard against replayed IPN deliveries (Pesapal retries legitimately, and
  // this URL is a GET) re-extending access and re-firing the WhatsApp notify.
  const { data: payment } = await supabase
    .from('land_payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      access_expires_at: accessExpiresAt,
    })
    .eq('payment_ref', tx_ref)
    .eq('status', 'pending')
    .select('*, listing:land_listings(title, id), agent:land_agents(whatsapp, name)')
    .single();

  if (!payment) return NextResponse.json({ received: true });

  // Notify n8n of confirmed payment
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
        listing_url: `${process.env.NEXT_PUBLIC_APP_URL}/land/browse/${payment.listing?.id}`,
        access_expires_at: accessExpiresAt,
      }),
    }).catch(console.error);
  }

  return NextResponse.json({ received: true });
}
