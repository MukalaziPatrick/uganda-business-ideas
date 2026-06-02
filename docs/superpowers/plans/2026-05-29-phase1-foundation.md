# Business Yoo Living Platform — Phase 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `land_*` Supabase tables, the sync API endpoint that SafeLands Admin calls on verification, and the `/apps` holding hub page — without touching the homepage.

**Architecture:** Six new Supabase tables with `land_` prefix are added to the existing Business Yoo Supabase project. A `POST /api/land/sync` route on Business Yoo receives verified listing data from SafeLands Admin and upserts it. A `/apps` page provides an internal nav to all verticals.

**Tech Stack:** Next.js 15, TypeScript, Supabase (existing project), nanoid for QR tokens

---

## File Structure

**New files:**
- `lib/supabase/land-types.ts` — TypeScript types for all land_ tables
- `lib/land/sync.ts` — upsert logic for listings + agents, qr_token generation
- `app/api/land/sync/route.ts` — POST endpoint, auth check, calls sync.ts
- `app/apps/page.tsx` — /apps holding hub
- `supabase/migrations/001_land_tables.sql` — all 6 land_ table definitions

**Modified files:**
- `lib/supabase/types.ts` — add LandListing, LandAgent, LandInsight, LandPayment, LandContent, LandSavedSearch types (re-exported from land-types.ts)

---

### Task 1: Supabase migration — land_ tables

**Files:**
- Create: `supabase/migrations/001_land_tables.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/001_land_tables.sql

create extension if not exists "pgcrypto";

-- Agents must exist before listings (FK)
create table if not exists land_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  whatsapp text,
  photo text,
  district text,
  bio text,
  is_verified boolean default false,
  response_time_hrs integer,
  rating numeric(3,2),
  safelands_agent_id text unique,
  created_at timestamptz default now()
);

create table if not exists land_listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  district text not null,
  parish text,
  lat numeric(10,7),
  lng numeric(10,7),
  size_acres numeric(10,4),
  price_ugx bigint,
  land_type text check (land_type in ('mailo','freehold','leasehold','customary')),
  intended_use text check (intended_use in ('farming','residential','commercial','mixed')),
  title_status text check (title_status in ('clean','caution','pending','unknown')) default 'unknown',
  verification_stage text check (verification_stage in ('unverified','submitted','in-review','verified')) default 'unverified',
  trust_score integer check (trust_score between 0 and 100) default 0,
  qr_token text unique,
  agent_id uuid references land_agents(id),
  photos text[] default '{}',
  is_featured boolean default false,
  safelands_id text unique,
  created_at timestamptz default now(),
  verified_at timestamptz,
  updated_at timestamptz default now()
);

create table if not exists land_insights (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references land_listings(id) on delete cascade,
  farming_suitability text,
  access_road_quality text,
  nearby_infrastructure text,
  risk_notes text,
  planting_season_fit text,
  generated_at timestamptz default now(),
  model_used text
);

create table if not exists land_payments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references land_listings(id),
  buyer_phone text not null,
  amount_ugx integer default 10000,
  payment_method text check (payment_method in ('mtn','airtel','whatsapp-manual')),
  status text check (status in ('pending','paid','expired')) default 'pending',
  access_expires_at timestamptz,
  agent_id uuid references land_agents(id),
  flutterwave_ref text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists land_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  body text,
  content_type text check (content_type in ('guide','spotlight','seasonal','explainer')),
  district text,
  published_at timestamptz default now(),
  generated_by text
);

create table if not exists land_saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  district text,
  price_max bigint,
  size_min numeric(10,4),
  land_type text,
  intended_use text,
  notify_whatsapp boolean default true,
  created_at timestamptz default now(),
  last_notified_at timestamptz
);

-- Indexes for common queries
create index if not exists land_listings_district_idx on land_listings(district);
create index if not exists land_listings_verification_idx on land_listings(verification_stage);
create index if not exists land_listings_trust_idx on land_listings(trust_score desc);
create index if not exists land_listings_safelands_idx on land_listings(safelands_id);
create index if not exists land_insights_listing_idx on land_insights(listing_id);
create index if not exists land_payments_status_idx on land_payments(status);
```

- [ ] **Step 2: Run migration in Supabase SQL editor**

Open Supabase dashboard → SQL editor → paste and run `001_land_tables.sql`.

Expected: "Success. No rows returned."

Verify tables exist:
```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_name like 'land_%'
order by table_name;
```
Expected: 6 rows — land_agents, land_content, land_insights, land_listings, land_payments, land_saved_searches

- [ ] **Step 3: Commit migration file**

