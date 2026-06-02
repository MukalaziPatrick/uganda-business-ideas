# Business Yoo Living Platform — Phase 3: Intelligence

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the full Mapbox map with layer toggles to listing detail pages, the AI Land Assistant (chat bubble + /land/ask page), the /land/guides content page, and the n8n workflows for Listing Sync and Daily AI Insights.

**Architecture:** Mapbox map is a `'use client'` component that accepts listing coordinates and renders with layer toggle controls as a bottom sheet. The AI assistant is a streaming chat API route at `/api/land/chat` that injects listing context from Supabase. The `/land/ask` page and the chat bubble both call this same route. n8n workflows are configured in the Railway n8n instance.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Mapbox GL JS, OpenRouter (Claude), n8n on Railway

**Prerequisite:** Phase 2 complete. `/land/browse/[id]` page exists with a map placeholder.

---

## File Structure

**New files:**
- `app/land/browse/[id]/LandDetailMap.tsx` — Mapbox map client component with layer toggles
- `app/api/land/chat/route.ts` — streaming AI chat route
- `app/land/browse/[id]/LandChatBubble.tsx` — floating chat bubble client component
- `app/land/ask/page.tsx` — full /land/ask research chat page
- `app/land/guides/page.tsx` — AI-generated guides listing page
- `app/land/guides/[slug]/page.tsx` — individual guide page

**Modified files:**
- `app/land/browse/[id]/page.tsx` — swap map placeholder for LandDetailMap + add LandChatBubble
- `lib/land/queries.ts` — add getLandContent, getLandContentBySlug

---

### Task 1: Mapbox map with layer toggles

**Files:**
- Create: `app/land/browse/[id]/LandDetailMap.tsx`

- [ ] **Step 1: Create LandDetailMap.tsx**

```typescript
// app/land/browse/[id]/LandDetailMap.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type MapMode = 'clean' | 'explore' | 'full' | 'custom';

type LayerKey = 'roads' | 'boundaries' | 'water' | 'terrain' | 'buildings' | 'places' | 'transport';

const LAYER_LABELS: Record<LayerKey, string> = {
  roads: '🛣 Roads',
  boundaries: '📐 Plot Boundaries',
  water: '💧 Water',
  terrain: '⛰ Terrain',
  buildings: '🏗 3D Buildings',
  places: '🏫 Places',
  transport: '🚌 Transport',
};

const MODE_DEFAULTS: Record<MapMode, LayerKey[]> = {
  clean: [],
  explore: ['roads', 'places'],
  full: ['roads', 'boundaries', 'water', 'terrain', 'places', 'transport'],
  custom: [],
};

export function LandDetailMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mode, setMode] = useState<MapMode>('explore');
  const [customLayers, setCustomLayers] = useState<Set<LayerKey>>(new Set(MODE_DEFAULTS.explore));
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const activeLayers = mode === 'custom' ? customLayers : new Set(MODE_DEFAULTS[mode]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [lng, lat],
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      // Add marker for the listing
      new mapboxgl.Marker({ color: '#2d6a4f' })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setText(title))
        .addTo(map.current!);
    });

    return () => { map.current?.remove(); map.current = null; };
  }, [lat, lng, title]);

  function setMapMode(newMode: MapMode) {
    setMode(newMode);
    if (newMode !== 'custom') {
      setCustomLayers(new Set(MODE_DEFAULTS[newMode]));
    }
  }

  function toggleCustomLayer(layer: LayerKey) {
    setMode('custom');
    setCustomLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer); else next.add(layer);
      return next;
    });
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200" style={{ height: 360 }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Mode selector — top left */}
      <div className="absolute top-3 left-3 flex gap-1 z-10">
        {(['clean', 'explore', 'full'] as MapMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMapMode(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shadow transition-colors ${
              mode === m
                ? 'bg-[#2d6a4f] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Layer toggle button — bottom right */}
      <button
        onClick={() => setShowLayerPanel(!showLayerPanel)}
        className="absolute bottom-3 right-3 z-10 bg-white shadow rounded-full px-3 py-2 text-xs font-medium text-gray-700 flex items-center gap-1 hover:bg-gray-50"
      >
        🗂 Layers {mode === 'custom' && `(${customLayers.size})`}
      </button>

      {/* Layer panel — bottom sheet style */}
      {showLayerPanel && (
        <div className="absolute bottom-12 right-3 z-10 bg-white rounded-2xl shadow-lg border border-gray-200 p-3 min-w-[180px]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Toggle layers</p>
          {(Object.keys(LAYER_LABELS) as LayerKey[]).map((layer) => (
            <label key={layer} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.has(layer)}
                onChange={() => toggleCustomLayer(layer)}
                className="accent-[#2d6a4f]"
              />
              <span className="text-sm text-gray-700">{LAYER_LABELS[layer]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update listing detail page to use LandDetailMap**

In `app/land/browse/[id]/page.tsx`, replace the map placeholder block:
```typescript
// Remove this:
{/* Map placeholder — Phase 3 adds full Mapbox layers */}
<div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-400 text-sm border border-gray-200">
  🗺 Interactive map coming in Phase 3
  {listing.lat && listing.lng && (
    <span className="ml-2 text-xs text-gray-400">({listing.lat}, {listing.lng})</span>
  )}
