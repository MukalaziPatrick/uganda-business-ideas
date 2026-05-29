import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const district = url.searchParams.get('district');
  const land_type = url.searchParams.get('land_type');
  const since = url.searchParams.get('since') ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json([]);

  let query = supabase
    .from('land_listings')
    .select('id, title, district, price_ugx, size_acres')
    .gte('created_at', since)
    .limit(5);

  if (district) query = query.eq('district', district);
  if (land_type) query = query.eq('land_type', land_type);

  const { data } = await query;
  return NextResponse.json(data ?? []);
}
