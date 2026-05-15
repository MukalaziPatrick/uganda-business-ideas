# Business Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a business directory to `ugandabusinessideas.com` — search, region filter, public profiles, registration form, and admin approval.

**Architecture:** New `businesses` Supabase table with RLS. Three new pages (`/businesses`, `/businesses/[id]`, `/businesses/register`) built as server + client components following the same pattern as `/jobs`. Admin approval tab added to `/admin`. Homepage pillar updated to link to `/businesses`.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, Supabase JS v2, TypeScript, React Server Components + Client Components.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/202605150001_businesses.sql` | Create | DB table + indexes + RLS policies + increment RPC |
| `lib/supabase/types.ts` | Modify | Add `Business`, `BusinessInsert`, `BusinessStatus` types |
| `app/data/businesses.ts` | Create | Constants: categories, regions, districts-by-region |
| `components/UgandaBusinessMap.tsx` | Create | SVG Uganda region map component (clickable 4 regions) |
| `app/businesses/page.tsx` | Create | Server component — fetch active businesses, render `BusinessesClient` |
| `app/businesses/BusinessesClient.tsx` | Create | Client — search, region filter, category filter, results grid, load more |
| `app/businesses/[id]/page.tsx` | Create | Server component — fetch business by id, profile display |
| `app/businesses/register/page.tsx` | Create | Thin shell — renders `BusinessRegisterForm` |
| `app/businesses/register/BusinessRegisterForm.tsx` | Create | Client form — controlled inputs, validation, Supabase insert |
| `app/admin/businesses/page.tsx` | Create | Server component — pending businesses table with approve/reject actions |
| `app/HomeClient.tsx` | Modify | Add "Find a Business" pillar card with inline search |

---

## Task 1: Database migration

**Files:**
- Create: `supabase/migrations/202605150001_businesses.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/202605150001_businesses.sql

create table public.businesses (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         text not null,
  region           text not null check (region in ('Central','Eastern','Northern','Western')),
  district         text not null,
  town             text,
  description      text check (char_length(description) <= 300),
  hours            text,
  whatsapp         text,
  phone            text,
  website          text,
  facebook         text,
  instagram        text,
  tiktok           text,
  view_count       integer not null default 0,
  whatsapp_clicks  integer not null default 0,
  contact_clicks   integer not null default 0,
  status           text not null default 'pending'
                   check (status in ('pending','active','rejected')),
  created_at       timestamptz not null default now()
);

create index businesses_status_idx   on public.businesses(status);
create index businesses_region_idx   on public.businesses(region);
create index businesses_category_idx on public.businesses(category);
create index businesses_district_idx on public.businesses(district);
create index businesses_created_idx  on public.businesses(created_at desc);

-- RLS
alter table public.businesses enable row level security;

-- Anyone can read active listings
drop policy if exists "Public can read active businesses" on public.businesses;
create policy "Public can read active businesses"
  on public.businesses for select
  using (status = 'active');

-- Anyone can submit a listing
drop policy if exists "Public can insert businesses" on public.businesses;
create policy "Public can insert businesses"
  on public.businesses for insert
  with check (true);

-- Admins can do everything
drop policy if exists "Admins can manage businesses" on public.businesses;
create policy "Admins can manage businesses"
  on public.businesses for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- RPC to increment signal columns safely (no RLS bypass needed)
