# SoundPitch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/pitch` section to Business Yoo where independent Ugandan/African artists browse a gatekeeper directory and generate AI-written pitch letters using Claude via OpenRouter.

**Architecture:** Static gatekeeper data in `app/data/gatekeepers.ts` (same pattern as salons/travel). Two Next.js pages: directory listing + per-gatekeeper pitch generator. Pitch generation calls `/api/pitch/generate` which hits OpenRouter. Freemium usage tracked in Supabase via anonymous session ID stored in localStorage.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (existing), OpenRouter API (Claude claude-haiku-4-5-20251001), Tailwind CSS (follow existing globals.css patterns)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `app/data/gatekeepers.ts` | Static gatekeeper list + types |
| Create | `app/pitch/page.tsx` | Directory listing (Server Component) |
| Create | `app/pitch/PitchDirectoryClient.tsx` | Filter + cards (Client Component) |
| Create | `app/pitch/[id]/page.tsx` | Gatekeeper detail + pitch form (Server Component) |
| Create | `app/pitch/[id]/PitchGeneratorClient.tsx` | Form + AI call + result (Client Component) |
| Create | `app/api/pitch/generate/route.ts` | POST → OpenRouter |
| Create | `app/api/pitch/usage/route.ts` | GET/POST pitch count per session |
| Modify | `.env.local` | Add OPENROUTER_API_KEY |
| Modify | `app/layout.tsx` | No change needed — nav handled per-page |

---

## Task 1: Add OpenRouter API Key to env

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add the key**

Open `.env.local` and add this line:
```
OPENROUTER_API_KEY=your_openrouter_key_here
```

Get the key from https://openrouter.ai → Dashboard → API Keys → Create Key. Free credits available on signup.

- [ ] **Step 2: Verify the key works**

Run in PowerShell:
```powershell
$headers = @{ "Authorization" = "Bearer $env:OPENROUTER_API_KEY"; "Content-Type" = "application/json" }
$body = '{"model":"anthropic/claude-haiku-4-5-20251001","max_tokens":50,"messages":[{"role":"user","content":"Say hello"}]}'
Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" -Method POST -Headers $headers -Body $body
```
Expected: JSON response with `choices[0].message.content` containing a greeting.

- [ ] **Step 3: Commit**

```bash
git add .env.local
git commit -m "config: add OpenRouter API key for SoundPitch pitch generation"
```

---

## Task 2: Create Gatekeeper Data File

