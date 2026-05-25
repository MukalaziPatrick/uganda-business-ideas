import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const FREE_LIMIT = 3;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  const supabase = getSupabase();
  const month = currentMonth();

  const [usageRes, proRes] = await Promise.all([
    supabase
      .from('pitch_usage')
      .select('count')
      .eq('session_id', sessionId)
      .eq('month', month)
      .maybeSingle(),
    supabase
      .from('pitch_subscriptions')
      .select('active')
      .eq('session_id', sessionId)
      .eq('active', true)
      .maybeSingle(),
  ]);

  const count: number = usageRes.data?.count ?? 0;
  const isPro: boolean = !!proRes.data;
  const canGenerate: boolean = isPro || count < FREE_LIMIT;

  return NextResponse.json({ count, limit: FREE_LIMIT, isPro, canGenerate });
}

export async function POST(req: NextRequest) {
  let sessionId: string;
  try {
    const body = await req.json();
    sessionId = (body.session_id ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  const supabase = getSupabase();
  const month = currentMonth();

  const { data: proData } = await supabase
    .from('pitch_subscriptions')
    .select('active')
    .eq('session_id', sessionId)
    .eq('active', true)
    .maybeSingle();

  const isPro = !!proData;

  const { data: usageData } = await supabase
    .from('pitch_usage')
    .upsert(
      { session_id: sessionId, month, count: 1 },
      { onConflict: 'session_id,month', ignoreDuplicates: false }
    )
    .select('count')
    .maybeSingle();

  if (usageData?.count !== 1) {
    await supabase.rpc('increment_pitch_count', {
      p_session_id: sessionId,
      p_month: month,
    });
  }

  const { data: updated } = await supabase
    .from('pitch_usage')
    .select('count')
    .eq('session_id', sessionId)
    .eq('month', month)
    .maybeSingle();

  const count: number = updated?.count ?? 1;
  const canGenerate: boolean = isPro || count < FREE_LIMIT;

  return NextResponse.json({ count, limit: FREE_LIMIT, isPro, canGenerate });
}
