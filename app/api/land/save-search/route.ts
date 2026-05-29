import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_phone, district, price_max, size_min, land_type, intended_use } = body;

  if (!user_phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  const { error } = await supabase.from('land_saved_searches').insert({
    user_phone,
    district: district ?? null,
    price_max: price_max ? Number(price_max) : null,
    size_min: size_min ? Number(size_min) : null,
    land_type: land_type ?? null,
    intended_use: intended_use ?? null,
    notify_whatsapp: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