**Files:**
- Create: `app/data/gatekeepers.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/data/gatekeepers.ts

export const GATEKEEPER_TYPES = ['radio', 'blog', 'playlist', 'journalist'] as const;
export type GatekeeperType = typeof GATEKEEPER_TYPES[number];

export const GATEKEEPER_TYPE_LABELS: Record<GatekeeperType, string> = {
  radio: '📻 Radio',
  blog: '📝 Blog',
  playlist: '🎵 Playlist',
  journalist: '🎤 Journalist',
};

export type Gatekeeper = {
  id: string;
  name: string;
  type: GatekeeperType;
  location: string;
  genres: string[];
  description: string;
  contactHint: string;
};

export const GATEKEEPERS: Gatekeeper[] = [
  // Radio
  {
    id: 'sanyu-fm',
    name: 'Sanyu FM',
    type: 'radio',
    location: 'Kampala, Uganda',
    genres: ['Afrobeats', 'RnB', 'Pop', 'Hip-hop'],
    description: 'One of Uganda\'s most popular FM stations. Strong urban audience, plays both local and international music.',
    contactHint: 'Submit via their website contact form or visit their studios in Kampala.',
  },
  {
    id: 'capital-fm-uganda',
    name: 'Capital FM Uganda',
    type: 'radio',
    location: 'Kampala, Uganda',
    genres: ['Pop', 'RnB', 'Afrobeats', 'Gospel'],
    description: 'Top 40 station with a wide listenership across Uganda. Known for breaking new local artists.',
    contactHint: 'Contact their music department via their official Facebook page or website.',
  },
  {
    id: 'cbs-fm',
    name: 'CBS FM',
    type: 'radio',
    location: 'Kampala, Uganda',
    genres: ['Luganda music', 'Gospel', 'Traditional', 'Afrobeats'],
    description: 'Largest Luganda-language radio station. Essential for artists targeting Buganda audiences.',
    contactHint: 'Reach out via their website or visit their studios in Mengo, Kampala.',
  },
  {
    id: 'radio-one',
    name: 'Radio One',
    type: 'radio',
    location: 'Kampala, Uganda',
    genres: ['RnB', 'Hip-hop', 'Afrobeats', 'Pop'],
    description: 'Youth-focused station with strong social media presence. Good for urban and contemporary music.',
    contactHint: 'DM their official Twitter/X account or submit via their website.',
  },
  {
    id: 'kfm',
    name: 'KFM 93.3',
    type: 'radio',
    location: 'Kampala, Uganda',
    genres: ['Pop', 'RnB', 'Afrobeats', 'Gospel'],
    description: 'Premium station owned by Monitor Publications. Wide reach across central Uganda.',
    contactHint: 'Contact via their website or email their music director.',
  },
  // Blogs
  {
    id: 'sqoop-online',
    name: 'Sqoop Online',
    type: 'blog',
    location: 'Uganda',
    genres: ['All genres'],
    description: 'Leading Ugandan entertainment website. Covers music, film, celebrity news. High traffic and credibility.',
    contactHint: 'Submit via their website contact page or reach their entertainment desk.',
  },
  {
    id: 'howwe-music',
    name: 'Howwe Music',
    type: 'blog',
    location: 'Uganda',
    genres: ['All genres', 'Ugandan music'],
    description: 'Dedicated Uganda music platform. Features new releases, interviews, and artist profiles.',
    contactHint: 'Submit your music directly via howwe.biz or their Facebook page.',
  },
  {
    id: 'pulse-uganda',
    name: 'Pulse Uganda',
    type: 'blog',
    location: 'Uganda',
    genres: ['Afrobeats', 'Pop', 'RnB', 'Hip-hop'],
    description: 'Part of the pan-African Pulse media network. Strong online readership and social sharing.',
    contactHint: 'Contact their Uganda editorial team via pulse.ug or their social pages.',
  },
  {
    id: 'chano8',
    name: 'Chano8',
    type: 'blog',
    location: 'Uganda',
    genres: ['All genres', 'Ugandan music'],
    description: 'Established Uganda entertainment blog. Known for in-depth artist features and reviews.',
    contactHint: 'Submit via their website or reach out on their official Facebook page.',
  },
  {
    id: 'nilepost',
    name: 'Nile Post Entertainment',
    type: 'blog',
    location: 'Uganda',
    genres: ['All genres'],
    description: 'Growing news and entertainment portal in Uganda. Active music coverage section.',
    contactHint: 'Contact their entertainment desk via nilepost.co.ug.',
  },
  // Playlists
  {
    id: 'afrobeats-uganda-spotify',
    name: 'Afrobeats Uganda (Spotify)',
    type: 'playlist',
    location: 'Uganda / East Africa',
    genres: ['Afrobeats', 'Afropop'],
    description: 'Curated Spotify playlist featuring the best Afrobeats from Uganda and East Africa.',
    contactHint: 'Find the curator on Spotify and send a submission message with your song link.',
  },
  {
    id: 'east-africa-hits-spotify',
    name: 'East Africa Hits (Spotify)',
    type: 'playlist',
    location: 'East Africa',
    genres: ['All East African genres'],
    description: 'Popular playlist covering Uganda, Kenya, Tanzania, and Rwanda. Great for regional exposure.',
    contactHint: 'Search "East Africa Hits" on Spotify and contact the curator via their profile.',
  },
  {
    id: 'uganda-gospel-playlist',
    name: 'Uganda Gospel Music (Spotify)',
    type: 'playlist',
    location: 'Uganda',
    genres: ['Gospel', 'Praise & Worship'],
    description: 'Dedicated Gospel playlist for Ugandan Christian music. Active following among church communities.',
    contactHint: 'Contact the curator via their Spotify profile or linked social accounts.',
  },
  {
    id: 'new-african-music',
    name: 'New African Music (YouTube)',
    type: 'playlist',
    location: 'Africa',
    genres: ['Afrobeats', 'Afropop', 'Amapiano'],
    description: 'YouTube playlist channel featuring new African music releases. Good for video submissions.',
    contactHint: 'Submit your YouTube video link via their channel community tab or comment section.',
  },
  {
    id: 'bongo-afro-mix',
    name: 'Bongo & Afro Mix (YouTube)',
    type: 'playlist',
    location: 'East Africa',
    genres: ['Bongo Flava', 'Afrobeats', 'East African'],
    description: 'East African music YouTube playlist with strong Tanzanian and Ugandan following.',
    contactHint: 'Contact via the YouTube channel about page or their linked social media.',
  },
  // Journalists / Influencers
  {
    id: 'spark-tv-music',
    name: 'Spark TV Entertainment',
    type: 'journalist',
    location: 'Kampala, Uganda',
    genres: ['All genres'],
    description: 'Uganda TV channel with strong music programming. Features artist interviews and music videos.',
    contactHint: 'Contact their entertainment producers via Spark TV\'s official social media.',
  },
  {
    id: 'nbs-tv-entertainment',
    name: 'NBS TV After 5',
    type: 'journalist',
    location: 'Kampala, Uganda',
    genres: ['All genres'],
    description: 'Popular evening entertainment show on NBS TV Uganda. Covers music releases and events.',
    contactHint: 'Reach their entertainment desk via NBS TV\'s official Facebook or Twitter.',
  },
  {
    id: 'solomon-waves',
    name: 'Solomon Waves (YouTube)',
    type: 'journalist',
    location: 'Uganda',
    genres: ['All Ugandan genres'],
    description: 'Ugandan music YouTuber reviewing and promoting local artists. Growing subscriber base.',
    contactHint: 'Submit via DM on their YouTube channel or linked Instagram account.',
  },
  {
    id: 'music-hub-ug',
    name: 'Music Hub UG (Instagram)',
    type: 'journalist',
    location: 'Uganda',
    genres: ['Afrobeats', 'RnB', 'Pop', 'Gospel'],
    description: 'Instagram page dedicated to promoting Ugandan music. Active reposting and features.',
    contactHint: 'DM them on Instagram with your song info and cover art.',
  },
  {
    id: 'east-africa-music-review',
    name: 'EA Music Review (YouTube)',
    type: 'journalist',
    location: 'East Africa',
    genres: ['All East African genres'],
    description: 'YouTube channel reviewing music from across East Africa. Known for honest, detailed reviews.',
    contactHint: 'Submit your music for review via the email in their YouTube channel About section.',
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add app/data/gatekeepers.ts
git commit -m "feat: add gatekeeper data file with 20 Ugandan/African music contacts"
```