```bash
git add supabase/migrations/001_land_tables.sql
git commit -m "feat: add land_ tables migration"
```

---

### Task 2: TypeScript types for land_ tables

**Files:**
- Create: `lib/supabase/land-types.ts`
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Create land-types.ts**

```typescript
// lib/supabase/land-types.ts

export type LandType = 'mailo' | 'freehold' | 'leasehold' | 'customary';
export type IntendedUse = 'farming' | 'residential' | 'commercial' | 'mixed';
export type TitleStatus = 'clean' | 'caution' | 'pending' | 'unknown';
export type VerificationStage = 'unverified' | 'submitted' | 'in-review' | 'verified';
export type PaymentMethod = 'mtn' | 'airtel' | 'whatsapp-manual';
export type PaymentStatus = 'pending' | 'paid' | 'expired';
export type ContentType = 'guide' | 'spotlight' | 'seasonal' | 'explainer';

export type LandAgent = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  photo: string | null;
  district: string | null;
  bio: string | null;
  is_verified: boolean;
  response_time_hrs: number | null;
  rating: number | null;
  safelands_agent_id: string | null;
  created_at: string;
};

export type LandListing = {
  id: string;
  title: string;
  district: string;
  parish: string | null;
  lat: number | null;
  lng: number | null;
  size_acres: number | null;
  price_ugx: number | null;
  land_type: LandType | null;
  intended_use: IntendedUse | null;
  title_status: TitleStatus;
  verification_stage: VerificationStage;
  trust_score: number;
  qr_token: string | null;
  agent_id: string | null;
  photos: string[];
  is_featured: boolean;
  safelands_id: string | null;
  created_at: string;
  verified_at: string | null;
  updated_at: string;
  // joined
  agent?: LandAgent | null;
  insight?: LandInsight | null;
};

export type LandInsight = {
  id: string;
  listing_id: string;
  farming_suitability: string | null;
  access_road_quality: string | null;
  nearby_infrastructure: string | null;
  risk_notes: string | null;
  planting_season_fit: string | null;
  generated_at: string;
  model_used: string | null;
};

export type LandPayment = {
  id: string;
  listing_id: string;
  buyer_phone: string;
  amount_ugx: number;
  payment_method: PaymentMethod | null;
  status: PaymentStatus;
  access_expires_at: string | null;
  agent_id: string | null;
  flutterwave_ref: string | null;
  paid_at: string | null;
  created_at: string;
};

export type LandContent = {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  content_type: ContentType | null;
  district: string | null;
  published_at: string;
  generated_by: string | null;
};

export type LandSavedSearch = {
  id: string;
  user_phone: string;
  district: string | null;
  price_max: number | null;
  size_min: number | null;
  land_type: LandType | null;
  intended_use: IntendedUse | null;
  notify_whatsapp: boolean;
  created_at: string;
  last_notified_at: string | null;
};

// Payload type from SafeLands Admin sync call
export type LandSyncPayload = {
  safelands_id: string;
  title: string;
  district: string;
  parish?: string;
  coordinates: { lat: number; lng: number };
  size_acres?: number;
  price_ugx?: number;
  land_type?: LandType;
  intended_use?: IntendedUse;
  title_status?: TitleStatus;
  verification_stage: VerificationStage;
  trust_score?: number;
  photos?: string[];
  agent: {
    safelands_agent_id: string;
    name: string;
    phone: string;
    whatsapp?: string;
    photo?: string;
    district?: string;
    bio?: string;
  };
};
```

- [ ] **Step 2: Re-export from types.ts**

Add to the bottom of `lib/supabase/types.ts`:
```typescript
export type {
  LandType, IntendedUse, TitleStatus, VerificationStage,
  PaymentMethod, PaymentStatus, ContentType,
  LandAgent, LandListing, LandInsight, LandPayment,
  LandContent, LandSavedSearch, LandSyncPayload,
} from './land-types';
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd d:/projects/uganda-business-ideas
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/land-types.ts lib/supabase/types.ts
git commit -m "feat: add land_ TypeScript types"
```

---

### Task 3: Sync logic — upsert listing + agent + QR token

**Files:**
- Create: `lib/land/sync.ts`

- [ ] **Step 1: Create lib/land/sync.ts**

