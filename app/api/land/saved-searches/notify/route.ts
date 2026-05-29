import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  await supabase
    .from('land_saved_searches')
    .update({ last_notified_at: new Date().toISOString() })
    .eq('id', id);

  return NextResponse.json({ success: true });
}