---

## Task 3: Create Supabase Tables for Freemium Usage Tracking

**Files:**
- Supabase SQL migration (run in Supabase dashboard SQL editor)

- [ ] **Step 1: Run this SQL in your Supabase dashboard**

Go to https://supabase.com → your project → SQL Editor → paste and run:

```sql
-- Track monthly pitch usage per anonymous session
create table if not exists pitch_usage (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  month text not null,
  count int not null default 0,
  created_at timestamptz not null default now(),
  constraint pitch_usage_session_month unique (session_id, month)
);

-- Pro plan subscriptions (manually activated in V1)
create table if not exists pitch_subscriptions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  active boolean not null default true,
  activated_at timestamptz not null default now(),
  expires_at timestamptz
);

-- Allow anonymous reads/writes via anon key
alter table pitch_usage enable row level security;
alter table pitch_subscriptions enable row level security;

create policy "Anyone can read and upsert their own usage"
  on pitch_usage for all
  using (true)
  with check (true);

create policy "Anyone can read subscriptions"
  on pitch_subscriptions for select
  using (true);
```

- [ ] **Step 2: Verify tables exist**

In Supabase dashboard → Table Editor — confirm `pitch_usage` and `pitch_subscriptions` tables appear.

- [ ] **Step 3: Commit a migration note**

