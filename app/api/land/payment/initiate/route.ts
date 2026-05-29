import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { initiateMobileMoney } from '@/lib/land/flutterwave';
import { getLandListingById } from '@/lib/land/queries';

export async function POST(req: NextRequest) {
  const { listing_id, phone, network } = await req.json();

  if (!listing_id || !phone || !network) {
    return NextResponse.json({ error: 'listing_id, phone, and network are required' }, { status: 400 });
  }

  if (!['MTN', 'AIRTEL'].includes(network)) {
    return NextResponse.json({ error: 'network must be MTN or AIRTEL' }, { status: 400 });
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
    payment_method: network.toLowerCase(),
    status: 'pending',
    agent_id: listing.agent_id,
    flutterwave_ref: tx_ref,
  });

  const result = await initiateMobileMoney({
    tx_ref,
    amount: 10000,
    phone,
    network,
    listing_id,
    listing_title: listing.title,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, tx_ref, message: result.message });
}
