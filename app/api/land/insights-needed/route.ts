import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json([]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('land_listings')
    .select('id, title, district, parish, size_acres, land_type, intended_use')
    .or(`id.not.in.(select listing_id from land_insights),id.in.(select listing_id from land_insights where generated_at < '${sevenDaysAgo}')`)
    .limit(20);

  return NextResponse.json(data ?? []);
}
