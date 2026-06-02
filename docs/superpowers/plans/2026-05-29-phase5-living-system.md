# Business Yoo Living Platform — Phase 5: Living System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the autonomous living system — n8n content engine (weekly AI guides), planting season alerts (twice yearly), save search + WhatsApp notifications, draw-on-map search, and trust score weekly refresh. After this phase the platform runs itself.

**Architecture:** n8n on Railway handles all scheduled automation. Save search stores a phone number + filter preferences in `land_saved_searches`; a weekly n8n workflow checks for new matching listings and sends WhatsApp alerts. Draw-on-map uses Mapbox's drawing tools to define a polygon that gets passed as a URL parameter and filtered server-side. Trust score refresh is a pure n8n → Supabase RPC call.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Mapbox GL JS + mapbox-gl-draw, n8n on Railway, OpenRouter

**Prerequisite:** All Phases 1–4 complete.

---

## File Structure

**New files:**
- `app/api/land/save-search/route.ts` — POST: save a search with phone number
- `app/api/land/content/route.ts` — POST: receive AI-generated content from n8n, save to land_content
- `app/land/browse/LandDrawSearch.tsx` — Mapbox GL Draw client component for polygon search
- `app/land/browse/LandSaveSearch.tsx` — save search form (phone + current filters)

**Modified files:**
- `app/land/browse/page.tsx` — add polygon filter support from URL params
- `app/land/browse/LandBrowseClient.tsx` → replaced with updated page.tsx (polygon bounds query)
- `lib/land/queries.ts` — add polygon bounds filter to getLandListings

**n8n workflows (configured in Railway n8n UI):**
- Land — Weekly Content Engine
- Land — Planting Season Alerts
- Land — Save Search Notifications
- Land — Trust Score Refresh

---

### Task 1: Save search API + form

**Files:**
- Create: `app/api/land/save-search/route.ts`
- Create: `app/land/browse/LandSaveSearch.tsx`

- [ ] **Step 1: Create save-search API route**

```typescript
// app/api/land/save-search/route.ts
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
```

- [ ] **Step 2: Create LandSaveSearch.tsx**

```typescript
// app/land/browse/LandSaveSearch.tsx
'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function LandSaveSearch() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/land/save-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_phone: phone,
        district: searchParams.get('district'),
        land_type: searchParams.get('land_type'),
        intended_use: searchParams.get('intended_use'),
        price_max: searchParams.get('price_max'),
        size_min: searchParams.get('size_min'),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      setError('Could not save. Try again.');
      return;
    }
    setSaved(true);
    setOpen(false);
  }

  if (saved) {
    return (
      <div className="text-sm text-[#2d6a4f] font-medium px-4 py-2">
        ✅ Search saved — we&apos;ll WhatsApp you when new listings match
      </div>
    );
  }

  return (
    <div className="px-4 mb-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-[#2d6a4f] font-medium hover:underline"
        >
          🔔 Get WhatsApp alerts for new listings here
        </button>
      ) : (
        <form onSubmit={handleSave} className="flex gap-2 items-center">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Your WhatsApp number"
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#2d6a4f]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#2d6a4f] text-white text-sm font-medium px-4 py-2 rounded-full disabled:opacity-50"
          >
            {loading ? '...' : 'Save'}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-gray-400 text-sm">✕</button>
        </form>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Add LandSaveSearch to browse page**

In `app/land/browse/page.tsx`, add import and render it after the results count line:

```typescript
// Add import:
import { LandSaveSearch } from './LandSaveSearch';

// Add after the count <p> tag:
<LandSaveSearch />
```

- [ ] **Step 4: Verify locally**

On `/land/browse`, "Get WhatsApp alerts" link appears. Click it → phone input appears. Enter a number → "Search saved" confirmation. Check Supabase `land_saved_searches` table — row should be inserted.

- [ ] **Step 5: Commit**

```bash
git add app/api/land/save-search/route.ts app/land/browse/LandSaveSearch.tsx app/land/browse/page.tsx
git commit -m "feat: add save search with WhatsApp alert subscription"
```

---

### Task 2: Draw-on-map search

**Files:**
- Create: `app/land/browse/LandDrawSearch.tsx`
- Modify: `app/land/browse/page.tsx`
- Modify: `lib/land/queries.ts`

- [ ] **Step 1: Install mapbox-gl-draw**

```bash
npm install @mapbox/mapbox-gl-draw
npm install --save-dev @types/mapbox__mapbox-gl-draw
```

- [ ] **Step 2: Add polygon bounds filter to getLandListings**

In `lib/land/queries.ts`, update the `LandListingFilters` type and `getLandListings` function:

```typescript
// Add to LandListingFilters type:
export type LandListingFilters = {
  district?: string;
  land_type?: string;
  intended_use?: string;
  price_max?: number;
  size_min?: number;
  verification_stage?: string;
  q?: string;
  // Bounding box from draw-on-map
  bbox?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
};

