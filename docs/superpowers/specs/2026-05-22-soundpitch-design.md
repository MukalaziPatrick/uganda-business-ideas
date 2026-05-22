# SoundPitch — Design Spec
**Date:** 2026-05-22
**Project:** Business Yoo (uganda-business-ideas)
**Section:** `/pitch`

---

## What We're Building

A `/pitch` section inside Business Yoo that helps independent Ugandan and African artists get their music in front of the right people. Artists browse a curated directory of gatekeepers (radio stations, blogs, playlist curators, journalists), then use an AI-powered pitch generator to write a professional submission letter tailored to that specific contact — which they copy and send themselves.

---

## User

**Solo independent artist** — manages everything themselves, no team or manager. Not technically savvy. Wants something simple and fast that makes them look professional.

---

## Core Flow (3 Screens)

### Screen 1: Gatekeeper Directory (`/pitch`)
- Lists all gatekeepers with name, type (Radio / Blog / Playlist / Journalist), location, and genres they accept
- Filter bar at top: All | Radio | Blogs | Playlists | Journalists
- Each card shows: name, type badge, location, genres, "Pitch Now →" button
- Data stored in `app/data/gatekeepers.ts` (static file, same pattern as `salons.ts`, `travel.ts`)
- Initial directory: ~20–30 manually curated Ugandan/East African contacts

### Screen 2: Pitch Generator (`/pitch/[id]`)
- Shows gatekeeper details at top (who you're pitching to)
- Form fields:
  - Song Title
  - Artist Name
  - Genre
  - What the song is about (2–3 sentences)
  - YouTube / Spotify / SoundCloud link
- "Generate Pitch" button → calls `/api/pitch/generate` route
- Freemium gate: if user has used 3+ free pitches this month, show upgrade prompt

### Screen 3: Generated Pitch (`/pitch/[id]` — same page, below form)
- Displays the AI-generated pitch letter
- "Copy to Clipboard" button
- "Regenerate" button (uses another pitch credit)
- Shows remaining free pitches: "✅ 2 of 3 free pitches used this month"
- If on Pro plan: "Unlimited — Pro Plan"

---

## AI Pitch Generation

- Route: `POST /api/pitch/generate`
- Uses Claude API via OpenRouter (`openrouter.ai/api/v1`) — same pattern as `/api/ask/route.ts`
- Prompt includes: gatekeeper name, type, genres they accept + artist's song details
- Output: a 150–250 word professional pitch letter in English
- Tone: warm, professional, confident — not desperate or generic

**Prompt structure:**
```
You are a music PR professional helping an independent African artist pitch their music.
Write a professional pitch email to [gatekeeper name], a [type] that focuses on [genres].
Artist details: [song title], [artist name], [genre], [song description], [link].
Keep it 150-250 words. Warm, professional, specific to this gatekeeper.
```

---

## Freemium Model

| Tier | Price | Pitches |
|------|-------|---------|
| Free | UGX 0 | 3 per month |
| Pro | UGX 30,000/month | Unlimited |

- Pitch count tracked in Supabase: `pitch_usage` table (user_id, month, count)
- No auth required for free tier — track by browser localStorage + IP as best-effort
- Pro plan: simple Supabase `subscriptions` table, manual activation by admin initially (no payment gateway in V1)
- Payment gateway (MTN Mobile Money) added in V2

---

## Data Model

### `app/data/gatekeepers.ts` (static)
```ts
export type Gatekeeper = {
  id: string
  name: string
  type: 'radio' | 'blog' | 'playlist' | 'journalist'
  location: string
  genres: string[]
  description: string
  contactHint: string  // e.g. "Submit via email" — no actual email exposed publicly
}
```

### Supabase Tables (for freemium tracking)
```sql
-- pitch_usage: tracks monthly pitch count per anonymous session
create table pitch_usage (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,        -- localStorage UUID
  month text not null,             -- e.g. "2026-05"
  count int default 0,
  created_at timestamptz default now(),
  unique(session_id, month)
);

-- subscriptions: Pro plan users (manual activation V1)
create table pitch_subscriptions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  active boolean default true,
  activated_at timestamptz default now(),
  expires_at timestamptz
);
```

---

## Architecture

Follows existing Business Yoo patterns exactly:

```
app/
  pitch/
    page.tsx                  ← Directory listing (Server Component)
    PitchDirectoryClient.tsx  ← Filter + cards (Client Component)
    [id]/
      page.tsx                ← Gatekeeper detail + pitch form (Server Component)
      PitchGeneratorClient.tsx← Form + AI call + result display (Client Component)
  data/
    gatekeepers.ts            ← Static gatekeeper data
  api/
    pitch/
      generate/
        route.ts              ← POST → OpenRouter Claude API
      usage/
        route.ts              ← GET/POST pitch count for session
```

---

## Initial Gatekeeper Directory (V1 — 20 contacts)

**Radio (5):** Sanyu FM, Capital FM Uganda, CBS FM, Radio One, KFM
**Blogs (5):** Sqoop Online, Howwe Music, Uganda Music, Pulse Uganda, Chano8
**Playlist Curators (5):** Afrobeats Uganda (Spotify), East Africa Hits (Spotify), Uganda Gospel Playlist, Bongo & Afro Mix, New African Music
**Journalists/Influencers (5):** 3–4 Uganda music YouTubers/TikTokers (to be identified at build time)

---

## Out of Scope (V1)

- Artist accounts / login
- Payment gateway (MTN Mobile Money) — manual Pro activation only
- Email sending — artist copies and sends themselves
- Artist profile pages
- Gatekeeper self-registration
- Analytics dashboard

---

## Success Criteria

- Artist can browse directory, fill form, and get a pitch letter in under 2 minutes
- Pitch quality is noticeably better than what the artist would write themselves
- Free tier works with zero signup friction
- Pro upgrade path is clear when free limit is hit