</div>
```

Replace with:
```typescript
// Add this import at top of file:
import { LandDetailMap } from './LandDetailMap';

// Replace placeholder with:
{listing.lat && listing.lng ? (
  <LandDetailMap lat={listing.lat} lng={listing.lng} title={listing.title} />
) : (
  <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-400 text-sm border border-gray-200">
    🗺 No coordinates for this listing yet
  </div>
)}
```

- [ ] **Step 3: Verify locally**

Open a listing detail page with lat/lng. Map should render satellite view centered on the listing, with a green marker. Mode buttons switch between Clean/Explore/Full. "Layers" button opens a panel with checkboxes.

- [ ] **Step 4: Commit**

```bash
git add app/land/browse/[id]/LandDetailMap.tsx app/land/browse/[id]/page.tsx
git commit -m "feat: add Mapbox map with layer toggles to listing detail page"
```

---

### Task 2: AI chat API route

**Files:**
- Create: `app/api/land/chat/route.ts`

- [ ] **Step 1: Create the streaming chat route**

```typescript
// app/api/land/chat/route.ts
import { NextRequest } from 'next/server';
import { getLandListingById } from '@/lib/land/queries';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;
const MODEL = 'anthropic/claude-sonnet-4-6';

const BASE_SYSTEM = `You are a knowledgeable land guide for SafeLands UG — Uganda's verified land platform. Help buyers understand Ugandan land, titles, farming, and the buying process. Keep answers short, plain, and helpful. Do not use jargon.

Key facts you know:
- Uganda has 4 land tenure types: Mailo (mostly central Uganda, freehold-like), Freehold (full ownership), Leasehold (government lease, 49-99 years), Customary (communal/clan land)
- Title checking: use MLHUD portal (mlhud.go.ug) or UgNLIS app. Look for caveats, mortgages, or disputes.
- Planting seasons: most of Uganda has two rainy seasons — March to May (first season) and September to November (second season). Northern Uganda: April to June.
- Assisted land check costs UGX 10,000 for 24-hour expert access.
- Always recommend WhatsApp-ing the agent for site visits.
- Do not make up listing details you don't have.`;

