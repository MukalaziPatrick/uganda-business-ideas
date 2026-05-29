import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const intendedUse = new URL(req.url).searchParams.get('intended_use');
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json([]);

  let query = supabase
    .from('land_saved_searches')
    .select('*')
    .eq('notify_whatsapp', true);

  if (intendedUse) query = query.eq('intended_use', intendedUse);

  const { data } = await query;
  return NextResponse.json(data ?? []);
}