```bash
mkdir -p supabase/migrations
echo "-- pitch_usage and pitch_subscriptions tables created via Supabase dashboard on 2026-05-22" > supabase/migrations/20260522_soundpitch.sql
git add supabase/migrations/20260522_soundpitch.sql
git commit -m "docs: record SoundPitch Supabase migration"
```

---

## Task 4: Usage API Route

**Files:**
- Create: `app/api/pitch/usage/route.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/pitch/usage/route.ts
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

// GET /api/pitch/usage?session_id=xxx
// Returns { count, limit, isPro, canGenerate }
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

// POST /api/pitch/usage
// Body: { session_id }
// Increments count, returns updated { count, limit, isPro, canGenerate }
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

  // Check pro status first
  const { data: proData } = await supabase
    .from('pitch_subscriptions')
    .select('active')
    .eq('session_id', sessionId)
    .eq('active', true)
    .maybeSingle();

  const isPro = !!proData;

  // Upsert usage count
  const { data: usageData, error } = await supabase
    .from('pitch_usage')
    .upsert(
      { session_id: sessionId, month, count: 1 },
      { onConflict: 'session_id,month', ignoreDuplicates: false }
    )
    .select('count')
    .maybeSingle();

  // If upsert didn't increment (row existed), do manual increment
  if (!error && usageData?.count === 1) {
    // Row was just inserted, count is already 1
  } else {
    await supabase.rpc('increment_pitch_count', {
      p_session_id: sessionId,
      p_month: month,
    });
  }

  // Fetch updated count
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
```

- [ ] **Step 2: Add the Supabase RPC function for incrementing**

In Supabase SQL Editor, run:

```sql
create or replace function increment_pitch_count(p_session_id text, p_month text)
returns void language plpgsql as $$
begin
  update pitch_usage
  set count = count + 1
  where session_id = p_session_id and month = p_month;
end;
$$;
```

- [ ] **Step 3: Commit**

```bash
git add app/api/pitch/usage/route.ts
git commit -m "feat: add pitch usage tracking API route"
```

---

## Task 5: Pitch Generation API Route

**Files:**
- Create: `app/api/pitch/generate/route.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/pitch/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a music PR professional helping an independent African artist pitch their music to media contacts.

Write a professional pitch email. Follow these rules:
- 150 to 200 words maximum
- Warm, confident, and professional tone — not desperate or generic
- Address the specific gatekeeper by name and reference what they cover
- Include the song title, artist name, genre, and a brief description of the song
- End with the streaming/YouTube link and a clear ask (e.g. "I'd love for you to play it" or "I'd be grateful for a feature")
- Write in plain paragraphs — no bullet points, no markdown
- Do not include a subject line — only the email body`;

