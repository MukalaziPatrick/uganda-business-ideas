import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, body, content_type, district, generated_by } = await req.json();

  if (!title || !body || !content_type) {
    return NextResponse.json({ error: 'title, body, and content_type are required' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  const slug = `${slugify(title)}-${Date.now()}`;

  const { error } = await supabase.from('land_content').insert({
    title,
    slug,
    body,
    content_type,
    district: district ?? null,
    generated_by: generated_by ?? 'n8n',
    published_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, slug });
}
