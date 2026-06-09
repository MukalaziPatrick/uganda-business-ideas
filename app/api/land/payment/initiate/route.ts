import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { submitOrder } from '@/lib/land/pesapal';
import { getLandListingById } from '@/lib/land/queries';

export async function POST(req: NextRequest) {
  const { listing_id, phone } = await req.json();

  if (!listing_id || !phone) {
    return NextResponse.json({ error: 'listing_id and phone are required' }, { status: 400 });
  }

  const listing = await getLandListingById(listing_id);
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

  const tx_ref = `land_${listing_id}_${Date.now()}`;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  await supabase.from('land_payments').insert({
    listing_id,
    buyer_phone: phone,
    amount_ugx: 10000,
    payment_method: 'mtn',
    status: 'pending',
    agent_id: listing.agent_id,
    payment_ref: tx_ref,
  });

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/land/payment/ipn`;

  let result: { redirect_url: string; order_tracking_id: string };
  try {
    result = await submitOrder({
      amount: 10000,
      reference: tx_ref,
      phone,
      description: `Land title check: ${listing.title}`,
      callbackUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment initiation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ redirect_url: result.redirect_url, tx_ref });
}