create or replace function public.increment_business_signal(
  business_id uuid,
  signal_col  text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if signal_col = 'view_count' then
    update public.businesses set view_count = view_count + 1 where id = business_id;
  elsif signal_col = 'whatsapp_clicks' then
    update public.businesses set whatsapp_clicks = whatsapp_clicks + 1 where id = business_id;
  elsif signal_col = 'contact_clicks' then
    update public.businesses set contact_clicks = contact_clicks + 1 where id = business_id;
  end if;
end;
$$;
```

- [ ] **Step 2: Apply the migration via Supabase MCP or CLI**

If using Supabase MCP:
```
Use mcp__claude_ai_Supabase__apply_migration with the SQL above
```

If using CLI locally:
```bash
supabase db push
```

Expected: migration applies without errors. Table `businesses` visible in Supabase dashboard.

- [ ] **Step 3: Verify in Supabase dashboard**

Open Supabase → Table Editor → confirm `businesses` table exists with all columns.
Open Supabase → Authentication → Policies → confirm 3 policies on `businesses`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/202605150001_businesses.sql
git commit -m "feat: businesses table with RLS and signal increment RPC"
```

---

## Task 2: Types and constants

**Files:**
- Modify: `lib/supabase/types.ts`
- Create: `app/data/businesses.ts`

- [ ] **Step 1: Add types to `lib/supabase/types.ts`**

Append to the existing file:

```ts
export type BusinessStatus = "pending" | "active" | "rejected";

export type Business = {
  id: string;
  name: string;
  category: string;
  region: "Central" | "Eastern" | "Northern" | "Western";
  district: string;
  town: string | null;
  description: string | null;
  hours: string | null;
  whatsapp: string | null;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  view_count: number;
  whatsapp_clicks: number;
  contact_clicks: number;
  status: BusinessStatus;
  created_at: string;
};

export type BusinessInsert = {
  name: string;
  category: string;
  region: "Central" | "Eastern" | "Northern" | "Western";
  district: string;
  town?: string;
  description?: string;
  hours?: string;
  whatsapp?: string;
  phone?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
};
```

- [ ] **Step 2: Create `app/data/businesses.ts`**

```ts
export type UgandaRegion = "Central" | "Eastern" | "Northern" | "Western";

export const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Street Food",
  "Salon & Barbershop",
  "Plumber",
  "Electrician",
  "Retail Shop",
  "Agriculture & Farming",
  "Transport & Boda",
  "Health & Pharmacy",
  "Education & Tutoring",
  "Hotel & Accommodation",
  "Other",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const UGANDA_REGIONS: UgandaRegion[] = [
  "Central",
  "Eastern",
  "Northern",
  "Western",
];

export const DISTRICTS_BY_REGION: Record<UgandaRegion, string[]> = {
  Central: [
    "Kampala", "Wakiso", "Mukono", "Luwero", "Masaka", "Kalangala",
    "Kiboga", "Mubende", "Mityana", "Nakaseke", "Nakasongola", "Buikwe",
    "Buvuma", "Gomba", "Kalungu", "Kyankwanzi", "Lwengo", "Lyantonde",
    "Mpigi", "Rakai", "Sembabule",
  ],
  Eastern: [
    "Jinja", "Mbale", "Tororo", "Iganga", "Soroti", "Kumi", "Kapchorwa",
    "Pallisa", "Kamuli", "Bugiri", "Mayuge", "Sironko", "Busia",
    "Budaka", "Bududa", "Bukedea", "Butaleja", "Buyende", "Kaliro",
    "Kibuku", "Luuka", "Manafwa", "Namayingo", "Namutumba", "Ngora",
    "Serere", "Butebo", "Namisindwa",
  ],
  Northern: [
    "Gulu", "Lira", "Arua", "Kitgum", "Apac", "Moroto", "Kotido",
    "Nebbi", "Adjumani", "Moyo", "Pader", "Amuria", "Nakapiripirit",
    "Abim", "Amolatar", "Amuru", "Dokolo", "Kaabong", "Koboko",
    "Maracha", "Oyam", "Agago", "Alebtong", "Amudat", "Kole",
    "Lamwo", "Napak", "Nwoya", "Otuke", "Zombo",
  ],
  Western: [
    "Mbarara", "Kabale", "Kasese", "Fort Portal", "Bushenyi", "Hoima",
    "Masindi", "Rukungiri", "Ntungamo", "Kibaale", "Kyenjojo", "Kamwenge",
    "Kabarole", "Kanungu", "Kiruhura", "Isingiro", "Kiryandongo",
    "Buliisa", "Buhweju", "Ibanda", "Kagadi", "Kakumiro", "Mitooma",
    "Rubanda", "Rubirizi", "Rwampara", "Sheema",
  ],
};

export function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "Restaurant": "🍽️",
    "Street Food": "🌯",
    "Salon & Barbershop": "💇",
    "Plumber": "🔧",
    "Electrician": "⚡",
    "Retail Shop": "🛒",
    "Agriculture & Farming": "🌾",
    "Transport & Boda": "🏍️",
    "Health & Pharmacy": "💊",
    "Education & Tutoring": "📚",
    "Hotel & Accommodation": "🏨",
    "Other": "💼",
  };
  return map[category] ?? "💼";
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/types.ts app/data/businesses.ts
git commit -m "feat: business types and constants"
```

---

## Task 3: Uganda region map component

**Files:**
- Create: `components/UgandaBusinessMap.tsx`

This component renders a clickable SVG Uganda map split into 4 regions. On mobile (< 360px) it falls back to chips. The SVG uses simplified but geographically proportioned paths — implementation should replace polygon approximations with real GeoJSON-derived paths once available (use the `public/uganda-regions.geojson` file if added, otherwise the simplified version below is acceptable for launch).

- [ ] **Step 1: Create `components/UgandaBusinessMap.tsx`**

```tsx
"use client";

import type { UgandaRegion } from "@/app/data/businesses";
import { UGANDA_REGIONS } from "@/app/data/businesses";

type Props = {
  activeRegion: "All" | UgandaRegion;
  onRegionClick: (region: "All" | UgandaRegion) => void;
  businessCounts?: Partial<Record<UgandaRegion, number>>;
};

const REGION_COLORS: Record<UgandaRegion, string> = {
  Central:  "#F5C842",
  Eastern:  "#3d7a58",
  Northern: "#4d9a6e",
  Western:  "#2D5A40",
};

const REGION_TEXT_COLORS: Record<UgandaRegion, string> = {
  Central:  "#1C3A2A",
  Eastern:  "#ffffff",
  Northern: "#ffffff",
  Western:  "#ffffff",
};

const ACTIVE_STROKE = "#1C3A2A";
const INACTIVE_OPACITY = "0.45";

// Simplified Uganda region paths — proportioned to real geography
// viewBox: 0 0 500 520
const REGION_PATHS: Record<UgandaRegion, { d: string; labelX: number; labelY: number }> = {
  Northern: {
    d: "M95,32 C110,25 145,20 185,18 L255,17 C295,17 335,19 365,24 C385,27 405,33 418,42 C428,49 432,58 430,68 L425,95 C422,108 415,120 405,130 C395,140 382,148 368,153 L340,162 C320,168 298,172 278,173 L248,174 C228,174 208,172 190,167 L165,159 C148,153 133,144 122,133 C110,121 103,107 100,93 L94,65 C92,53 93,41 95,32 Z",
    labelX: 262, labelY: 105,
  },
  Eastern: {
    d: "M340,162 L368,153 C382,148 395,140 405,130 C415,120 422,108 425,95 L430,68 C432,58 442,52 455,58 C468,65 478,80 482,98 L485,130 C486,150 482,175 474,198 L462,228 C450,255 434,278 415,295 C398,310 378,320 357,326 L332,330 C316,332 300,330 286,322 L272,310 C260,298 253,282 252,265 L252,240 C252,222 258,205 268,192 L285,178 C305,170 322,165 340,162 Z",
    labelX: 385, labelY: 245,
  },
  Central: {
    d: "M190,167 L208,172 L228,174 L248,174 L278,173 L298,172 L320,168 L340,162 C322,165 305,170 285,178 L268,192 C258,205 252,222 252,240 L252,265 C253,282 260,298 272,310 L286,322 C300,330 316,332 332,330 L340,338 C325,355 305,368 282,374 L255,378 C232,378 210,370 194,356 L178,340 C165,325 158,306 158,287 L158,260 C158,240 164,222 175,207 L185,190 C187,182 188,175 190,167 Z",
    labelX: 245, labelY: 278,
  },
  Western: {
    d: "M90,130 L120,140 L160,148 L200,155 L190,167 C188,175 187,182 185,190 L175,207 C164,222 158,240 158,260 L158,287 C158,306 165,325 178,340 L194,356 C178,362 158,362 140,355 L115,342 C92,328 72,308 60,284 L50,258 C42,235 40,208 44,182 L52,155 C60,128 74,105 92,86 L95,32 C93,41 92,53 94,65 L100,93 C103,107 110,121 122,133 Z",
    labelX: 108, labelY: 272,
  },
};

export default function UgandaBusinessMap({ activeRegion, onRegionClick, businessCounts }: Props) {
  const handleClick = (region: UgandaRegion) => {
    onRegionClick(activeRegion === region ? "All" : region);
  };

  return (
    <div className="w-full">
      {/* SVG map — hidden on very small screens */}
      <div className="hidden min-[360px]:block">
        <svg
          viewBox="0 0 500 520"
          className="w-full max-w-xs mx-auto block"
          aria-label="Uganda region map filter"
          role="img"
        >
          {/* Lake Victoria */}
          <ellipse cx="310" cy="440" rx="72" ry="46"
            fill="#bee3f8" stroke="#7ec8e3" strokeWidth="1.5"
            strokeDasharray="5,3" opacity="0.7" />
          <text x="310" y="444" textAnchor="middle" fontSize="10"
            fill="#2b6cb0" fontStyle="italic" style={{ fontFamily: "system-ui" }}>
            Lake Victoria
          </text>

          {(["Northern", "Eastern", "Central", "Western"] as UgandaRegion[]).map((region) => {
            const { d, labelX, labelY } = REGION_PATHS[region];
            const isActive = activeRegion === region;
            const isDimmed = activeRegion !== "All" && !isActive;
            const count = businessCounts?.[region];

            return (
              <g
                key={region}
                onClick={() => handleClick(region)}
                className="cursor-pointer"
                role="button"
                aria-label={`${region} region${isActive ? " (selected)" : ""}${count != null ? ` — ${count} businesses` : ""}`}
                aria-pressed={isActive}
              >
                <path
                  d={d}
                  fill={REGION_COLORS[region]}
                  stroke={isActive ? ACTIVE_STROKE : "#ffffff"}
                  strokeWidth={isActive ? 3 : 2}
                  opacity={isDimmed ? INACTIVE_OPACITY : 1}
                  className="transition-opacity duration-150 hover:opacity-80"
                />
                <text
                  x={labelX} y={labelY}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="14" fontWeight="bold"
                  fill={REGION_TEXT_COLORS[region]}
                  opacity={isDimmed ? 0.5 : 1}
                  className="select-none pointer-events-none"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {region}
                </text>
                {count != null && (
                  <text
                    x={labelX} y={labelY + 16}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="10"
                    fill={REGION_TEXT_COLORS[region]}
                    opacity={isDimmed ? 0.4 : 0.85}
                    className="select-none pointer-events-none"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    {count} businesses
                  </text>
                )}
              </g>
            );
          })}

          {/* Kampala marker */}
          <circle cx="235" cy="248" r="5" fill="#e53e3e" stroke="white" strokeWidth="2" />
          <text x="248" y="245" fontSize="9" fill="#e53e3e" fontWeight="700"
            style={{ fontFamily: "system-ui" }}>Kampala</text>
        </svg>

        {activeRegion !== "All" && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => onRegionClick("All")}
              className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2"
            >
              Show all regions
            </button>
          </div>
        )}
      </div>

      {/* Mobile chip fallback */}
      <div className="flex min-[360px]:hidden gap-2 overflow-x-auto pb-1">
        {(["All", ...UGANDA_REGIONS] as Array<"All" | UgandaRegion>).map((r) => (
          <button
            key={r}
            onClick={() => onRegionClick(r)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              activeRegion === r
                ? "bg-[#F5C842] text-[#1C3A2A]"
                : "bg-[#2D5A40] text-white"
            }`}
          >
            {r === "All" ? "All Regions" : r}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/UgandaBusinessMap.tsx