```typescript
// lib/land/sync.ts
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { LandSyncPayload } from '@/lib/supabase/land-types';

function generateQrToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 10; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export type SyncResult = {
  success: boolean;
  listing_id?: string;
  listing_url?: string;
  qr_url?: string;
  error?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://businessyoo.lugandastudio.com';

export async function syncLandListing(payload: LandSyncPayload): Promise<SyncResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  // 1. Upsert agent
  const { data: agent, error: agentError } = await supabase
    .from('land_agents')
    .upsert(
      {
        safelands_agent_id: payload.agent.safelands_agent_id,
        name: payload.agent.name,
        phone: payload.agent.phone,
        whatsapp: payload.agent.whatsapp ?? null,
        photo: payload.agent.photo ?? null,
        district: payload.agent.district ?? null,
        bio: payload.agent.bio ?? null,
        is_verified: true,
      },
      { onConflict: 'safelands_agent_id' }
    )
    .select('id')
    .single();

  if (agentError) return { success: false, error: `Agent upsert failed: ${agentError.message}` };

  // 2. Check if listing already has a qr_token
  const { data: existing } = await supabase
    .from('land_listings')
    .select('qr_token')
    .eq('safelands_id', payload.safelands_id)
    .single();

  const qr_token = existing?.qr_token ?? generateQrToken();

  // 3. Upsert listing
  const { data: listing, error: listingError } = await supabase
    .from('land_listings')
    .upsert(
      {
        safelands_id: payload.safelands_id,
        title: payload.title,
        district: payload.district,
        parish: payload.parish ?? null,
        lat: payload.coordinates.lat,
        lng: payload.coordinates.lng,
        size_acres: payload.size_acres ?? null,
        price_ugx: payload.price_ugx ?? null,
        land_type: payload.land_type ?? null,
        intended_use: payload.intended_use ?? null,
        title_status: payload.title_status ?? 'unknown',
        verification_stage: payload.verification_stage,
        trust_score: payload.trust_score ?? 0,
        qr_token,
        agent_id: agent.id,
        photos: payload.photos ?? [],
        verified_at: payload.verification_stage === 'verified' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'safelands_id' }
    )
    .select('id, qr_token')
    .single();

  if (listingError) return { success: false, error: `Listing upsert failed: ${listingError.message}` };

  return {
    success: true,
    listing_id: listing.id,
    listing_url: `${BASE_URL}/land/browse/${listing.id}`,
    qr_url: `${BASE_URL}/land/verify/${listing.qr_token}`,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/land/sync.ts
git commit -m "feat: add land listing sync logic with QR token generation"
```

---

### Task 4: POST /api/land/sync route

**Files:**
- Create: `app/api/land/sync/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// app/api/land/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { syncLandListing } from '@/lib/land/sync';
import type { LandSyncPayload } from '@/lib/supabase/land-types';

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization');
  const secret = process.env.SYNC_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: LandSyncPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate required fields
  if (!payload.safelands_id || !payload.title || !payload.district || !payload.verification_stage || !payload.agent?.safelands_agent_id) {
    return NextResponse.json(
      { error: 'Missing required fields: safelands_id, title, district, verification_stage, agent.safelands_agent_id' },
      { status: 400 }
    );
  }

  const result = await syncLandListing(payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    listing_url: result.listing_url,
    qr_url: result.qr_url,
  });
}
```

- [ ] **Step 2: Add SYNC_SECRET to .env.local**

```bash
# Add to .env.local (do not commit this file)
SYNC_SECRET=byyoo-sync-secret-change-in-prod
```

- [ ] **Step 3: Test the endpoint locally**

Start dev server: `npm run dev`

Test with curl (in a new terminal):
```bash
curl -X POST http://localhost:3000/api/land/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer byyoo-sync-secret-change-in-prod" \
  -d '{
    "safelands_id": "sl_test_001",
    "title": "2 Acres in Mukono, Seeta",
    "district": "Mukono",
    "parish": "Seeta",
    "coordinates": { "lat": 0.3476, "lng": 32.5825 },
    "size_acres": 2,
    "price_ugx": 45000000,
    "land_type": "mailo",
    "intended_use": "farming",
    "title_status": "clean",
    "verification_stage": "verified",
    "trust_score": 87,
    "photos": [],
    "agent": {
      "safelands_agent_id": "ag_test_001",
      "name": "James Ssekitto",
      "phone": "+256772000000",
      "whatsapp": "+256772000000",
      "district": "Mukono"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "listing_url": "http://localhost:3000/land/browse/<uuid>",
  "qr_url": "http://localhost:3000/land/verify/<10-char-token>"
}
```

- [ ] **Step 4: Verify row in Supabase**

In Supabase SQL editor:
```sql
select id, title, district, trust_score, qr_token, safelands_id
from land_listings where safelands_id = 'sl_test_001';
```
Expected: 1 row with qr_token populated.

```sql
select id, name, safelands_agent_id from land_agents
where safelands_agent_id = 'ag_test_001';
```
Expected: 1 row.

- [ ] **Step 5: Test unauthorized request**

