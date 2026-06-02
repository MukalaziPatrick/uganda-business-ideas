# Business Yoo Living Platform — Phase 2: /land Core UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public-facing `/land` vertical — homepage, Mapbox browse page with filter chips and listing grid, listing detail page with trust panel and map layers, and the QR trust certificate page.

**Architecture:** All `/land` pages are server components that fetch from Supabase `land_*` tables. The Mapbox map is a client component. Filter state lives in URL search params (no client state). The listing detail page composes trust panel, map, insight, and WhatsApp CTA from focused sub-components. The QR verify page is fully public — no auth.

**Note on browse layout:** Phase 2 delivers a grid-only listing view. The full Zillow-style map+grid split (map left, cards right, synced) is added in Phase 3 when Mapbox is fully configured — the `LandBrowseHeader` from Phase 5 and the `LandDetailMap` from Phase 3 together complete that split view.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Mapbox GL JS (`mapbox-gl`), Supabase, existing `createSupabaseAdminClient`

**Prerequisite:** Phase 1 complete — `land_*` tables exist in Supabase with at least the test listing seeded.

---

## File Structure

**New files:**
- `lib/land/queries.ts` — Supabase fetch functions (getLandListings, getLandListingById, getLandListingByQr)
- `app/land/page.tsx` — /land homepage
- `app/land/layout.tsx` — shared layout with forest green theme token
- `app/land/browse/page.tsx` — server wrapper, fetches listings
- `app/land/browse/LandBrowseClient.tsx` — client: Mapbox map + filter chips + listing grid
- `app/land/browse/LandListingCard.tsx` — individual listing card
- `app/land/browse/LandFilterChips.tsx` — horizontal scroll filter bar
- `app/land/browse/LandMap.tsx` — Mapbox map client component
- `app/land/browse/[id]/page.tsx` — listing detail server page
- `app/land/browse/[id]/LandTrustPanel.tsx` — trust score + badges + verification stage
- `app/land/browse/[id]/LandDetailMap.tsx` — full map with layer toggles for detail page
- `app/land/verify/[qr]/page.tsx` — QR trust certificate page

---

### Task 1: Supabase query functions

**Files:**
- Create: `lib/land/queries.ts`

- [ ] **Step 1: Create queries.ts**

```typescript
// lib/land/queries.ts
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { LandListing } from '@/lib/supabase/land-types';

export type LandListingFilters = {
  district?: string;
  land_type?: string;
  intended_use?: string;
  price_max?: number;
  size_min?: number;
  verification_stage?: string;
  q?: string;
};

export async function getLandListings(
  filters: LandListingFilters = {},
  limit = 24
): Promise<LandListing[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from('land_listings')
    .select(`
      *,
      agent:land_agents(*),
      insight:land_insights(*)
    `)
    .order('trust_score', { ascending: false })
    .limit(limit);

  if (filters.district) query = query.eq('district', filters.district);
  if (filters.land_type) query = query.eq('land_type', filters.land_type);
  if (filters.intended_use) query = query.eq('intended_use', filters.intended_use);
  if (filters.price_max) query = query.lte('price_ugx', filters.price_max);
  if (filters.size_min) query = query.gte('size_acres', filters.size_min);
  if (filters.verification_stage) query = query.eq('verification_stage', filters.verification_stage);
  if (filters.q) query = query.ilike('title', `%${filters.q}%`);

  const { data, error } = await query;
  if (error) { console.error('getLandListings:', error); return []; }
  return (data ?? []) as LandListing[];
}

export async function getLandListingById(id: string): Promise<LandListing | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('land_listings')
    .select(`*, agent:land_agents(*), insight:land_insights(*)`)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as LandListing;
}

export async function getLandListingByQr(qr_token: string): Promise<LandListing | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('land_listings')
    .select(`*, agent:land_agents(*), insight:land_insights(*)`)
    .eq('qr_token', qr_token)
    .single();

  if (error) return null;
  return data as LandListing;
}

export async function getFeaturedLandListings(limit = 6): Promise<LandListing[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('land_listings')
    .select(`*, agent:land_agents(*), insight:land_insights(*)`)
    .eq('verification_stage', 'verified')
    .order('trust_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as LandListing[];
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/land/queries.ts
git commit -m "feat: add land Supabase query functions"
```