git commit -m "feat: Uganda region map component for business directory"
```

---

## Task 4: `/businesses` discovery page

**Files:**
- Create: `app/businesses/page.tsx`
- Create: `app/businesses/BusinessesClient.tsx`

- [ ] **Step 1: Create `app/businesses/page.tsx`**

```tsx
import { createClient } from "@supabase/supabase-js";
import type { Business } from "@/lib/supabase/types";
import BusinessesClient from "./BusinessesClient";

export const revalidate = 60;

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string; category?: string }>;
}) {
  const params = await searchParams;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("businesses")
    .select("id,name,category,region,district,town,whatsapp,phone,status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  const businesses = (data ?? []) as Pick<
    Business,
    "id" | "name" | "category" | "region" | "district" | "town" | "whatsapp" | "phone" | "status"
  >[];

  return (
    <BusinessesClient
      initialBusinesses={businesses}
      initialQuery={params.q ?? ""}
      initialRegion={(params.region as Business["region"]) ?? ""}
      initialCategory={params.category ?? ""}
    />
  );
}
```

- [ ] **Step 2: Create `app/businesses/BusinessesClient.tsx`**

```tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import UgandaBusinessMap from "@/components/UgandaBusinessMap";
import { BUSINESS_CATEGORIES, UGANDA_REGIONS, categoryEmoji } from "@/app/data/businesses";
import type { UgandaRegion } from "@/app/data/businesses";
import type { Business } from "@/lib/supabase/types";

type BusinessCard = Pick<Business, "id" | "name" | "category" | "region" | "district" | "town" | "whatsapp" | "phone" | "status">;

type Props = {
  initialBusinesses: BusinessCard[];
  initialQuery: string;
  initialRegion: string;
  initialCategory: string;
};

const PAGE_SIZE = 20;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function BusinessesClient({
  initialBusinesses,
  initialQuery,
  initialRegion,
  initialCategory,
}: Props) {
  const [businesses, setBusinesses] = useState<BusinessCard[]>(initialBusinesses);
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<"All" | UgandaRegion>(
    (initialRegion as UgandaRegion) || "All"
  );
  const [category, setCategory] = useState(initialCategory);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(initialBusinesses.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const matchesQuery =
        !query ||
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.category.toLowerCase().includes(query.toLowerCase()) ||
        b.district.toLowerCase().includes(query.toLowerCase());
      const matchesRegion = region === "All" || b.region === region;
      const matchesCategory = !category || b.category === category;
      return matchesQuery && matchesRegion && matchesCategory;
    });
  }, [businesses, query, region, category]);

  const businessCounts = useMemo(() => {
    const counts: Partial<Record<UgandaRegion, number>> = {};
    for (const r of UGANDA_REGIONS) {
      counts[r] = businesses.filter((b) => b.region === r).length;
    }
    return counts;
  }, [businesses]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data } = await supabase
      .from("businesses")
      .select("id,name,category,region,district,town,whatsapp,phone,status")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    const rows = (data ?? []) as BusinessCard[];
    setBusinesses((prev) => [...prev, ...rows]);
    setOffset((o) => o + PAGE_SIZE);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [offset]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <div className="bg-[#1C3A2A] px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>
          📍 Find a Business
        </h1>
        <p className="text-sm text-white/70">Real businesses across Uganda</p>
      </div>

      {/* Search + Category filter */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2 flex-wrap sticky top-0 z-10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses..."
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1C3A2A]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#1C3A2A]"
        >
          <option value="">All Categories</option>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Region map */}
      <div className="bg-[#e8f5ee] px-4 py-5 border-b border-[#c0dcc8]">
        <p className="text-xs font-semibold text-[#2d6a4f] text-center mb-3">
          Browse by region — click to filter
        </p>
        <UgandaBusinessMap
          activeRegion={region}
          onRegionClick={setRegion}
          businessCounts={businessCounts}
        />
      </div>

      {/* Results */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            {filtered.length} {filtered.length === 1 ? "business" : "businesses"}
            {region !== "All" ? ` in ${region}` : ""}
            {category ? ` · ${category}` : ""}
          </p>
          <Link
            href="/businesses/register"
            className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2"
          >
            + List your business
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">No businesses found.</p>
            <Link href="/businesses/register" className="mt-3 inline-block text-sm font-bold text-[#1C3A2A] underline">
              Be the first to list one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((b) => (
              <Link
                key={b.id}
                href={`/businesses/${b.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-[#1C3A2A] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-[#1C3A2A] text-sm truncate">{b.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {categoryEmoji(b.category)} {b.category} · {b.town ? `${b.town}, ` : ""}{b.district}
                    </p>
                  </div>
                  <span className="shrink-0 text-lg">{categoryEmoji(b.category)}</span>
                </div>
                {b.whatsapp && (
                  <div
                    onClick={(e) => { e.preventDefault(); window.open(`https://wa.me/${b.whatsapp!.replace(/\D/g, "")}`, "_blank"); }}
                    className="mt-3 w-full rounded-lg bg-[#25d366] py-2 text-center text-xs font-bold text-white"
                  >
                    💬 WhatsApp
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#1C3A2A] py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more businesses →"}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/businesses/page.tsx app/businesses/BusinessesClient.tsx
git commit -m "feat: /businesses discovery page with search, region map, category filter"
```

---

## Task 5: Business profile page `/businesses/[id]`

**Files:**
- Create: `app/businesses/[id]/page.tsx`

- [ ] **Step 1: Create `app/businesses/[id]/page.tsx`**

```tsx
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Business } from "@/lib/supabase/types";
import { categoryEmoji } from "@/app/data/businesses";

export const revalidate = 60;

async function incrementSignal(id: string, signal: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supabase.rpc("increment_business_signal", {
    business_id: id,
    signal_col: signal,
  });
}

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!data) notFound();

  const business = data as Business;

  // Fire-and-forget view count increment
  incrementSignal(id, "view_count").catch(() => {});

  const socials = [
    business.website  && { label: "🌐 Website",   href: business.website },
    business.facebook && { label: "📘 Facebook",  href: business.facebook.startsWith("http") ? business.facebook : `https://facebook.com/${business.facebook}` },
    business.instagram && { label: "📸 Instagram", href: business.instagram.startsWith("http") ? business.instagram : `https://instagram.com/${business.instagram}` },
    business.tiktok   && { label: "🎵 TikTok",    href: business.tiktok.startsWith("http") ? business.tiktok : `https://tiktok.com/@${business.tiktok}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-500 flex gap-1">
        <Link href="/businesses" className="hover:text-[#1C3A2A]">Businesses</Link>
        <span>›</span>
        <span className="text-[#1C3A2A] font-semibold truncate">{business.name}</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] px-5 py-8 text-white">
        <p className="text-3xl mb-3">{categoryEmoji(business.category)}</p>
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>
          {business.name}
        </h1>
        <p className="text-sm text-white/70">
          {business.category} · {business.town ? `${business.town}, ` : ""}{business.district}, {business.region}
        </p>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
        {/* Description */}
        {business.description && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">About</p>
            <p className="text-sm text-gray-700 leading-relaxed">{business.description}</p>
          </div>
        )}

        {/* Hours */}
        {business.hours && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Opening Hours</p>
            <p className="text-sm text-gray-700">🕐 {business.hours}</p>
          </div>
        )}

        {/* Contact CTAs */}
        <div className="space-y-2">
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => incrementSignal(id, "whatsapp_clicks").catch(() => {})}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25d366] py-4 text-sm font-black text-white"
            >
              💬 Chat on WhatsApp
            </a>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              onClick={() => incrementSignal(id, "contact_clicks").catch(() => {})}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-white border-2 border-[#1C3A2A] py-4 text-sm font-black text-[#1C3A2A]"
            >
              📞 Call {business.phone}
            </a>
          )}
        </div>

        {/* Socials */}
        {socials.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Find us online</p>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#f5f0e8] border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#1C3A2A] hover:bg-[#e8f5ee] transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <ShareButton name={business.name} />

        <Link href="/businesses" className="block text-center text-sm font-bold text-[#1C3A2A] underline underline-offset-2 pb-4">
          ← Back to all businesses
        </Link>
      </div>
    </div>
  );
}

function ShareButton({ name }: { name: string }) {
  "use client";
  return (
    <button
      onClick={() => {
        if (navigator.share) {
          navigator.share({ title: name, url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied!");
        }
      }}
      className="w-full rounded-xl bg-[#f5f0e8] border border-gray-200 py-3 text-sm font-bold text-[#1C3A2A]"
    >
      🔗 Share this business
    </button>
  );
}
```

> **Note:** The `ShareButton` uses a `"use client"` directive inside a server component file. Extract it to a separate file `app/businesses/[id]/ShareButton.tsx` if Next.js throws a build error — move the component there and import it.

- [ ] **Step 2: Commit**

```bash
git add "app/businesses/[id]/page.tsx"
git commit -m "feat: business profile page with contact CTAs and signal tracking"
```

---

## Task 6: Business registration form

**Files:**
- Create: `app/businesses/register/page.tsx`
- Create: `app/businesses/register/BusinessRegisterForm.tsx`

- [ ] **Step 1: Create `app/businesses/register/page.tsx`**

```tsx
import BusinessRegisterForm from "./BusinessRegisterForm";

export default function RegisterBusinessPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-[#1C3A2A] px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-[#F5C842]" style={{ fontFamily: "Georgia, serif" }}>
          List Your Business
        </h1>
        <p className="text-sm text-white/70 mt-1">Free · We review and publish within 24 hours</p>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <BusinessRegisterForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/businesses/register/BusinessRegisterForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BUSINESS_CATEGORIES, UGANDA_REGIONS, DISTRICTS_BY_REGION } from "@/app/data/businesses";
import type { UgandaRegion } from "@/app/data/businesses";
import type { BusinessInsert } from "@/lib/supabase/types";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function BusinessRegisterForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState<UgandaRegion | "">("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const districts = region ? DISTRICTS_BY_REGION[region] : [];

  const validate = (): string => {
    if (!name.trim()) return "Business name is required.";
    if (!category) return "Please select a category.";
    if (!region) return "Please select a region.";
    if (!district) return "Please select a district.";
    if (!whatsapp.trim() && !phone.trim()) return "Please provide at least a WhatsApp number or phone number.";
    if (description.length > 300) return "Description must be 300 characters or less.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError("");

    const payload: BusinessInsert = {
      name: name.trim(),
      category,
      region: region as UgandaRegion,
      district,
      ...(town.trim()        && { town: town.trim() }),
      ...(description.trim() && { description: description.trim() }),
      ...(hours.trim()       && { hours: hours.trim() }),
      ...(whatsapp.trim()    && { whatsapp: whatsapp.trim() }),
      ...(phone.trim()       && { phone: phone.trim() }),
      ...(website.trim()     && { website: website.trim() }),
      ...(facebook.trim()    && { facebook: facebook.trim() }),
      ...(instagram.trim()   && { instagram: instagram.trim() }),
      ...(tiktok.trim()      && { tiktok: tiktok.trim() }),
    };

    const { error: sbError } = await getSupabase().from("businesses").insert(payload);

    setSubmitting(false);
    if (sbError) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-xl font-black text-[#1C3A2A] mb-2" style={{ fontFamily: "Georgia, serif" }}>
          Listing submitted!
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Thanks! We'll review and publish your listing within 24 hours.
        </p>
      </div>
    );
  }

  const fieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white";
  const labelClass = "block text-xs font-bold text-gray-600 mb-1";
  const sectionClass = "space-y-3";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className={sectionClass}>
        <h2 className="text-sm font-black text-[#1C3A2A] border-b border-gray-200 pb-1">Business Details</h2>
        <div>
          <label className={labelClass}>Business name *</label>
          <input className={fieldClass} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mama's Kitchen" />
        </div>
        <div>
          <label className={labelClass}>Category *</label>
          <select className={fieldClass} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Select category</option>
            {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Description <span className="text-gray-400 font-normal">({description.length}/300)</span></label>
          <textarea
            className={`${fieldClass} resize-none`}
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What do you offer? Keep it short and clear."
            maxLength={300}
          />
        </div>
        <div>
          <label className={labelClass}>Opening hours</label>
          <input className={fieldClass} value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. Mon–Fri 7am–9pm" />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-sm font-black text-[#1C3A2A] border-b border-gray-200 pb-1">Location *</h2>
        <div>
          <label className={labelClass}>Region *</label>
          <select className={fieldClass} value={region} onChange={e => { setRegion(e.target.value as UgandaRegion); setDistrict(""); }}>
            <option value="">Select region</option>
            {UGANDA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>District *</label>
          <select className={fieldClass} value={district} onChange={e => setDistrict(e.target.value)} disabled={!region}>
            <option value="">{region ? "Select district" : "Select region first"}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Town / Area <span className="text-gray-400 font-normal">(optional)</span></label>
          <input className={fieldClass} value={town} onChange={e => setTown(e.target.value)} placeholder="e.g. Wandegeya" />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-sm font-black text-[#1C3A2A] border-b border-gray-200 pb-1">Contact <span className="font-normal text-gray-500">(at least one required)</span></h2>
        <div>
          <label className={labelClass}>WhatsApp number</label>
          <input className={fieldClass} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+256 7XX XXX XXX" type="tel" />
        </div>
        <div>
          <label className={labelClass}>Phone number</label>
          <input className={fieldClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" type="tel" />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-sm font-black text-[#1C3A2A] border-b border-gray-200 pb-1">Online Presence <span className="font-normal text-gray-500">(optional)</span></h2>
        <div>
          <label className={labelClass}>Website</label>
          <input className={fieldClass} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" type="url" />
        </div>
        <div>
          <label className={labelClass}>Facebook</label>
          <input className={fieldClass} value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="facebook.com/yourpage or @handle" />
        </div>
        <div>
          <label className={labelClass}>Instagram</label>
          <input className={fieldClass} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@yourhandle" />
        </div>
        <div>
          <label className={labelClass}>TikTok</label>
          <input className={fieldClass} value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@yourhandle" />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#1C3A2A] py-4 text-sm font-black text-[#F5C842] disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit for Review →"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/businesses/register/page.tsx app/businesses/register/BusinessRegisterForm.tsx
git commit -m "feat: business registration form with validation"
```

---

## Task 7: Admin approval page

**Files:**
- Create: `app/admin/businesses/page.tsx`

- [ ] **Step 1: Create `app/admin/businesses/page.tsx`**

```tsx
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Business } from "@/lib/supabase/types";

type BusinessRow = Pick<Business, "id" | "name" | "category" | "district" | "region" | "whatsapp" | "phone" | "status" | "created_at">;

async function approveBusiness(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  await supabase.from("businesses").update({ status: "active" }).eq("id", id);
  revalidatePath("/admin/businesses");
}

async function rejectBusiness(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  await supabase.from("businesses").update({ status: "rejected" }).eq("id", id);
  revalidatePath("/admin/businesses");
}

export default async function AdminBusinessesPage() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return <p>Supabase not configured.</p>;

  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,category,district,region,whatsapp,phone,status,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return <p>Could not load businesses.</p>;

  const businesses = (data ?? []) as BusinessRow[];

  return (
    <main>
      <h1>Pending Businesses ({businesses.length})</h1>
      {businesses.length === 0 ? (
        <p>No pending businesses.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>District</th>
              <th>Region</th>
              <th>Contact</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.category}</td>
                <td>{b.district}</td>
                <td>{b.region}</td>
                <td>{b.whatsapp || b.phone || "—"}</td>
                <td>{new Date(b.created_at).toLocaleDateString()}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <form action={approveBusiness}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit">Approve</button>
                  </form>
                  <form action={rejectBusiness}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit">Reject</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/businesses/page.tsx
git commit -m "feat: admin businesses approval page"
```

---

## Task 8: Homepage pillar update

**Files:**
- Modify: `app/HomeClient.tsx`

- [ ] **Step 1: Add "Find a Business" pillar to the pillars grid in `app/HomeClient.tsx`**

Find the pillars grid section (around line 163 — `{/* ── Pillars ── */}`). The grid is currently `grid-cols-2`. Change it to `grid-cols-2 sm:grid-cols-3` and add the new pillar card. Also add a `BusinessSearch` state and handler.

Add this state near the top of the `HomeClient` component (after existing `useState` calls):

```tsx
const [bizSearch, setBizSearch] = useState("");

const handleBizSearch = (e: React.FormEvent) => {
  e.preventDefault();
  if (bizSearch.trim()) {
    window.location.href = `/businesses?q=${encodeURIComponent(bizSearch.trim())}`;
  } else {
    window.location.href = "/businesses";
  }
};
```

Change the pillars grid className from:
```tsx
className="bg-white px-4 py-6 grid grid-cols-2 gap-3 max-w-2xl mx-auto"
```
to:
```tsx
className="bg-white px-4 py-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto"
```

Add this new card after the existing two pillar cards (before the closing `</div>` of the grid):

```tsx
<div className="col-span-2 sm:col-span-1 rounded-2xl bg-[#f5f0e8] border border-[#e0d8cc] p-4 hover:border-[#1C3A2A] transition-colors">
  <div className="text-2xl mb-2">📍</div>
  <p className="font-black text-[#1C3A2A] text-sm mb-1">Find a Business</p>
  <p className="text-xs text-slate-500 leading-relaxed mb-3">Restaurants, plumbers, salons & more across Uganda.</p>
  <form onSubmit={handleBizSearch} className="flex gap-1">
    <input
      type="search"
      value={bizSearch}
      onChange={e => setBizSearch(e.target.value)}
      placeholder="e.g. restaurant"
      className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#1C3A2A]"
    />
    <button type="submit" className="rounded-lg bg-[#1C3A2A] px-2 py-1.5 text-xs font-bold text-[#F5C842]">
      Go
    </button>
  </form>
  <a href="/businesses" className="mt-2 block text-xs font-bold text-[#1C3A2A]">Browse all →</a>
</div>
```

- [ ] **Step 2: Also add "Businesses" to the NAV_LINKS array in `HomeClient.tsx`**

Find:
```tsx
const NAV_LINKS = [
  { href: "/ideas", label: "Ideas" },
  { href: "/jobs", label: "Jobs" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];
```

Replace with:
```tsx
const NAV_LINKS = [
  { href: "/ideas", label: "Ideas" },
  { href: "/businesses", label: "Businesses" },
  { href: "/jobs", label: "Jobs" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];
```

- [ ] **Step 3: Commit**

```bash
git add app/HomeClient.tsx
git commit -m "feat: add Find a Business pillar and nav link to homepage"
```

---

## Task 9: Smoke test and verify

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3000` with no TypeScript or build errors.

- [ ] **Step 2: Test the discovery page**

Open `http://localhost:3000/businesses`.
- Page loads with search bar, region map, category dropdown.
- Region map renders 4 regions (Central highlighted in yellow, others in green).
- "No businesses found" empty state shows (DB is empty at this point).
- "List your business" link visible.

- [ ] **Step 3: Test the registration form**

Open `http://localhost:3000/businesses/register`.
- Form renders all fields.
- Submit with no name → shows "Business name is required." error.
- Submit with no contact → shows contact error.
- Fill in: name = "Test Biz", category = "Restaurant", region = "Central", district = "Kampala", whatsapp = "+256700000000" → submit.
- Success message shows: "Thanks! We'll review and publish your listing within 24 hours."
- Open Supabase dashboard → `businesses` table → row appears with `status = pending`.

- [ ] **Step 4: Test admin approval**

Open `http://localhost:3000/admin/businesses` (requires admin session).
- Pending business row appears.
- Click "Approve" → row disappears, check Supabase: `status = active`.

- [ ] **Step 5: Test profile page**

Open `http://localhost:3000/businesses` → business card appears.
- Click card → profile page loads.
- WhatsApp button links to `wa.me/256700000000`.
- Check Supabase: `view_count` incremented by 1.

- [ ] **Step 6: Test homepage**

Open `http://localhost:3000`.
- "Find a Business" pillar visible.
- Type "restaurant" in the search box → "Go" button navigates to `/businesses?q=restaurant`.
- "Businesses" link in nav works.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: business directory — discovery, profiles, registration, admin approval, homepage integration"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ `businesses` table with all columns + indexes + RLS + signal RPC — Task 1
- ✅ Types and constants — Task 2
- ✅ Uganda region map component — Task 3
- ✅ `/businesses` discovery page with search, region filter, category, load more — Task 4
- ✅ `/businesses/[id]` profile with view/whatsapp/contact signal tracking — Task 5
- ✅ `/businesses/register` form with all required + optional fields, validation, success state — Task 6
- ✅ Admin `/admin/businesses` approve/reject — Task 7
- ✅ Homepage pillar + nav link — Task 8
- ✅ End-to-end smoke test — Task 9

**No placeholders:** All steps have complete code. ✅

**Type consistency:**
- `Business`, `BusinessInsert`, `BusinessStatus` defined in Task 2, used identically in Tasks 4–7. ✅
- `UgandaRegion` defined in `app/data/businesses.ts`, imported in Tasks 3, 4, 6. ✅
- `categoryEmoji` defined in Task 2, imported in Tasks 4, 5. ✅
- `increment_business_signal` RPC defined in Task 1, called in Task 5. ✅
