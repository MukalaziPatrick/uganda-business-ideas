import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const { error } = await supabase.from('land_insights').upsert(
    {
      listing_id: body.listing_id,
      farming_suitability: body.farming_suitability,
      access_road_quality: body.access_road_quality,
      nearby_infrastructure: body.nearby_infrastructure,
      risk_notes: body.risk_notes,
      planting_season_fit: body.planting_season_fit,
      generated_at: new Date().toISOString(),
      model_used: 'anthropic/claude-sonnet-4-6',
    },
    { onConflict: 'listing_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