// Add inside getLandListings, after the existing filters:
if (filters.bbox) {
  query = query
    .gte('lat', filters.bbox.minLat)
    .lte('lat', filters.bbox.maxLat)
    .gte('lng', filters.bbox.minLng)
    .lte('lng', filters.bbox.maxLng);
}
```

- [ ] **Step 3: Create LandDrawSearch.tsx**

```typescript
// app/land/browse/LandDrawSearch.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
// @ts-ignore — no perfect types for this
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export function LandDrawSearch({ onClose }: { onClose: () => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);
  const router = useRouter();
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [32.5825, 1.3], // Uganda center
      zoom: 7,
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: 'draw_polygon',
    });

    map.current.addControl(draw.current);

    map.current.on('draw.create', () => setHasDrawn(true));
    map.current.on('draw.delete', () => setHasDrawn(false));

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  function applySearch() {
    const data = draw.current?.getAll();
    if (!data?.features?.length) return;

    const coords = data.features[0].geometry.coordinates[0] as [number, number][];
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    router.push(`/land/browse?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <p className="font-semibold text-gray-900 text-sm">Draw your search area</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div ref={mapContainer} style={{ height: 400 }} />
        <div className="px-4 py-3 flex gap-3">
          <p className="text-xs text-gray-500 flex-1">Click points on the map to draw a polygon around the area you want to search. Click the first point to close the shape.</p>
          <button
            onClick={applySearch}
            disabled={!hasDrawn}
            className="bg-[#2d6a4f] text-white text-sm font-semibold px-5 py-2 rounded-full disabled:opacity-40"
          >
            Search this area
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add draw search to browse page**

In `app/land/browse/page.tsx`:

```typescript
// Add to searchParams handling (alongside existing filters):
const bboxParams = params.minLat && params.maxLat && params.minLng && params.maxLng
  ? {
      minLat: parseFloat(params.minLat),
      maxLat: parseFloat(params.maxLat),
      minLng: parseFloat(params.minLng),
      maxLng: parseFloat(params.maxLng),
    }
  : undefined;

// Pass to getLandListings:
const listings = await getLandListings({
  district: params.district,
  land_type: params.land_type,
  intended_use: params.intended_use,
  verification_stage: params.verification_stage,
  q: params.q,
  bbox: bboxParams,
});
```

Also add a "Draw search" button to the header area (client-side toggle):

```typescript
// This requires making the search header a client component.
// Add a new file: app/land/browse/LandBrowseHeader.tsx
```

- [ ] **Step 5: Create LandBrowseHeader.tsx**

```typescript
// app/land/browse/LandBrowseHeader.tsx
'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { LandFilterChips } from './LandFilterChips';
import { LandDrawSearch } from './LandDrawSearch';

export function LandBrowseHeader() {
  const [showDraw, setShowDraw] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/land" className="text-[#2d6a4f] font-bold text-lg">🏞 Land</Link>
          <span className="text-gray-300">|</span>
          <input
            readOnly
            placeholder="Search by district, area, or landmark..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-500 cursor-pointer"
          />
          <button
            onClick={() => setShowDraw(true)}
            className="text-xs text-[#2d6a4f] border border-[#2d6a4f] rounded-full px-3 py-2 font-medium hover:bg-[#f0faf4] whitespace-nowrap"
          >
            ✏️ Draw area
          </button>
        </div>
        <Suspense>
          <LandFilterChips />
        </Suspense>
      </div>

      {showDraw && <LandDrawSearch onClose={() => setShowDraw(false)} />}
    </>
  );
}
```

- [ ] **Step 6: Update browse page to use LandBrowseHeader**

In `app/land/browse/page.tsx`, replace the sticky header block with:
```typescript
import { LandBrowseHeader } from './LandBrowseHeader';
// Replace the entire sticky <div> header with:
<LandBrowseHeader />
```

- [ ] **Step 7: Verify locally**

On `/land/browse`, click "Draw area" → full-screen map modal opens. Draw a polygon around Kampala area → click "Search this area" → page reloads with bbox params in URL, listings filtered by bounding box.

- [ ] **Step 8: Commit**

```bash
git add app/land/browse/LandDrawSearch.tsx app/land/browse/LandBrowseHeader.tsx app/land/browse/page.tsx lib/land/queries.ts package.json package-lock.json
git commit -m "feat: add draw-on-map polygon search to /land/browse"
```

---

### Task 3: AI content generation API endpoint

**Files:**
- Create: `app/api/land/content/route.ts`

- [ ] **Step 1: Create the content save endpoint**

```typescript
// app/api/land/content/route.ts
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

  const baseSlug = slugify(title);
  // Ensure slug uniqueness by appending timestamp if needed
  const slug = `${baseSlug}-${Date.now()}`;

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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/land/content/route.ts
git commit -m "feat: add /api/land/content endpoint for n8n content engine"
```

---

### Task 4: n8n — Weekly Content Engine workflow

- [ ] **Step 1: Create workflow "Land — Weekly Content Engine" in n8n**

**Node 1 — Schedule**
- Cron: `0 7 * * 1` (Monday 7 AM EAT = Monday 4 AM UTC)

**Node 2 — Code node (pick content type)**
```javascript
// Rotate content types by week number
const types = ['guide', 'spotlight', 'seasonal', 'explainer'];
const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
const type = types[week % types.length];

const districts = ['Kampala','Wakiso','Mukono','Jinja','Mbale','Gulu','Mbarara'];
const district = type === 'spotlight' ? districts[week % districts.length] : null;

return [{ json: { content_type: type, district } }];
```

**Node 3 — HTTP Request (call OpenRouter)**
- Method: POST
- URL: `https://openrouter.ai/api/v1/chat/completions`
- Headers: `Authorization: Bearer {{$env.OPENROUTER_API_KEY}}`
- Body:
```json
{
  "model": "anthropic/claude-sonnet-4-6",
  "messages": [
    {
      "role": "system",
      "content": "You are a land and property writer for Uganda. Write helpful, plain-language articles for ordinary Ugandans who want to buy land safely. Use simple English. Be practical and specific to Uganda. Return JSON with keys: title (string), body (string, 400-600 words, plain text with paragraph breaks)."
    },
    {
      "role": "user",
      "content": "=Write a {{ $('Code').item.json.content_type }} article{{ $('Code').item.json.district ? ' about ' + $('Code').item.json.district + ' district' : '' }} for SafeLands UG — a Uganda land marketplace. Make it helpful for first-time land buyers."
    }
  ]
}
```

**Node 4 — Code node (parse OpenRouter response)**
```javascript
const content = $input.item.json.choices[0].message.content;
let parsed;
try {
  parsed = JSON.parse(content);
} catch {
  // If not JSON, use as-is
  parsed = { title: 'Land Guide', body: content };
}
return [{ json: { ...parsed, content_type: $('Code').item.json.content_type, district: $('Code').item.json.district } }];
```

**Node 5 — HTTP Request (save to Business Yoo)**
- Method: POST
- URL: `https://uganda-business-ideas.vercel.app/api/land/content`
- Headers: `Authorization: Bearer {{$env.BUSINESS_YOO_SYNC_SECRET}}`
- Body: `={{ { title: $json.title, body: $json.body, content_type: $json.content_type, district: $json.district, generated_by: 'n8n-content-engine' } }}`

- [ ] **Step 2: Activate the workflow**

Toggle to Active in n8n.

- [ ] **Step 3: Test by manually triggering**

Click "Execute" on the workflow in n8n. Check Supabase `land_content` table — new row should appear. Check `https://uganda-business-ideas.vercel.app/land/guides` — new article should show.

---

### Task 5: n8n — Planting Season Alerts workflow

- [ ] **Step 1: Create workflow "Land — Planting Season Alerts" in n8n**

**Node 1 — Schedule**
- Cron: `0 8 15 2 *` (Feb 15 at 8 AM UTC = 11 AM EAT)
- Add second trigger: `0 8 15 8 *` (Aug 15)

**Node 2 — HTTP Request (fetch farming saved searches)**
- Method: GET
- URL: `https://uganda-business-ideas.vercel.app/api/land/saved-searches?intended_use=farming`
- Headers: `Authorization: Bearer {{$env.BUSINESS_YOO_SYNC_SECRET}}`

**Node 3 — HTTP Request (generate seasonal advice via OpenRouter)**
- Method: POST
- URL: `https://openrouter.ai/api/v1/chat/completions`
- Body:
```json
{
  "model": "anthropic/claude-sonnet-4-6",
  "messages": [
    { "role": "user", "content": "Write a short WhatsApp message (2-3 sentences) about the upcoming planting season in Uganda. Include: which crops to plant, when to prepare land, and a tip for buyers looking at farming land. Current month context: {{ new Date().toLocaleString('en', {month: 'long'}) }}." }
  ]
}
```

**Node 4 — Split In Batches (process each saved search)**
- Input from Node 2
- Batch size: 10

**Node 5 — HTTP Request (send WhatsApp to each subscriber)**
- Send the seasonal advice message to `{{ $json.user_phone }}`

**Node 6 — HTTP Request (publish seasonal guide)**
- POST to `/api/land/content` with the full advice as a seasonal article

- [ ] **Step 2: Create /api/land/saved-searches GET endpoint**

```typescript
// app/api/land/saved-searches/route.ts
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
```

- [ ] **Step 3: Commit**

```bash
git add app/api/land/saved-searches/route.ts
git commit -m "feat: add /api/land/saved-searches endpoint for n8n planting alerts"
```

- [ ] **Step 4: Activate planting season workflow in n8n**

Toggle to Active.

---

### Task 6: n8n — Save Search Notifications workflow

- [ ] **Step 1: Create workflow "Land — New Listing Alerts" in n8n**

**Node 1 — Schedule**
- Cron: `0 8 * * 0` (Every Sunday 8 AM EAT = 5 AM UTC)

**Node 2 — HTTP Request (fetch all saved searches)**
- GET `https://uganda-business-ideas.vercel.app/api/land/saved-searches`
- Headers: Bearer BUSINESS_YOO_SYNC_SECRET

**Node 3 — Split In Batches**
- Batch size: 1 (process each saved search individually)

**Node 4 — HTTP Request (find matching new listings)**
- GET `https://uganda-business-ideas.vercel.app/api/land/new-listings?district={{ $json.district }}&land_type={{ $json.land_type }}&since={{ $json.last_notified_at ?? new Date(Date.now() - 7*24*60*60*1000).toISOString() }}`
- Headers: Bearer BUSINESS_YOO_SYNC_SECRET

**Node 5 — IF (only continue if matches found)**
- Condition: `{{ $json.length > 0 }}`

**Node 6 — HTTP Request (send WhatsApp)**
- Message to `{{ $('Split In Batches').item.json.user_phone }}`:
  > "🏞 {{ $json.length }} new land listing(s) match your search{{ $('Split In Batches').item.json.district ? ' in ' + $('Split In Batches').item.json.district : '' }}. View them: https://uganda-business-ideas.vercel.app/land/browse?district={{ $('Split In Batches').item.json.district }}"

**Node 7 — HTTP Request (update last_notified_at)**
- POST `https://uganda-business-ideas.vercel.app/api/land/saved-searches/notify`
- Body: `{ id: {{ $('Split In Batches').item.json.id }} }`

- [ ] **Step 2: Create /api/land/new-listings endpoint**

```typescript
// app/api/land/new-listings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const district = url.searchParams.get('district');
  const land_type = url.searchParams.get('land_type');
  const since = url.searchParams.get('since') ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json([]);

  let query = supabase
    .from('land_listings')
    .select('id, title, district, price_ugx, size_acres')
    .gte('created_at', since)
    .limit(5);

  if (district) query = query.eq('district', district);
  if (land_type) query = query.eq('land_type', land_type);

  const { data } = await query;
  return NextResponse.json(data ?? []);
}
```

- [ ] **Step 3: Create notify endpoint**

```typescript
// app/api/land/saved-searches/notify/route.ts
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
```

- [ ] **Step 4: Commit**

```bash
git add app/api/land/new-listings/route.ts app/api/land/saved-searches/notify/route.ts
git commit -m "feat: add new-listings and saved-searches notify endpoints for n8n alerts"
```

---

### Task 7: n8n — Trust Score Refresh workflow

- [ ] **Step 1: Create SQL function in Supabase**

In Supabase SQL editor:
```sql
create or replace function refresh_land_trust_scores()
returns void as $$
begin
  update land_listings l
  set trust_score = (
    -- verification_stage: 40 points
    case l.verification_stage
      when 'verified' then 40
      when 'in-review' then 20
      when 'submitted' then 10
      else 0
    end
    +
    -- title_status: 30 points
    case l.title_status
      when 'clean' then 30
      when 'caution' then 10
      when 'pending' then 5
      else 0
    end
    +
    -- agent rating: 20 points (0-5 mapped to 0-20)
    coalesce((select cast(a.rating * 4 as integer) from land_agents a where a.id = l.agent_id), 0)
    +
    -- has insight: 10 points
    case when exists (select 1 from land_insights i where i.listing_id = l.id) then 10 else 0 end
  ),
  updated_at = now();
end;
$$ language plpgsql;
```

- [ ] **Step 2: Create workflow "Land — Weekly Trust Score Refresh" in n8n**

**Node 1 — Schedule**
- Cron: `0 0 * * 0` (Sunday midnight UTC = Sunday 3 AM EAT)

**Node 2 — HTTP Request (call Supabase RPC)**
- Method: POST
- URL: `{{ $env.SUPABASE_URL }}/rest/v1/rpc/refresh_land_trust_scores`
- Headers:
  - `apikey: {{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `Authorization: Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `Content-Type: application/json`
- Body: `{}`

- [ ] **Step 3: Add Supabase credentials to n8n Railway env vars**

In Railway → n8n → Variables:
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key

- [ ] **Step 4: Test manually in Supabase**

```sql
select refresh_land_trust_scores();
select id, title, trust_score from land_listings order by trust_score desc;
```

Expected: trust scores calculated based on verification stage, title status, agent rating, and insight presence.

- [ ] **Step 5: Activate trust score workflow in n8n**

Toggle to Active.

---

### Task 8: Final deploy + smoke test all living system components

- [ ] **Step 1: Push all changes**

```bash
git push
```

- [ ] **Step 2: Smoke test all Phase 5 features**

- `https://uganda-business-ideas.vercel.app/land/browse` → "Get WhatsApp alerts" link appears → save a search → check Supabase
- `https://uganda-business-ideas.vercel.app/land/browse` → "Draw area" button → modal opens, can draw polygon
- `https://uganda-business-ideas.vercel.app/land/guides` → articles appear (if content engine has run)
- `https://uganda-business-ideas.vercel.app/api/land/new-listings` (with Bearer header) → returns JSON

- [ ] **Step 3: Verify all 6 n8n workflows are Active**

In n8n dashboard, confirm all workflows show "Active":
1. ✅ Land — Listing Sync
2. ✅ Land — Daily AI Insights
3. ✅ Land — Weekly Content Engine
4. ✅ Land — Planting Season Alerts
5. ✅ Land — New Listing Alerts
6. ✅ Land — Weekly Trust Score Refresh

- [ ] **Step 4: Final commit**

```bash
git commit --allow-empty -m "chore: phase 5 complete — living system fully active. Business Yoo is now a self-updating land intelligence platform."
```

---

## Phase 5 Complete ✅ — Living System Active

After this plan, Business Yoo /land runs itself:

| What runs | When | What it does |
|---|---|---|
| Listing Sync | On verification in SafeLands | Pushes to Supabase, generates QR, WhatsApps agent |
| AI Insights | Daily 6 AM | Refreshes farming/risk/infrastructure notes per listing |
| Content Engine | Every Monday | Publishes one AI-written guide to /land/guides |
| Planting Alerts | Feb 15 + Aug 15 | WhatsApps farming search subscribers + publishes seasonal guide |
| New Listing Alerts | Every Sunday | WhatsApps saved search subscribers with new matching listings |
| Trust Score Refresh | Every Sunday midnight | Recalculates + re-ranks all listings |

**The platform is live. No manual work required after setup.**

---

## Full Implementation Summary

| Phase | What it builds | Key deliverables |
|---|---|---|
| Phase 1 | Foundation | 6 Supabase tables, sync API, /apps hub |
| Phase 2 | /land Core UI | Homepage, browse, detail, QR trust page |
| Phase 3 | Intelligence | Mapbox map layers, AI chat bubble, /land/ask, /land/guides, n8n insights |
| Phase 4 | Commerce | Payment flow, /land/check, /land/agents, payment n8n workflow |
| Phase 5 | Living System | Draw-on-map, save search, content engine, planting alerts, trust refresh |