---

### Task 2: Install Mapbox

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install mapbox-gl**

```bash
npm install mapbox-gl
npm install --save-dev @types/mapbox-gl
```

- [ ] **Step 2: Add Mapbox token to .env.local**

```bash
# Add to .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibXVrYWxheml0ZWNoIiwiYSI6...
```

(Get token from mapbox.com → Account → Tokens → Create token with `styles:read` + `tiles:read` scopes)

- [ ] **Step 3: Add CSS import to layout**

In `app/layout.tsx`, add to the imports:
```typescript
import 'mapbox-gl/dist/mapbox-gl.css';
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json app/layout.tsx
git commit -m "feat: install mapbox-gl"
```

---

### Task 3: /land layout and homepage

**Files:**
- Create: `app/land/layout.tsx`
- Create: `app/land/page.tsx`

- [ ] **Step 1: Create app/land/layout.tsx**

```typescript
// app/land/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Find Land in Uganda | Business Yoo', template: '%s | SafeLands UG' },
  description: 'Browse verified plots across Uganda — inspect visually, check the title, and connect with a certified agent.',
};

export default function LandLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ '--sl-green': '#2d6a4f', '--sl-green-light': '#f0faf4' } as React.CSSProperties}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create app/land/page.tsx**

```typescript
// app/land/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getFeaturedLandListings } from '@/lib/land/queries';
import { LandListingCard } from './browse/LandListingCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Discover Land in Uganda | SafeLands UG',
  description: 'Browse verified plots across Uganda — inspect visually, check the title, and connect with a certified agent.',
};

const DISTRICTS = [
  'Kampala','Wakiso','Mukono','Entebbe','Jinja','Mbale',
  'Gulu','Mbarara','Masaka','Lira','Fort Portal','Arua',
];

