// app/api/land/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { syncLandListing } from '@/lib/land/sync';
import type { LandSyncPayload } from '@/lib/supabase/land-types';

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization');
  const secret = process.env.SYNC_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authHeader ?? '');
  const match = expected.length === received.length &&
    timingSafeEqual(expected, received);
  if (!match) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: LandSyncPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate required fields
  if (!payload.safelands_id || !payload.title || !payload.district || !payload.verification_stage || !payload.agent?.safelands_agent_id) {
    return NextResponse.json(
      { error: 'Missing required fields: safelands_id, title, district, verification_stage, agent.safelands_agent_id' },
      { status: 400 }
    );
  }

  const result = await syncLandListing(payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    listing_url: result.listing_url,
    qr_url: result.qr_url,
  });
}