export async function POST(req: NextRequest) {
  let gatekeeperName: string;
  let gatekeeperType: string;
  let gatekeeperGenres: string;
  let songTitle: string;
  let artistName: string;
  let genre: string;
  let songDescription: string;
  let musicLink: string;

  try {
    const body = await req.json();
    gatekeeperName = (body.gatekeeperName ?? '').trim();
    gatekeeperType = (body.gatekeeperType ?? '').trim();
    gatekeeperGenres = (body.gatekeeperGenres ?? '').trim();
    songTitle = (body.songTitle ?? '').trim();
    artistName = (body.artistName ?? '').trim();
    genre = (body.genre ?? '').trim();
    songDescription = (body.songDescription ?? '').trim();
    musicLink = (body.musicLink ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!gatekeeperName || !songTitle || !artistName || !genre || !songDescription || !musicLink) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const userPrompt = `Write a pitch email to ${gatekeeperName}, a ${gatekeeperType} that focuses on ${gatekeeperGenres}.

Artist details:
- Song title: ${songTitle}
- Artist name: ${artistName}
- Genre: ${genre}
- About the song: ${songDescription}
- Music link: ${musicLink}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://businessyoo.com',
        'X-Title': 'SoundPitch',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter error:', await response.text());
      return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 502 });
    }

    const data = await response.json();
    const pitch: string = data?.choices?.[0]?.message?.content ?? '';

    if (!pitch) {
      return NextResponse.json({ error: 'Could not generate pitch. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ pitch });
  } catch (err) {
    console.error('Pitch generation error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/pitch/generate/route.ts
git commit -m "feat: add pitch generation API route via OpenRouter"
```

---

## Task 6: Gatekeeper Directory Page

**Files:**
- Create: `app/pitch/page.tsx`
- Create: `app/pitch/PitchDirectoryClient.tsx`

- [ ] **Step 1: Create `app/pitch/page.tsx`**

```typescript
// app/pitch/page.tsx
import type { Metadata } from 'next';
import { GATEKEEPERS } from '@/app/data/gatekeepers';
import PitchDirectoryClient from './PitchDirectoryClient';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'SoundPitch — Get Your Music Heard | Business Yoo',
  description: 'Connect with Uganda and East Africa\'s top radio stations, music blogs, playlist curators, and journalists. Generate a professional pitch letter in seconds.',
  alternates: { canonical: `${SITE_URL}/pitch` },
  openGraph: {
    title: 'SoundPitch — Get Your Music Heard',
    description: 'AI-powered music pitch tool for independent Ugandan and African artists.',
    url: `${SITE_URL}/pitch`,
    siteName: 'Business Yoo',
    locale: 'en_UG',
    type: 'website',
  },
};

export default function PitchPage() {
  return <PitchDirectoryClient gatekeepers={GATEKEEPERS} />;
}
```

- [ ] **Step 2: Create `app/pitch/PitchDirectoryClient.tsx`**

```typescript
// app/pitch/PitchDirectoryClient.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Gatekeeper, GatekeeperType } from '@/app/data/gatekeepers';
import { GATEKEEPER_TYPES, GATEKEEPER_TYPE_LABELS } from '@/app/data/gatekeepers';

export default function PitchDirectoryClient({ gatekeepers }: { gatekeepers: Gatekeeper[] }) {
  const [activeFilter, setActiveFilter] = useState<GatekeeperType | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return gatekeepers.filter((g) => {
      const matchesFilter = activeFilter === 'all' || g.type === activeFilter;
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        g.name.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q) ||
        g.genres.some((genre) => genre.toLowerCase().includes(q));
      return matchesFilter && matchesQuery;
    });
  }, [gatekeepers, activeFilter, query]);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '32px 24px 24px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none' }}>← Business Yoo</Link>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#e94560' }}>🎵 SoundPitch</h1>
          <p style={{ color: '#aaa', margin: '0 0 24px', fontSize: 15 }}>
            Find the right contacts and let AI write your pitch letter. Free for independent artists.
          </p>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, genre, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #333', background: '#111', color: '#fff',
              fontSize: 14, boxSizing: 'border-box', marginBottom: 16,
            }}
          />

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['all', ...GATEKEEPER_TYPES] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: activeFilter === type ? '#e94560' : '#222',
                  color: activeFilter === type ? '#fff' : '#aaa',
                }}
              >
                {type === 'all' ? 'All' : GATEKEEPER_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
          {filtered.length} contact{filtered.length !== 1 ? 's' : ''} found
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((g) => (
            <div
              key={g.id}
              style={{
                background: '#1a1a2e', borderRadius: 10, padding: '16px 20px',
                border: '1px solid #222', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{g.name}</span>
                  <span style={{
                    background: '#0f3460', color: '#7eb8f7', fontSize: 11,
                    padding: '2px 8px', borderRadius: 10,
                  }}>
                    {GATEKEEPER_TYPE_LABELS[g.type]}
                  </span>
                </div>
                <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{g.location}</div>
                <div style={{ color: '#666', fontSize: 12 }}>{g.genres.join(' · ')}</div>
              </div>
              <Link
                href={`/pitch/${g.id}`}
                style={{
                  background: '#e94560', color: '#fff', padding: '8px 18px',
                  borderRadius: 8, textDecoration: 'none', fontSize: 14,
                  fontWeight: 600, whiteSpace: 'nowrap',
                }}
              >
                Pitch Now →
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#555', padding: '60px 0' }}>
            No contacts match your search. Try a different filter.
          </div>
        )}

        {/* Freemium note */}
        <div style={{
          marginTop: 40, padding: '16px 20px', background: '#111',
          borderRadius: 10, border: '1px solid #222', textAlign: 'center',
        }}>
          <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
            🎁 <strong style={{ color: '#fff' }}>Free:</strong> 3 AI pitch letters per month.{' '}
            <strong style={{ color: '#e94560' }}>Pro (UGX 30,000/mo):</strong> Unlimited pitches + premium contacts.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/pitch/page.tsx app/pitch/PitchDirectoryClient.tsx
git commit -m "feat: add SoundPitch gatekeeper directory page"
```

---

## Task 7: Pitch Generator Page

**Files:**
- Create: `app/pitch/[id]/page.tsx`
- Create: `app/pitch/[id]/PitchGeneratorClient.tsx`

- [ ] **Step 1: Create `app/pitch/[id]/page.tsx`**

```typescript
// app/pitch/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GATEKEEPERS } from '@/app/data/gatekeepers';
import { SITE_URL } from '@/lib/site';
import PitchGeneratorClient from './PitchGeneratorClient';

export function generateStaticParams() {
  return GATEKEEPERS.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const gatekeeper = GATEKEEPERS.find((g) => g.id === id);
  if (!gatekeeper) return {};
  return {
    title: `Pitch to ${gatekeeper.name} | SoundPitch`,
    description: `Generate a professional pitch letter for ${gatekeeper.name}. Free AI pitch tool for Ugandan artists.`,
    alternates: { canonical: `${SITE_URL}/pitch/${id}` },
  };
}

export default async function PitchGeneratorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gatekeeper = GATEKEEPERS.find((g) => g.id === id);
  if (!gatekeeper) notFound();
  return <PitchGeneratorClient gatekeeper={gatekeeper} />;
}
```

- [ ] **Step 2: Create `app/pitch/[id]/PitchGeneratorClient.tsx`**

```typescript
// app/pitch/[id]/PitchGeneratorClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Gatekeeper } from '@/app/data/gatekeepers';
import { GATEKEEPER_TYPE_LABELS } from '@/app/data/gatekeepers';

const FREE_LIMIT = 3;

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('soundpitch_session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('soundpitch_session', id);
  }
  return id;
}

type UsageState = { count: number; isPro: boolean; canGenerate: boolean; loaded: boolean };

export default function PitchGeneratorClient({ gatekeeper }: { gatekeeper: Gatekeeper }) {
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('');
  const [songDescription, setSongDescription] = useState('');
  const [musicLink, setMusicLink] = useState('');

  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [usage, setUsage] = useState<UsageState>({ count: 0, isPro: false, canGenerate: true, loaded: false });

  const fetchUsage = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/pitch/usage?session_id=${sessionId}`);
      const data = await res.json();
      setUsage({ count: data.count, isPro: data.isPro, canGenerate: data.canGenerate, loaded: true });
    } catch {
      setUsage((u) => ({ ...u, loaded: true }));
    }
  }, []);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (sessionId) fetchUsage(sessionId);
  }, [fetchUsage]);

  const handleGenerate = async () => {
    if (!songTitle || !artistName || !genre || !songDescription || !musicLink) {
      setError('Please fill in all fields.');
      return;
    }
    if (!usage.canGenerate) return;

    setLoading(true);
    setError('');
    setPitch('');

    const sessionId = getOrCreateSessionId();

    try {
      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatekeeperName: gatekeeper.name,
          gatekeeperType: GATEKEEPER_TYPE_LABELS[gatekeeper.type],
          gatekeeperGenres: gatekeeper.genres.join(', '),
          songTitle,
          artistName,
          genre,
          songDescription,
          musicLink,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        return;
      }

      setPitch(data.pitch);

      // Increment usage
      await fetch('/api/pitch/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      await fetchUsage(sessionId);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #333', background: '#111', color: '#fff',
    fontSize: 14, boxSizing: 'border-box' as const, marginTop: 4,
  };

  const remainingPitches = Math.max(0, FREE_LIMIT - usage.count);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '24px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Link href="/pitch" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none' }}>← Back to Directory</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '12px 0 4px', color: '#e94560' }}>
            Pitch to: {gatekeeper.name}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#0f3460', color: '#7eb8f7', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>
              {GATEKEEPER_TYPE_LABELS[gatekeeper.type]}
            </span>
            <span style={{ color: '#666', fontSize: 13 }}>{gatekeeper.location}</span>
            <span style={{ color: '#555', fontSize: 13 }}>· {gatekeeper.genres.join(', ')}</span>
          </div>
          <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>{gatekeeper.description}</p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
        {/* Usage indicator */}
        {usage.loaded && (
          <div style={{
            background: usage.isPro ? '#0f3460' : '#1a1a2e',
            border: `1px solid ${usage.canGenerate ? '#333' : '#e94560'}`,
            borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13,
          }}>
            {usage.isPro
              ? '⭐ Pro Plan — Unlimited pitch letters'
              : usage.canGenerate
              ? `🎁 Free plan: ${remainingPitches} of ${FREE_LIMIT} pitches remaining this month`
              : '🔒 You\'ve used all 3 free pitches this month. Upgrade to Pro for UGX 30,000/mo for unlimited pitches.'}
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Song Title *', value: songTitle, onChange: setSongTitle, placeholder: 'e.g. Mukama Ayinza' },
            { label: 'Your Artist Name *', value: artistName, onChange: setArtistName, placeholder: 'e.g. Isaac Ssemwanga' },
            { label: 'Genre *', value: genre, onChange: setGenre, placeholder: 'e.g. Gospel / Luganda' },
            { label: 'Music Link (YouTube, Spotify, SoundCloud) *', value: musicLink, onChange: setMusicLink, placeholder: 'https://...' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <label style={{ fontSize: 13, color: '#aaa', display: 'block' }}>{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={inputStyle}
                disabled={!usage.canGenerate}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 13, color: '#aaa', display: 'block' }}>
              What is the song about? (2–3 sentences) *
            </label>
            <textarea
              value={songDescription}
              onChange={(e) => setSongDescription(e.target.value)}
              placeholder="e.g. This is a Gospel song about trusting God during hard times. It was inspired by my personal journey through loss. The production blends Luganda lyrics with contemporary Afrobeats rhythms."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              disabled={!usage.canGenerate}
            />
          </div>

          {error && <p style={{ color: '#e94560', fontSize: 13, margin: 0 }}>{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading || !usage.canGenerate}
            style={{
              background: usage.canGenerate ? '#e94560' : '#333',
              color: usage.canGenerate ? '#fff' : '#666',
              border: 'none', borderRadius: 8, padding: '12px 24px',
              fontSize: 15, fontWeight: 700, cursor: usage.canGenerate ? 'pointer' : 'not-allowed',
              width: '100%',
            }}
          >
            {loading ? '✨ Generating your pitch...' : '✨ Generate Pitch Letter'}
          </button>
        </div>

        {/* Result */}
        {pitch && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>📋 Your Pitch — Ready to Send!</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? '#22c55e' : '#e94560', color: '#fff',
                    border: 'none', borderRadius: 6, padding: '6px 14px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !usage.canGenerate}
                  style={{
                    background: '#222', color: '#aaa',
                    border: '1px solid #333', borderRadius: 6, padding: '6px 14px',
                    fontSize: 13, cursor: 'pointer',
                  }}
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>

            <div style={{
              background: '#1a1a2e', border: '1px solid #333', borderRadius: 10,
              padding: '20px', fontSize: 14, lineHeight: 1.7, color: '#ddd',
              whiteSpace: 'pre-wrap',
            }}>
              {pitch}
            </div>

            <div style={{
              marginTop: 16, padding: '12px 16px', background: '#111',
              borderRadius: 8, border: '1px solid #222',
            }}>
              <p style={{ color: '#888', fontSize: 12, margin: '0 0 4px' }}>
                📌 <strong style={{ color: '#aaa' }}>How to send this:</strong>
              </p>
              <p style={{ color: '#666', fontSize: 12, margin: 0 }}>
                Copy the pitch above → Open your email or WhatsApp → Paste and send to {gatekeeper.name}.{' '}
                <span style={{ color: '#888' }}>{gatekeeper.contactHint}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/pitch/[id]/page.tsx "app/pitch/[id]/PitchGeneratorClient.tsx"
git commit -m "feat: add pitch generator page with AI letter generation"
```

---

## Task 8: Test the Full Flow

- [ ] **Step 1: Start the dev server**

```bash
cd d:/projects/uganda-business-ideas
npm run dev
```

Expected: Server starts on http://localhost:3000

- [ ] **Step 2: Test the directory page**

Open http://localhost:3000/pitch

Expected:
- 20 gatekeeper cards visible
- Filter tabs work (All / Radio / Blog / Playlist / Journalist)
- Search filters cards in real time
- "Pitch Now →" links are clickable

- [ ] **Step 3: Test the pitch generator**

Click "Pitch Now →" on any card. Fill in:
- Song Title: `Test Song`
- Artist Name: `Test Artist`
- Genre: `Afrobeats`
- Song Description: `This is a test song about joy and celebration. It was recorded in Kampala.`
- Music Link: `https://youtube.com/watch?v=test`

Click "Generate Pitch Letter".

Expected:
- Loading state shows while generating
- A 150–200 word pitch letter appears
- Usage counter decrements (e.g. "2 of 3 pitches remaining")
- Copy button copies text to clipboard

- [ ] **Step 4: Test the freemium gate**

Generate 3 pitches (you may need to use different browser sessions or reset Supabase data for testing).

Expected: After 3 pitches, the form is disabled and upgrade message shows.

- [ ] **Step 5: Commit any fixes found during testing**

```bash
git add -A
git commit -m "fix: resolve issues found during manual testing of SoundPitch"
```

---

## Task 9: Add /pitch Link to Homepage

**Files:**
- Modify: `app/page.tsx` or `app/HomeClient.tsx`

- [ ] **Step 1: Read the current homepage to find where to add the link**

Check `app/HomeClient.tsx` for the section cards or navigation links.

- [ ] **Step 2: Add a SoundPitch card/link**

In the appropriate section of `HomeClient.tsx`, add:

```tsx
<Link href="/pitch" style={{
  display: 'block', background: '#1a1a2e', border: '1px solid #333',
  borderRadius: 10, padding: '16px 20px', textDecoration: 'none', color: '#fff',
}}>
  <div style={{ fontSize: 20, marginBottom: 4 }}>🎵</div>
  <div style={{ fontWeight: 700, marginBottom: 4 }}>SoundPitch</div>
  <div style={{ color: '#888', fontSize: 13 }}>Get your music heard. AI pitch letters for artists.</div>
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add app/HomeClient.tsx
git commit -m "feat: add SoundPitch entry point to homepage"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Gatekeeper directory with filter (Task 6)
- ✅ 4 gatekeeper types: radio, blog, playlist, journalist (Task 2)
- ✅ 20 curated contacts (Task 2)
- ✅ Pitch generator form with all required fields (Task 7)
- ✅ AI generation via OpenRouter (Task 5)
- ✅ Copy + Regenerate buttons (Task 7)
- ✅ Freemium: 3 free pitches/month (Tasks 3, 4, 7)
- ✅ Usage tracked via localStorage session ID + Supabase (Tasks 3, 4, 7)
- ✅ Pro plan gate shown when limit hit (Task 7)
- ✅ Contact hint shown on result (Task 7)

**Type consistency check:**
- `Gatekeeper` type defined in Task 2, used in Tasks 6 and 7 ✅
- `GatekeeperType` used consistently across all files ✅
- `GATEKEEPER_TYPE_LABELS` imported correctly in all client files ✅
- `session_id` field name consistent between usage API and client ✅

**Placeholder scan:** No TBDs or incomplete steps found. ✅