export default async function LandHomePage() {
  const featured = await getFeaturedLandListings(6);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-[#2d6a4f] text-white py-20 px-4 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Discover land you can trust.
          </h1>
          <p className="text-lg text-green-100 mb-8">
            Browse verified plots across Uganda — inspect visually, check the title, and connect with a certified agent.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/land/browse"
              className="bg-white text-[#2d6a4f] font-semibold px-8 py-3 rounded-full hover:bg-green-50 transition-colors"
            >
              Browse Land
            </Link>
            <Link
              href="/land/ask"
              className="border border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              Ask about land
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#f0faf4] border-b border-green-100 py-4 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-[#2d6a4f] font-medium">
          <span>✅ Surveyor-verified listings</span>
          <span>🗺 Visual land inspection</span>
          <span>📲 WhatsApp agents instantly</span>
        </div>
      </section>

      {/* Browse by district */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by district</h2>
        <div className="flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <Link
              key={d}
              href={`/land/browse?district=${encodeURIComponent(d)}`}
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors"
            >
              {d}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Verified listings</h2>
            <Link href="/land/browse" className="text-sm text-[#2d6a4f] font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((listing) => (
              <LandListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Assisted check CTA */}
      <section className="bg-[#2d6a4f] text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Need expert help?</h2>
        <p className="text-green-100 mb-6">Get a full land check — UGX 10,000 for 24-hour expert access</p>
        <Link
          href="/land/check"
          className="bg-white text-[#2d6a4f] font-semibold px-8 py-3 rounded-full hover:bg-green-50 transition-colors inline-block"
        >
          Request Assisted Check
        </Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Verify locally**

Open `http://localhost:3000/land` — should show hero, trust strip, district chips, featured listings (or empty gracefully), and assisted check CTA.

- [ ] **Step 4: Commit**

```bash
git add app/land/layout.tsx app/land/page.tsx
git commit -m "feat: add /land homepage with hero, district browse, featured listings"
```

---

### Task 4: LandListingCard component

**Files:**
- Create: `app/land/browse/LandListingCard.tsx`

- [ ] **Step 1: Create LandListingCard.tsx**

```typescript
// app/land/browse/LandListingCard.tsx
import Link from 'next/link';
import type { LandListing } from '@/lib/supabase/land-types';

function formatPrice(ugx: number | null): string {
  if (!ugx) return 'Price on request';
  if (ugx >= 1_000_000_000) return `UGX ${(ugx / 1_000_000_000).toFixed(1)}B`;
  if (ugx >= 1_000_000) return `UGX ${(ugx / 1_000_000).toFixed(0)}M`;
  return `UGX ${ugx.toLocaleString()}`;
}

function TrustBadge({ stage, score }: { stage: string; score: number }) {
  if (stage === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-[#2d6a4f]">
        ✅ Surveyor Verified
      </span>
    );
  }
  if (stage === 'in-review') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        🔍 Under Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      ⚠️ Unverified
    </span>
  );
}

export function LandListingCard({ listing }: { listing: LandListing }) {
  const photo = listing.photos?.[0];

  return (
    <Link href={`/land/browse/${listing.id}`} className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {photo ? (
          <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-[#f0faf4]">🏞</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <TrustBadge stage={listing.verification_stage} score={listing.trust_score} />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{listing.title}</h3>
        <p className="text-xs text-gray-500 mb-3">
          {listing.district}{listing.parish ? `, ${listing.parish}` : ''} ·
          {listing.size_acres ? ` ${listing.size_acres} acres` : ''}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#2d6a4f] text-sm">{formatPrice(listing.price_ugx)}</span>
          {listing.agent?.whatsapp && (
            <a
              href={`https://wa.me/${listing.agent.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-green-700 border border-green-200 rounded-full px-3 py-1 hover:bg-green-50 transition-colors"
            >
              📲 WhatsApp
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify locally**

The `/land` homepage should now render listing cards with photo, trust badge, price, and WhatsApp button.

- [ ] **Step 3: Commit**

```bash
git add app/land/browse/LandListingCard.tsx
git commit -m "feat: add LandListingCard component with trust badge and WhatsApp CTA"
```

---

### Task 5: /land/browse — filter chips + server page

**Files:**
- Create: `app/land/browse/LandFilterChips.tsx`
- Create: `app/land/browse/page.tsx`

- [ ] **Step 1: Create LandFilterChips.tsx**

```typescript
// app/land/browse/LandFilterChips.tsx
'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const DISTRICTS = ['Kampala','Wakiso','Mukono','Jinja','Mbale','Gulu','Mbarara','Masaka','Lira'];
const LAND_TYPES = [
  { value: 'mailo', label: 'Mailo' },
  { value: 'freehold', label: 'Freehold' },
  { value: 'leasehold', label: 'Leasehold' },
  { value: 'customary', label: 'Customary' },
];
const USES = [
  { value: 'farming', label: '🌾 Farming' },
  { value: 'residential', label: '🏠 Residential' },
  { value: 'commercial', label: '🏢 Commercial' },
];

export function LandFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeDistrict = searchParams.get('district');
  const activeType = searchParams.get('land_type');
  const activeUse = searchParams.get('intended_use');
  const activeVerified = searchParams.get('verification_stage');

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max px-4">
        {/* Verified filter */}
        <button
          onClick={() => setFilter('verification_stage', 'verified')}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
            activeVerified === 'verified'
              ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#2d6a4f]'
          }`}
        >
          ✅ Verified only
        </button>

        {/* District chips */}
        {DISTRICTS.map((d) => (
          <button
            key={d}
            onClick={() => setFilter('district', d)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              activeDistrict === d
                ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#2d6a4f]'
            }`}
          >
            {d}
          </button>
        ))}

        {/* Type chips */}
        {LAND_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter('land_type', t.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              activeType === t.value
                ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#2d6a4f]'
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* Use chips */}
        {USES.map((u) => (
          <button
            key={u.value}
            onClick={() => setFilter('intended_use', u.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              activeUse === u.value
                ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#2d6a4f]'
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create app/land/browse/page.tsx**

```typescript
// app/land/browse/page.tsx
import type { Metadata } from 'next';
import { getLandListings } from '@/lib/land/queries';
import { LandListingCard } from './LandListingCard';
import { LandFilterChips } from './LandFilterChips';
import Link from 'next/link';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Browse Land in Uganda | SafeLands UG',
};

export default async function LandBrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const listings = await getLandListings({
    district: params.district,
    land_type: params.land_type,
    intended_use: params.intended_use,
    verification_stage: params.verification_stage,
    q: params.q,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/land" className="text-[#2d6a4f] font-bold text-lg">🏞 Land</Link>
          <span className="text-gray-300">|</span>
          <input
            readOnly
            placeholder="Search by district, area, or landmark..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-500 cursor-pointer"
          />
        </div>
        <LandFilterChips />
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">
          {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
          {params.district ? ` in ${params.district}` : ' across Uganda'}
        </p>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">No listings found in this area yet.</h3>
            <p className="text-gray-500 text-sm mb-6">Save your search and we&apos;ll WhatsApp you when something matches.</p>
            <Link
              href="/land/browse"
              className="text-[#2d6a4f] font-medium text-sm hover:underline"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <LandListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify locally**

Open `http://localhost:3000/land/browse` — shows filter chips, listing grid. Click a chip — URL updates, listings filter. No listing → empty state with "Clear filters" link.

- [ ] **Step 4: Commit**

```bash
git add app/land/browse/LandFilterChips.tsx app/land/browse/page.tsx
git commit -m "feat: add /land/browse page with filter chips and listing grid"
```

---

### Task 6: Listing detail page + trust panel

**Files:**
- Create: `app/land/browse/[id]/LandTrustPanel.tsx`
- Create: `app/land/browse/[id]/page.tsx`

- [ ] **Step 1: Create LandTrustPanel.tsx**

```typescript
// app/land/browse/[id]/LandTrustPanel.tsx
import type { LandListing } from '@/lib/supabase/land-types';
import Link from 'next/link';

function TrustBar({ score }: { score: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="bg-[#2d6a4f] h-2 rounded-full transition-all"
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export function LandTrustPanel({ listing }: { listing: LandListing }) {
  const stageBadges: Record<string, { label: string; color: string }> = {
    verified: { label: '✅ Surveyor Verified', color: 'bg-green-100 text-[#2d6a4f]' },
    'in-review': { label: '🔍 Under Review', color: 'bg-yellow-100 text-yellow-700' },
    submitted: { label: '📋 Submitted', color: 'bg-blue-100 text-blue-700' },
    unverified: { label: '⚠️ Unverified', color: 'bg-gray-100 text-gray-500' },
  };
  const badge = stageBadges[listing.verification_stage] ?? stageBadges.unverified;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="font-bold text-gray-900 mb-4">Trust & Verification</h2>

      {/* Stage badge */}
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${badge.color}`}>
        {badge.label}
      </span>

      {/* Trust score */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Trust score</span>
          <span className="font-bold text-[#2d6a4f]">{listing.trust_score}/100</span>
        </div>
        <TrustBar score={listing.trust_score} />
      </div>

      {/* Title status */}
      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-600">Title status</span>
        <span className={`font-medium ${listing.title_status === 'clean' ? 'text-green-700' : 'text-yellow-700'}`}>
          {listing.title_status === 'clean' ? '✅ Clean' :
           listing.title_status === 'caution' ? '⚠️ Caution' :
           listing.title_status === 'pending' ? '⏳ Pending' : '❓ Unknown'}
        </span>
      </div>

      {/* Land type */}
      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-600">Land type</span>
        <span className="font-medium text-gray-900 capitalize">{listing.land_type ?? 'Unknown'}</span>
      </div>

      {/* Intended use */}
      <div className="flex justify-between text-sm mb-5">
        <span className="text-gray-600">Intended use</span>
        <span className="font-medium text-gray-900 capitalize">{listing.intended_use ?? 'Not specified'}</span>
      </div>

      {/* QR cert link */}
      {listing.qr_token && (
        <Link
          href={`/land/verify/${listing.qr_token}`}
          className="block w-full text-center py-2 rounded-xl border border-[#2d6a4f] text-[#2d6a4f] text-sm font-medium hover:bg-[#f0faf4] transition-colors mb-3"
        >
          🔗 View Trust Certificate
        </Link>
      )}

      {/* WhatsApp agent */}
      {listing.agent?.whatsapp && (
        <a
          href={`https://wa.me/${listing.agent.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in: ${listing.title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 rounded-xl bg-[#2d6a4f] text-white font-semibold hover:bg-[#235840] transition-colors"
        >
          📲 WhatsApp Agent
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create app/land/browse/[id]/page.tsx**

```typescript
// app/land/browse/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLandListingById } from '@/lib/land/queries';
import { LandTrustPanel } from './LandTrustPanel';
import Link from 'next/link';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getLandListingById(id);
  if (!listing) return { title: 'Listing not found' };
  return {
    title: `${listing.title} | SafeLands UG`,
    description: `${listing.size_acres ?? ''} acres in ${listing.district}. Trust score: ${listing.trust_score}/100.`,
  };
}

function formatPrice(ugx: number | null): string {
  if (!ugx) return 'Price on request';
  if (ugx >= 1_000_000_000) return `UGX ${(ugx / 1_000_000_000).toFixed(1)}B`;
  if (ugx >= 1_000_000) return `UGX ${(ugx / 1_000_000).toFixed(0)}M`;
  return `UGX ${ugx.toLocaleString()}`;
}

export default async function LandListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getLandListingById(id);
  if (!listing) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link href="/land/browse" className="text-sm text-[#2d6a4f] hover:underline">← Back to listings</Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            {listing.photos?.[0] ? (
              <img src={listing.photos[0]} alt={listing.title} className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-[#f0faf4] flex items-center justify-center text-6xl">🏞</div>
            )}
          </div>

          {/* Title + price */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {listing.title}
            </h1>
            <p className="text-gray-500 text-sm mb-2">
              {listing.district}{listing.parish ? `, ${listing.parish}` : ''}
              {listing.size_acres ? ` · ${listing.size_acres} acres` : ''}
            </p>
            <p className="text-2xl font-bold text-[#2d6a4f]">{formatPrice(listing.price_ugx)}</p>
          </div>

          {/* Map placeholder — Phase 3 adds full Mapbox layers */}
          <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-400 text-sm border border-gray-200">
            🗺 Interactive map coming in Phase 3
            {listing.lat && listing.lng && (
              <span className="ml-2 text-xs text-gray-400">({listing.lat}, {listing.lng})</span>
            )}
          </div>

          {/* AI Insight */}
          {listing.insight && (
            <div className="bg-[#f0faf4] rounded-2xl p-5 border border-green-100">
              <h3 className="font-bold text-[#2d6a4f] mb-3">🤖 Land Intelligence</h3>
              {listing.insight.farming_suitability && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Farming suitability</span>
                  <p className="text-sm text-gray-800 mt-0.5">{listing.insight.farming_suitability}</p>
                </div>
              )}
              {listing.insight.access_road_quality && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Access road</span>
                  <p className="text-sm text-gray-800 mt-0.5">{listing.insight.access_road_quality}</p>
                </div>
              )}
              {listing.insight.risk_notes && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Risk notes</span>
                  <p className="text-sm text-gray-800 mt-0.5">{listing.insight.risk_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Assisted check CTA */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
            <h3 className="font-bold text-gray-900 mb-1">Want expert verification?</h3>
            <p className="text-sm text-gray-500 mb-4">Get a full land check — UGX 10,000 for 24-hour expert access</p>
            <Link
              href={`/land/check?listing=${listing.id}`}
              className="inline-block bg-[#2d6a4f] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#235840] transition-colors"
            >
              Request Assisted Check
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <LandTrustPanel listing={listing} />

          {/* Agent card */}
          {listing.agent && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Listed by</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0faf4] flex items-center justify-center text-lg">👤</div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{listing.agent.name}</p>
                  <p className="text-xs text-gray-500">{listing.agent.district}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify locally**

Open a listing detail page (use the ID from the test listing seeded in Phase 1).
Should show: photo area, title, price, map placeholder, trust panel sidebar, agent card, assisted check CTA. If insight exists, shows land intelligence section.

- [ ] **Step 4: Commit**

```bash
git add app/land/browse/[id]/LandTrustPanel.tsx app/land/browse/[id]/page.tsx
git commit -m "feat: add /land/browse/[id] listing detail page with trust panel"
```

---

### Task 7: QR trust certificate page

**Files:**
- Create: `app/land/verify/[qr]/page.tsx`

- [ ] **Step 1: Create the verify page**

```typescript
// app/land/verify/[qr]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLandListingByQr } from '@/lib/land/queries';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ qr: string }> }): Promise<Metadata> {
  const { qr } = await params;
  const listing = await getLandListingByQr(qr);
  if (!listing) return { title: 'Trust Certificate | SafeLands UG' };
  return {
    title: `Trust Certificate — ${listing.title} | SafeLands UG`,
    description: `Verification status for ${listing.title} in ${listing.district}.`,
  };
}

export default async function LandVerifyPage({
  params,
}: {
  params: Promise<{ qr: string }>;
}) {
  const { qr } = await params;
  const listing = await getLandListingByQr(qr);
  if (!listing) notFound();

  const isVerified = listing.verification_stage === 'verified';

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-8 text-center ${isVerified ? 'bg-[#2d6a4f]' : 'bg-gray-700'}`}>
          <div className="text-5xl mb-3">{isVerified ? '✅' : '⚠️'}</div>
          <h1 className="text-xl font-bold text-white mb-1">
            {isVerified ? 'This listing has been verified.' : 'Verification in progress.'}
          </h1>
          <p className="text-green-100 text-sm">
            {isVerified
              ? 'A certified surveyor has reviewed this property.'
              : 'This property has not yet been fully verified by our surveyor.'}
          </p>
        </div>

        {/* Details */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Property</p>
            <p className="font-semibold text-gray-900">{listing.title}</p>
            <p className="text-sm text-gray-500">{listing.district}{listing.parish ? `, ${listing.parish}` : ''}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Title status</p>
              <p className="font-medium text-sm capitalize">
                {listing.title_status === 'clean' ? '✅ Clean' :
                 listing.title_status === 'caution' ? '⚠️ Caution' :
                 listing.title_status === 'pending' ? '⏳ Pending' : '❓ Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Land type</p>
              <p className="font-medium text-sm capitalize">{listing.land_type ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Size</p>
              <p className="font-medium text-sm">{listing.size_acres ? `${listing.size_acres} acres` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Trust score</p>
              <p className="font-medium text-sm text-[#2d6a4f]">{listing.trust_score}/100</p>
            </div>
          </div>

          {listing.verified_at && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Verified on</p>
              <p className="text-sm text-gray-700">{new Date(listing.verified_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
          <Link
            href={`/land/browse/${listing.id}`}
            className="block w-full text-center py-3 rounded-xl bg-[#2d6a4f] text-white font-semibold text-sm hover:bg-[#235840] transition-colors"
          >
            View Full Listing
          </Link>
          <p className="text-xs text-center text-gray-400">
            Issued by SafeLands UG · Business Yoo · Certificate ID: {listing.qr_token}
          </p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify locally**

Using the `qr_token` from the test listing (check Supabase: `select qr_token from land_listings limit 1`), open:
`http://localhost:3000/land/verify/<qr_token>`

Should show: verification status header (green if verified), property details grid, "View Full Listing" CTA, certificate ID.

Test with invalid token: `http://localhost:3000/land/verify/badtoken123` → should show 404.

- [ ] **Step 3: Commit**

```bash
git add app/land/verify/[qr]/page.tsx
git commit -m "feat: add /land/verify/[qr] trust certificate page"
```

---

### Task 8: Deploy Phase 2

- [ ] **Step 1: Add Mapbox token to Vercel**

Vercel dashboard → Business Yoo → Settings → Environment Variables:
- `NEXT_PUBLIC_MAPBOX_TOKEN` = your Mapbox public token

- [ ] **Step 2: Push**

```bash
git push
```

- [ ] **Step 3: Smoke test all new routes**

- `https://uganda-business-ideas.vercel.app/land` → hero page loads
- `https://uganda-business-ideas.vercel.app/land/browse` → filter chips + listings grid
- `https://uganda-business-ideas.vercel.app/land/browse/<test-listing-id>` → detail page
- `https://uganda-business-ideas.vercel.app/land/verify/<qr-token>` → trust certificate
- `https://uganda-business-ideas.vercel.app/apps` → app hub (from Phase 1)

- [ ] **Step 4: Final commit**

```bash
git commit --allow-empty -m "chore: phase 2 /land core UI complete and deployed"
```

---

## Phase 2 Complete ✅

After this plan:
- `/land` homepage with hero, district browse, featured listings
- `/land/browse` with filter chips and listing grid
- `/land/browse/[id]` full detail page with trust panel
- `/land/verify/[qr]` public trust certificate page
- Map placeholder in place — ready for Mapbox layers in Phase 3
- All pages server-rendered and SEO-ready

**Next:** [Phase 3 — Intelligence: AI assistant, map layers, guides](2026-05-29-phase3-intelligence.md)