```bash
curl -X POST http://localhost:3000/api/land/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wrong-secret" \
  -d '{}'
```

Expected: `{"error":"Unauthorized"}` with status 401.

- [ ] **Step 6: Commit**

```bash
git add app/api/land/sync/route.ts
git commit -m "feat: add POST /api/land/sync endpoint with bearer auth"
```

---

### Task 5: /apps holding hub page

**Files:**
- Create: `app/apps/page.tsx`

- [ ] **Step 1: Create the /apps page**

```typescript
// app/apps/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Everything on Business Yoo',
  description: 'Explore land, jobs, business ideas, salons, travel, and more — all in one place.',
  robots: { index: false, follow: false }, // internal page — keep off search engines
};

const APPS = [
  {
    href: '/land',
    emoji: '🏞',
    name: 'Find Land',
    tagline: 'Browse verified plots across Uganda',
    color: '#2d6a4f',
    bg: '#f0faf4',
  },
  {
    href: '/ideas',
    emoji: '💡',
    name: 'Business Ideas',
    tagline: '48 curated ideas to start your business',
    color: '#c05621',
    bg: '#fff8f0',
  },
  {
    href: '/businesses',
    emoji: '💼',
    name: 'Find Businesses',
    tagline: 'Discover real businesses across Uganda',
    color: '#374151',
    bg: '#f9fafb',
  },
  {
    href: '/salons',
    emoji: '✂️',
    name: 'Find Salons',
    tagline: 'Book nearby salons via WhatsApp',
    color: '#6b21a8',
    bg: '#faf5ff',
  },
  {
    href: '/travel',
    emoji: '✈️',
    name: 'Explore Uganda',
    tagline: 'Destinations, stays, and local tourism',
    color: '#0e7490',
    bg: '#f0fdff',
  },
  {
    href: '/jobs',
    emoji: '👷',
    name: 'Find Work',
    tagline: 'Browse jobs and post your skills',
    color: '#1a56db',
    bg: '#eff6ff',
  },
];

export default function AppsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Everything on Business Yoo</h1>
          <p className="text-gray-500">Explore land, jobs, business ideas, salons, travel, and more — all in one place.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {APPS.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: app.bg }}
              >
                {app.emoji}
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:underline" style={{ color: app.color }}>
                  {app.name}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{app.tagline}</div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-10 text-center">
          Business Yoo — Uganda&apos;s platform for land, work, business, and opportunity.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify locally**

Open `http://localhost:3000/apps` — should show a clean grid of 6 app cards, each with emoji, name, and tagline. No homepage changes. Each card links to its vertical route.

- [ ] **Step 3: Commit**

```bash
git add app/apps/page.tsx
git commit -m "feat: add /apps holding hub page (internal nav, not linked from homepage)"
```

---

### Task 6: Deploy + add SYNC_SECRET to Vercel

- [ ] **Step 1: Add env vars to Vercel**

In Vercel dashboard → Business Yoo project → Settings → Environment Variables:

Add:
- `SYNC_SECRET` = (generate a strong random string, e.g. 32 chars)
- `NEXT_PUBLIC_SITE_URL` = `https://businessyoo.lugandastudio.com` (if not already set)

- [ ] **Step 2: Push to deploy**

```bash
git push
```

- [ ] **Step 3: Smoke test sync endpoint on production**

```bash
curl -X POST https://uganda-business-ideas.vercel.app/api/land/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-prod-SYNC_SECRET>" \
  -d '{
    "safelands_id": "sl_prod_test_001",
    "title": "1 Acre in Wakiso",
    "district": "Wakiso",
    "coordinates": { "lat": 0.3996, "lng": 32.5781 },
    "verification_stage": "verified",
    "trust_score": 70,
    "agent": {
      "safelands_agent_id": "ag_prod_test_001",
      "name": "Test Agent",
      "phone": "+256700000000"
    }
  }'
```

Expected: `{"success":true,"listing_url":"...","qr_url":"..."}`

- [ ] **Step 4: Check /apps page is live**

Open `https://uganda-business-ideas.vercel.app/apps` — should show all 6 app cards.

- [ ] **Step 5: Commit final notes**

```bash
git commit --allow-empty -m "chore: phase 1 foundation complete — land_ tables, sync API, /apps hub live"
```

---

## Phase 1 Complete ✅

After this plan:
- 6 `land_*` tables live in Supabase
- `POST /api/land/sync` is live and secured
- `/apps` hub is accessible at `/apps`
- SafeLands Admin can call the sync endpoint to push verified listings
- Homepage is untouched

**Next:** [Phase 2 — /land Core UI](2026-05-29-phase2-land-core.md)