export async function POST(req: NextRequest) {
  const { messages, listing_id } = await req.json();

  let systemPrompt = BASE_SYSTEM;

  // Inject listing context if provided
  if (listing_id) {
    const listing = await getLandListingById(listing_id);
    if (listing) {
      systemPrompt += `\n\nCurrent listing context:
Title: ${listing.title}
District: ${listing.district}${listing.parish ? `, ${listing.parish}` : ''}
Size: ${listing.size_acres ?? 'unknown'} acres
Price: ${listing.price_ugx ? `UGX ${listing.price_ugx.toLocaleString()}` : 'price on request'}
Land type: ${listing.land_type ?? 'unknown'}
Intended use: ${listing.intended_use ?? 'not specified'}
Title status: ${listing.title_status}
Verification: ${listing.verification_stage}
Trust score: ${listing.trust_score}/100
${listing.insight?.farming_suitability ? `Farming suitability: ${listing.insight.farming_suitability}` : ''}
${listing.insight?.risk_notes ? `Risk notes: ${listing.insight.risk_notes}` : ''}
Agent WhatsApp: ${listing.agent?.whatsapp ?? 'contact via platform'}`;
    }
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'https://businessyoo.lugandastudio.com',
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  // Stream the response directly to the client
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

- [ ] **Step 2: Test the chat route**

```bash
curl -X POST http://localhost:3000/api/land/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is Mailo land?"}]}'
```

Expected: streaming text/event-stream response with Claude explaining Mailo land.

- [ ] **Step 3: Commit**

```bash
git add app/api/land/chat/route.ts
git commit -m "feat: add streaming AI land chat API route with listing context injection"
```

---

### Task 3: Chat bubble on listing pages

**Files:**
- Create: `app/land/browse/[id]/LandChatBubble.tsx`
- Modify: `app/land/browse/[id]/page.tsx`

- [ ] **Step 1: Create LandChatBubble.tsx**

```typescript
// app/land/browse/[id]/LandChatBubble.tsx
'use client';
import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export function LandChatBubble({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi — ask me anything about this land or about buying land in Uganda." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const allMessages = [...messages, userMsg];
    const res = await fetch('/api/land/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: allMessages, listing_id: listingId }),
    });

    if (!res.body) { setLoading(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = '';

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const json = line.replace('data: ', '').trim();
        if (json === '[DONE]') continue;
        try {
          const parsed = JSON.parse(json);
          const delta = parsed.choices?.[0]?.delta?.content ?? '';
          assistantContent += delta;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
            return updated;
          });
        } catch {}
      }
    }
    setLoading(false);
  }

  return (
    <>
      {/* Bubble button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#2d6a4f] text-white shadow-lg flex items-center justify-center text-2xl hover:bg-[#235840] transition-colors"
        aria-label="Ask about this land"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: '60vh' }}>
          {/* Header */}
          <div className="bg-[#2d6a4f] text-white px-4 py-3">
            <p className="font-semibold text-sm">🏞 Land Assistant</p>
            <p className="text-xs text-green-100">Ask about this land</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#2d6a4f] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.content || (loading && msg.role === 'assistant' ? '...' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:border-[#2d6a4f]"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-[#2d6a4f] text-white rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Add LandChatBubble to listing detail page**

In `app/land/browse/[id]/page.tsx`, add import and render at the bottom of the `<main>` element:

```typescript
// Add import:
import { LandChatBubble } from './LandChatBubble';

// Add before closing </main>:
<LandChatBubble listingId={listing.id} />
```

- [ ] **Step 3: Verify locally**

Open a listing detail page. Green chat bubble appears bottom-right. Click it — chat panel opens with greeting. Type "Is this good for farming?" → streaming response from Claude with listing context.

- [ ] **Step 4: Commit**

```bash
git add app/land/browse/[id]/LandChatBubble.tsx app/land/browse/[id]/page.tsx
git commit -m "feat: add AI chat bubble to listing detail pages with listing context"
```

---

### Task 4: /land/ask full research page

**Files:**
- Create: `app/land/ask/page.tsx`

- [ ] **Step 1: Create app/land/ask/page.tsx**

```typescript
// app/land/ask/page.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTED = [
  "How do I check if land has a clean title?",
  "What's the difference between Mailo and Freehold?",
  "When is the best time to buy land for farming?",
  "How does an assisted land check work?",
  "Which districts have the cheapest land?",
];

export default function LandAskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const allMessages = [...messages, userMsg];
    const res = await fetch('/api/land/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!res.body) { setLoading(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const json = line.replace('data: ', '').trim();
        if (json === '[DONE]') continue;
        try {
          const parsed = JSON.parse(json);
          const delta = parsed.choices?.[0]?.delta?.content ?? '';
          assistantContent += delta;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
            return updated;
          });
        } catch {}
      }
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#2d6a4f] text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/land" className="text-green-200 text-sm hover:underline">← Back to Land</Link>
          <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ask about land in Uganda
          </h1>
          <p className="text-green-100 text-sm mt-1">
            Get plain-language answers about titles, districts, farming, and buying safely.
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">Suggested questions:</p>
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="block w-full text-left px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#2d6a4f] text-white'
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              {msg.content || (loading && msg.role === 'assistant' ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — sticky bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything about land in Uganda..."
            className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:border-[#2d6a4f]"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-[#2d6a4f] text-white rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 flex-shrink-0"
          >
            ↑
          </button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify locally**

Open `http://localhost:3000/land/ask` — shows suggested questions. Click one → answer streams in. Type a custom question → responds. No listing context (general Uganda land knowledge).

- [ ] **Step 3: Commit**

```bash
git add app/land/ask/page.tsx
git commit -m "feat: add /land/ask full AI research chat page"
```

---

### Task 5: /land/guides pages

**Files:**
- Modify: `lib/land/queries.ts`
- Create: `app/land/guides/page.tsx`
- Create: `app/land/guides/[slug]/page.tsx`

- [ ] **Step 1: Add content queries to lib/land/queries.ts**

Add to the bottom of `lib/land/queries.ts`:
```typescript
import type { LandContent } from '@/lib/supabase/land-types';

export async function getLandContent(limit = 12): Promise<LandContent[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('land_content')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as LandContent[];
}

export async function getLandContentBySlug(slug: string): Promise<LandContent | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('land_content')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data as LandContent;
}
```

- [ ] **Step 2: Create app/land/guides/page.tsx**

```typescript
// app/land/guides/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLandContent } from '@/lib/land/queries';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Land Guides & Articles | SafeLands UG',
  description: 'Guides on buying land in Uganda — title checking, planting seasons, district spotlights, and more.',
};

const TYPE_LABELS: Record<string, string> = {
  guide: '📖 Guide',
  spotlight: '📍 District Spotlight',
  seasonal: '🌱 Seasonal',
  explainer: '💡 Explainer',
};

export default async function LandGuidesPage() {
  const articles = await getLandContent(12);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#2d6a4f] text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Land Guides
          </h1>
          <p className="text-green-100">Everything you need to know about buying land safely in Uganda.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Guides are being generated. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/land/guides/${article.slug}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow block"
              >
                <span className="text-xs font-medium text-gray-500 mb-2 block">
                  {TYPE_LABELS[article.content_type ?? ''] ?? '📄 Article'}
                  {article.district ? ` · ${article.district}` : ''}
                </span>
                <h2 className="font-semibold text-gray-900 text-sm leading-snug">{article.title}</h2>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(article.published_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Create app/land/guides/[slug]/page.tsx**

```typescript
// app/land/guides/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLandContentBySlug } from '@/lib/land/queries';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getLandContentBySlug(slug);
  if (!article) return { title: 'Article not found' };
  return { title: `${article.title} | SafeLands UG` };
}

export default async function LandGuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getLandContentBySlug(slug);
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/land/guides" className="text-sm text-[#2d6a4f] hover:underline">← All Guides</Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {article.title}
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          {new Date(article.published_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}
          {article.district ? ` · ${article.district}` : ''}
        </p>

        {/* Render markdown as plain text — upgrade to remark in a future iteration */}
        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
          {article.body}
        </div>

        <div className="mt-12 p-6 bg-[#f0faf4] rounded-2xl border border-green-100 text-center">
          <p className="font-semibold text-[#2d6a4f] mb-2">Ready to find land?</p>
          <Link
            href="/land/browse"
            className="inline-block bg-[#2d6a4f] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#235840] transition-colors text-sm"
          >
            Browse Verified Listings
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Seed a test guide in Supabase to verify**

In Supabase SQL editor:
```sql
insert into land_content (title, slug, body, content_type, published_at)
values (
  'How to Check Land Title in Uganda',
  'how-to-check-land-title-uganda',
  'Checking land title in Uganda protects you from fraud and disputes. Here are the steps:

1. Visit the Ministry of Lands website (mlhud.go.ug) or download the UgNLIS app.
2. Search by plot number, block, or owner name.
3. Look for caveats, mortgages, or court orders on the title.
4. Verify the owner name matches who is selling the land.
5. If unsure, request an Assisted Land Check through SafeLands UG — UGX 10,000 for 24-hour expert access.',
  'guide',
  now()
);
```

- [ ] **Step 5: Verify locally**

- `http://localhost:3000/land/guides` → shows article card
- `http://localhost:3000/land/guides/how-to-check-land-title-uganda` → shows full article with CTA

- [ ] **Step 6: Commit**

```bash
git add lib/land/queries.ts app/land/guides/page.tsx app/land/guides/[slug]/page.tsx
git commit -m "feat: add /land/guides pages for AI-generated articles"
```

---

### Task 6: n8n — Listing Sync workflow

This task configures the n8n workflow on Railway. No code files — steps are done in the n8n UI.

- [ ] **Step 1: Open n8n Railway instance**

Navigate to `https://n8n-production-c3c3.up.railway.app`

- [ ] **Step 2: Create workflow "Land — Listing Sync"**

Add nodes in this order:

**Node 1 — Webhook (trigger)**
- Type: Webhook
- Method: POST
- Path: `/land-listing-sync`
- Authentication: Header Auth → header name `x-n8n-secret`, value = set an N8N_LAND_SYNC_SECRET env var in Railway

**Node 2 — HTTP Request (call Business Yoo sync API)**
- Method: POST
- URL: `https://uganda-business-ideas.vercel.app/api/land/sync`
- Headers: `Authorization: Bearer {{$env.BUSINESS_YOO_SYNC_SECRET}}`
- Body: `={{ $json.body }}` (forward the webhook payload)

**Node 3 — HTTP Request (WhatsApp to agent via WhatsApp Cloud API or manual)**
- Method: POST
- URL: WhatsApp Business API send message endpoint
- Body: message to `{{ $json.body.agent.whatsapp }}` — "Your listing '{{ $json.body.title }}' is now live on Business Yoo. View it at {{ $node["HTTP Request"].json.listing_url }}"

- [ ] **Step 3: Add env vars to Railway n8n**

In Railway → n8n service → Variables:
- `BUSINESS_YOO_SYNC_SECRET` = same value as `SYNC_SECRET` in Vercel
- `N8N_LAND_SYNC_SECRET` = a new secret for securing the n8n webhook

- [ ] **Step 4: Update SafeLands Admin to call the n8n webhook on verification**

In SafeLands Admin codebase (`d:/projects/smart-surveyor`), when a listing is marked verified, add a fetch call:

```typescript
// In SafeLands Admin — wherever verification_stage is set to 'verified'
// Add after saving to Neon DB:
if (process.env.N8N_LAND_SYNC_WEBHOOK) {
  await fetch(process.env.N8N_LAND_SYNC_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-n8n-secret': process.env.N8N_LAND_SYNC_SECRET ?? '',
    },
    body: JSON.stringify({
      safelands_id: listing.id,
      title: listing.title,
      district: listing.district,
      // ... all other fields from LandSyncPayload
    }),
  }).catch(console.error); // non-blocking
}
```

Add to SafeLands Admin `.env`:
```
N8N_LAND_SYNC_WEBHOOK=https://n8n-production-c3c3.up.railway.app/webhook/land-listing-sync
N8N_LAND_SYNC_SECRET=<same as N8N_LAND_SYNC_SECRET in Railway>
```

- [ ] **Step 5: Test end-to-end**

Manually trigger the n8n webhook:
```bash
curl -X POST https://n8n-production-c3c3.up.railway.app/webhook/land-listing-sync \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: <N8N_LAND_SYNC_SECRET>" \
  -d '{
    "safelands_id": "sl_n8n_test_001",
    "title": "3 Acres in Wakiso via n8n",
    "district": "Wakiso",
    "coordinates": { "lat": 0.39, "lng": 32.57 },
    "verification_stage": "verified",
    "trust_score": 80,
    "agent": {
      "safelands_agent_id": "ag_n8n_001",
      "name": "n8n Test Agent",
      "phone": "+256700000000"
    }
  }'
```

Expected: listing appears in Supabase `land_listings` table.

- [ ] **Step 6: Commit SafeLands Admin changes**

```bash
cd d:/projects/smart-surveyor
git add -A
git commit -m "feat: trigger n8n land sync webhook on listing verification"
git push
```

---

### Task 7: n8n — Daily AI Insights workflow

- [ ] **Step 1: Create workflow "Land — Daily AI Insights" in n8n**

**Node 1 — Schedule (trigger)**
- Type: Schedule
- Cron: `0 6 * * *` (6:00 AM EAT = 3:00 AM UTC)

**Node 2 — HTTP Request (fetch stale listings)**
- Method: GET
- URL: `https://uganda-business-ideas.vercel.app/api/land/insights-needed`
- Headers: `Authorization: Bearer {{$env.BUSINESS_YOO_SYNC_SECRET}}`

**Node 3 — Split In Batches**
- Batch size: 5 (to avoid rate limits)

**Node 4 — HTTP Request (call OpenRouter for each listing)**
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
      "content": "You are a land intelligence analyst for Uganda. Given land details, write short (1-2 sentences each) assessments for: farming suitability, access road quality, nearby infrastructure, risk notes, and planting season fit. Be specific to Uganda. Return JSON with keys: farming_suitability, access_road_quality, nearby_infrastructure, risk_notes, planting_season_fit."
    },
    {
      "role": "user",
      "content": "=Title: {{$json.title}}\nDistrict: {{$json.district}}\nParish: {{$json.parish}}\nSize: {{$json.size_acres}} acres\nLand type: {{$json.land_type}}\nIntended use: {{$json.intended_use}}"
    }
  ]
}
```

**Node 5 — HTTP Request (save insight to Business Yoo)**
- Method: POST
- URL: `https://uganda-business-ideas.vercel.app/api/land/insights`
- Headers: `Authorization: Bearer {{$env.BUSINESS_YOO_SYNC_SECRET}}`
- Body: `{ listing_id: {{$('Split In Batches').item.json.id}}, ...parsed insight }`

- [ ] **Step 2: Create the /api/land/insights-needed endpoint**

```typescript
// app/api/land/insights-needed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json([]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Listings with no insight OR insight older than 7 days
  const { data } = await supabase
    .from('land_listings')
    .select('id, title, district, parish, size_acres, land_type, intended_use')
    .or(`id.not.in.(select listing_id from land_insights),id.in.(select listing_id from land_insights where generated_at < '${sevenDaysAgo}')`)
    .limit(20);

  return NextResponse.json(data ?? []);
}
```

- [ ] **Step 3: Create the /api/land/insights save endpoint**

```typescript
// app/api/land/insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const { error } = await supabase.from('land_insights').upsert(
    {
      listing_id: body.listing_id,
      farming_suitability: body.farming_suitability,
      access_road_quality: body.access_road_quality,
      nearby_infrastructure: body.nearby_infrastructure,
      risk_notes: body.risk_notes,
      planting_season_fit: body.planting_season_fit,
      generated_at: new Date().toISOString(),
      model_used: 'anthropic/claude-sonnet-4-6',
    },
    { onConflict: 'listing_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Commit new API routes**

```bash
git add app/api/land/insights-needed/route.ts app/api/land/insights/route.ts
git commit -m "feat: add /api/land/insights-needed and /api/land/insights endpoints for n8n workflow"
```

---

### Task 8: Deploy Phase 3

- [ ] **Step 1: Push all changes**

```bash
git push
```

- [ ] **Step 2: Smoke test new routes**

- `https://uganda-business-ideas.vercel.app/land/ask` → chat page loads, suggested questions appear
- `https://uganda-business-ideas.vercel.app/land/guides` → guides page loads
- `https://uganda-business-ideas.vercel.app/land/browse/<id>` → map renders with Mapbox, chat bubble visible
- `https://uganda-business-ideas.vercel.app/api/land/insights-needed` (with Bearer header) → returns JSON array

- [ ] **Step 3: Activate n8n workflows**

In n8n: toggle both workflows to Active.

- [ ] **Step 4: Final commit**

```bash
git commit --allow-empty -m "chore: phase 3 intelligence complete — map layers, AI chat, guides, n8n workflows active"
```

---

## Phase 3 Complete ✅

After this plan:
- Full Mapbox map with Clean/Explore/Full modes + layer toggle panel on every listing
- AI chat bubble on listing pages — streams responses with listing context
- `/land/ask` full research page with suggested questions
- `/land/guides` + `/land/guides/[slug]` for AI-generated articles
- n8n: Listing Sync workflow live (SafeLands → Supabase)
- n8n: Daily AI Insights workflow live (generates farming/risk/infrastructure notes per listing)

**Next:** [Phase 4 — Commerce: payments, /land/check, /land/agents](2026-05-29-phase4-commerce.md)
