# ZuulaUganda Travel App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/travel` section to Business Yoo — a destination-led accommodation directory branded ZuulaUganda, with 12 Uganda destinations, accommodation profiles, WhatsApp/Booking.com/Request-to-Book contact, and Featured listing monetisation.

**Architecture:** New Next.js App Router pages at `/travel`, `/travel/destinations`, `/travel/destinations/[slug]`, `/travel/stays/[id]`, `/travel/register`, and `/admin/travel`. Four new Supabase tables. Request to Book is a client-side WhatsApp deep link — no server processing needed. Follows existing Business Yoo patterns.

**Tech Stack:** Next.js 14 App Router, Supabase (PostgreSQL + Storage), Tailwind CSS, TypeScript. No new dependencies.

---

## File Structure

**New files to create:**
- `app/travel/page.tsx` — home page (server component)
- `app/travel/TravelHomeClient.tsx` — home page client component
- `app/travel/destinations/page.tsx` — all destinations list
- `app/travel/destinations/[slug]/page.tsx` — destination page (server component)
- `app/travel/destinations/[slug]/DestinationClient.tsx` — destination client with filters
- `app/travel/stays/[id]/page.tsx` — accommodation profile
- `app/travel/register/page.tsx` — registration page wrapper
- `app/travel/register/TravelRegisterForm.tsx` — multi-step form
- `app/admin/travel/page.tsx` — admin panel
- `app/admin/travel/AdminTravelClient.tsx` — admin UI
- `app/api/admin/travel/approve/route.ts` — approve API
- `app/api/admin/travel/reject/route.ts` — reject API
- `app/api/admin/travel/feature/route.ts` — toggle featured API
- `app/data/travel.ts` — constants and seed data
- `lib/supabase/travel-types.ts` — TypeScript types

**Existing files to modify:**
- `app/sitemap.ts` — add /travel routes

---

## Task 1: Supabase Tables & Types

**Files:**
- Create: `lib/supabase/travel-types.ts`

- [ ] **Step 1: Create the four tables in Supabase SQL Editor**

```sql
create extension if not exists "uuid-ossp";

-- travel_destinations table
create table travel_destinations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  region text not null,
  description text not null,
  activities text[] not null default '{}',
  cover_photo_url text,
  sort_order integer not null default 0,
  is_featured boolean not null default false
);

-- travel_stays table
create table travel_stays (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  destination_id uuid not null references travel_destinations(id) on delete cascade,
  type text not null check (type in ('hotel', 'guesthouse', 'lodge', 'airbnb', 'camping')),
  district text not null,
  town text not null,
  description text not null,
  price_from integer not null,
  checkin_time text not null,
  checkout_time text not null,
  capacity integer not null,
  whatsapp text not null,
  phone text,
  booking_com_url text,
  amenities text[] not null default '{}',
  cover_photo_url text,
  status text not null default 'pending' check (status in ('pending', 'active', 'featured')),
  created_at timestamptz not null default now()
);

-- travel_stay_rooms table
create table travel_stay_rooms (
  id uuid primary key default uuid_generate_v4(),
  stay_id uuid not null references travel_stays(id) on delete cascade,
  name text not null,
  price_per_night integer not null,
  capacity integer not null,
  sort_order integer not null default 0
);

-- travel_stay_photos table
create table travel_stay_photos (
  id uuid primary key default uuid_generate_v4(),
  stay_id uuid not null references travel_stays(id) on delete cascade,
  photo_url text not null,
  caption text,
  sort_order integer not null default 0
);

-- Indexes
create index on travel_stays(destination_id);
create index on travel_stays(status);
create index on travel_stays(type);
create index on travel_stays(price_from);

-- RLS
alter table travel_destinations enable row level security;
alter table travel_stays enable row level security;
alter table travel_stay_rooms enable row level security;
alter table travel_stay_photos enable row level security;

create policy "public read destinations" on travel_destinations for select using (true);
create policy "public read active stays" on travel_stays for select using (status in ('active', 'featured'));
create policy "public read rooms" on travel_stay_rooms for select using (
  exists (select 1 from travel_stays where id = stay_id and status in ('active', 'featured'))
);
create policy "public read photos" on travel_stay_photos for select using (
  exists (select 1 from travel_stays where id = stay_id and status in ('active', 'featured'))
);
create policy "service role full travel_destinations" on travel_destinations for all using (auth.role() = 'service_role');
create policy "service role full travel_stays" on travel_stays for all using (auth.role() = 'service_role');
create policy "service role full rooms" on travel_stay_rooms for all using (auth.role() = 'service_role');
create policy "service role full photos" on travel_stay_photos for all using (auth.role() = 'service_role');
```

- [ ] **Step 2: Create Supabase Storage bucket**

Supabase dashboard → Storage → New bucket:
- Name: `travel-photos`
- Public: yes

- [ ] **Step 3: Create TypeScript types**

Create `lib/supabase/travel-types.ts`:

```typescript
export type StayStatus = 'pending' | 'active' | 'featured';
export type StayType = 'hotel' | 'guesthouse' | 'lodge' | 'airbnb' | 'camping';

export interface TravelDestination {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  activities: string[];
  cover_photo_url: string | null;
  sort_order: number;
  is_featured: boolean;
}

export interface TravelStay {
  id: string;
  name: string;
  slug: string;
  destination_id: string;
  type: StayType;
  district: string;
  town: string;
  description: string;
  price_from: number;
  checkin_time: string;
  checkout_time: string;
  capacity: number;
  whatsapp: string;
  phone: string | null;
  booking_com_url: string | null;
  amenities: string[];
  cover_photo_url: string | null;
  status: StayStatus;
  created_at: string;
}

export interface TravelStayRoom {
  id: string;
  stay_id: string;
  name: string;
  price_per_night: number;
  capacity: number;
  sort_order: number;
}

export interface TravelStayPhoto {
  id: string;
  stay_id: string;
  photo_url: string;
  caption: string | null;
  sort_order: number;
}

export type TravelStayInsert = Omit<TravelStay, 'id' | 'created_at' | 'status'>;
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/travel-types.ts
git commit -m "feat(travel): add Supabase tables and TypeScript types"
```

---

## Task 2: Seed Data & Constants

**Files:**
- Create: `app/data/travel.ts`

- [ ] **Step 1: Create travel constants and seed data**

Create `app/data/travel.ts`:

```typescript
export const STAY_TYPE_LABELS: Record<string, string> = {
  hotel: '🏨 Hotel',
  guesthouse: '🏡 Guesthouse',
  lodge: '🌿 Lodge',
  airbnb: '🏠 Airbnb',
  camping: '⛺ Camping',
};

export const STAY_AMENITY_OPTIONS = [
  'WiFi', 'Parking', 'Meals included', 'Hot water', 'Solar power',
  'Security', 'Swimming pool', 'Airport transfer', 'Air conditioning', 'Generator backup',
] as const;

export const BUDGET_RANGES = [
  { label: 'Any budget', min: null, max: null },
  { label: 'Under UGX 50k', min: null, max: 50000 },
  { label: 'UGX 50k – 150k', min: 50000, max: 150000 },
  { label: 'UGX 150k – 500k', min: 150000, max: 500000 },
  { label: 'UGX 500k+', min: 500000, max: null },
] as const;

export const SEED_DESTINATIONS = [
  { name: 'Bwindi Impenetrable Forest', slug: 'bwindi', region: 'South Western Uganda', description: 'Home to half the world\'s mountain gorillas. A UNESCO World Heritage Site and Uganda\'s most iconic destination for gorilla trekking.', activities: ['Gorilla Trekking', 'Bird Watching', 'Nature Walks'], sort_order: 1, is_featured: true },
  { name: 'Jinja', slug: 'jinja', region: 'Eastern Uganda', description: 'The adventure capital of East Africa, sitting at the source of the River Nile. Famous for white-water rafting, kayaking, and bungee jumping.', activities: ['White Water Rafting', 'Kayaking', 'Bungee Jumping', 'Nile Cruises'], sort_order: 2, is_featured: true },
  { name: 'Murchison Falls National Park', slug: 'murchison-falls', region: 'Northern Uganda', description: 'Uganda\'s largest national park, home to the world\'s most powerful waterfall and abundant wildlife including elephants, hippos, and lions.', activities: ['Safari Drives', 'Nile Boat Cruise', 'Waterfall Hike', 'Sport Fishing'], sort_order: 3, is_featured: true },
  { name: 'Queen Elizabeth National Park', slug: 'queen-elizabeth', region: 'Western Uganda', description: 'A diverse park offering savannah, forests, and wetlands. Famous for tree-climbing lions, chimpanzees, and the scenic Kazinga Channel.', activities: ['Game Drives', 'Boat Safari', 'Chimpanzee Tracking', 'Bird Watching'], sort_order: 4, is_featured: false },
  { name: 'Lake Bunyonyi', slug: 'lake-bunyonyi', region: 'South Western Uganda', description: 'One of the most beautiful lakes in Africa, dotted with 29 islands and surrounded by terraced hills. Perfect for canoeing and relaxation.', activities: ['Canoeing', 'Island Hopping', 'Swimming', 'Cultural Tours'], sort_order: 5, is_featured: false },
  { name: 'Fort Portal', slug: 'fort-portal', region: 'Western Uganda', description: 'Gateway to Kibale Forest and the crater lakes region. A charming town surrounded by tea plantations and volcanic crater lakes.', activities: ['Chimpanzee Tracking', 'Crater Lake Tours', 'Tea Plantation Visits', 'Bird Watching'], sort_order: 6, is_featured: true },
  { name: 'Rwenzori Mountains', slug: 'rwenzori', region: 'Western Uganda', description: 'The legendary Mountains of the Moon, offering challenging treks through afro-alpine vegetation to glaciated peaks straddling the equator.', activities: ['Mountain Trekking', 'Bird Watching', 'Glacier Views', 'Waterfalls'], sort_order: 7, is_featured: false },
  { name: 'Kampala', slug: 'kampala', region: 'Central Uganda', description: 'Uganda\'s vibrant capital city, built on seven hills. A bustling hub of culture, food, nightlife, and business with rich historical sites.', activities: ['City Tours', 'Food & Markets', 'Nightlife', 'Historical Sites', 'Shopping'], sort_order: 8, is_featured: false },
  { name: 'Entebbe', slug: 'entebbe', region: 'Central Uganda', description: 'Uganda\'s lakeside city on the shores of Lake Victoria. Home to the international airport, the Uganda Wildlife Education Centre, and beautiful botanical gardens.', activities: ['Lake Victoria Cruises', 'Uganda Wildlife Education Centre', 'Botanical Gardens', 'Beach Relaxation'], sort_order: 9, is_featured: false },
  { name: 'Mbale', slug: 'mbale', region: 'Eastern Uganda', description: 'Eastern Uganda\'s main city at the foot of Mount Elgon. A gateway for trekking, waterfalls, and exploring the Bugisu cultural heartland.', activities: ['Mount Elgon Trekking', 'Sipi Falls', 'Cultural Tours', 'Coffee Farm Visits'], sort_order: 10, is_featured: false },
  { name: 'Gulu', slug: 'gulu', region: 'Northern Uganda', description: 'Northern Uganda\'s largest city, now a growing hub of commerce and culture. Gateway to Murchison Falls and the Acholi cultural heritage.', activities: ['Cultural Heritage Tours', 'Murchison Falls Access', 'Local Markets', 'Community Tourism'], sort_order: 11, is_featured: false },
  { name: 'Kabale', slug: 'kabale', region: 'South Western Uganda', description: 'The gateway to Bwindi and Lake Bunyonyi, nicknamed "Little Switzerland" for its dramatic hilly landscape and cool highland climate.', activities: ['Lake Bunyonyi Access', 'Bwindi Gateway', 'Hiking', 'Cultural Visits'], sort_order: 12, is_featured: false },
] as const;
```

- [ ] **Step 2: Seed destinations into Supabase**

In Supabase → SQL Editor, run:

```sql
insert into travel_destinations (name, slug, region, description, activities, sort_order, is_featured) values
('Bwindi Impenetrable Forest', 'bwindi', 'South Western Uganda', 'Home to half the world''s mountain gorillas. A UNESCO World Heritage Site and Uganda''s most iconic destination for gorilla trekking.', array['Gorilla Trekking', 'Bird Watching', 'Nature Walks'], 1, true),
('Jinja', 'jinja', 'Eastern Uganda', 'The adventure capital of East Africa, sitting at the source of the River Nile. Famous for white-water rafting, kayaking, and bungee jumping.', array['White Water Rafting', 'Kayaking', 'Bungee Jumping', 'Nile Cruises'], 2, true),
('Murchison Falls National Park', 'murchison-falls', 'Northern Uganda', 'Uganda''s largest national park, home to the world''s most powerful waterfall and abundant wildlife.', array['Safari Drives', 'Nile Boat Cruise', 'Waterfall Hike', 'Sport Fishing'], 3, true),
('Queen Elizabeth National Park', 'queen-elizabeth', 'Western Uganda', 'A diverse park offering savannah, forests, and wetlands. Famous for tree-climbing lions and chimpanzees.', array['Game Drives', 'Boat Safari', 'Chimpanzee Tracking', 'Bird Watching'], 4, false),
('Lake Bunyonyi', 'lake-bunyonyi', 'South Western Uganda', 'One of the most beautiful lakes in Africa, dotted with 29 islands and surrounded by terraced hills.', array['Canoeing', 'Island Hopping', 'Swimming', 'Cultural Tours'], 5, false),
('Fort Portal', 'fort-portal', 'Western Uganda', 'Gateway to Kibale Forest and the crater lakes region. A charming town surrounded by tea plantations.', array['Chimpanzee Tracking', 'Crater Lake Tours', 'Tea Plantation Visits', 'Bird Watching'], 6, true),
('Rwenzori Mountains', 'rwenzori', 'Western Uganda', 'The legendary Mountains of the Moon, offering challenging treks through afro-alpine vegetation to glaciated peaks.', array['Mountain Trekking', 'Bird Watching', 'Glacier Views', 'Waterfalls'], 7, false),
('Kampala', 'kampala', 'Central Uganda', 'Uganda''s vibrant capital city, built on seven hills. A bustling hub of culture, food, nightlife, and business.', array['City Tours', 'Food & Markets', 'Nightlife', 'Historical Sites', 'Shopping'], 8, false),
('Entebbe', 'entebbe', 'Central Uganda', 'Uganda''s lakeside city on the shores of Lake Victoria. Home to the international airport and beautiful botanical gardens.', array['Lake Victoria Cruises', 'Uganda Wildlife Education Centre', 'Botanical Gardens', 'Beach Relaxation'], 9, false),
('Mbale', 'mbale', 'Eastern Uganda', 'Eastern Uganda''s main city at the foot of Mount Elgon. Gateway to Sipi Falls and chimpanzee tracking.', array['Mount Elgon Trekking', 'Sipi Falls', 'Cultural Tours', 'Coffee Farm Visits'], 10, false),
('Gulu', 'gulu', 'Northern Uganda', 'Northern Uganda''s largest city and gateway to Murchison Falls and the Acholi cultural heritage.', array['Cultural Heritage Tours', 'Murchison Falls Access', 'Local Markets', 'Community Tourism'], 11, false),
('Kabale', 'kabale', 'South Western Uganda', 'The gateway to Bwindi and Lake Bunyonyi, nicknamed "Little Switzerland" for its dramatic hilly landscape.', array['Lake Bunyonyi Access', 'Bwindi Gateway', 'Hiking', 'Cultural Visits'], 12, false);
```

- [ ] **Step 3: Commit**

```bash
git add app/data/travel.ts
git commit -m "feat(travel): add travel constants and destination seed data"
```

---

## Task 3: Home Page

**Files:**
- Create: `app/travel/page.tsx`
- Create: `app/travel/TravelHomeClient.tsx`

- [ ] **Step 1: Create home page server component**

Create `app/travel/page.tsx`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import type { TravelDestination } from "@/lib/supabase/travel-types";
import TravelHomeClient from "./TravelHomeClient";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find Places to Stay in Uganda | ZuulaUganda",
  description: "Discover hotels, guesthouses, lodges, and campsites across Uganda. Browse by destination — Bwindi, Jinja, Murchison Falls, and more.",
  alternates: { canonical: `${SITE_URL}/travel` },
  openGraph: {
    title: "Find Places to Stay in Uganda | ZuulaUganda",
    description: "Discover accommodation across Uganda's top destinations.",
    url: `${SITE_URL}/travel`,
    siteName: "ZuulaUganda",
    locale: "en_UG",
    type: "website",
  },
};

export default async function TravelHomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("travel_destinations")
    .select("*")
    .order("sort_order", { ascending: true });

  const destinations = (data ?? []) as TravelDestination[];

  return <TravelHomeClient destinations={destinations} />;
}
```

- [ ] **Step 2: Create home page client component**

Create `app/travel/TravelHomeClient.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import type { TravelDestination } from "@/lib/supabase/travel-types";

const DESTINATION_GRADIENTS = [
  "from-[#1a3a1a] to-[#2d5a27]",
  "from-[#1a4a6e] to-[#0d3a5c]",
  "from-[#5a3a1a] to-[#3a2010]",
  "from-[#1a5a3a] to-[#0d3a27]",
  "from-[#3a1a5a] to-[#2a0d3a]",
  "from-[#5a1a1a] to-[#3a0d0d]",
];

export default function TravelHomeClient({ destinations }: { destinations: TravelDestination[] }) {
  const [search, setSearch] = useState("");

  const filtered = destinations.filter(
    (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] px-4 pt-8 pb-6 text-center text-white">
        <h1 className="text-3xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>
          🇺🇬 ZuulaUganda
        </h1>
        <p className="text-sm text-white/80 mb-4">Discover where to stay across Uganda</p>
        <div className="max-w-md mx-auto bg-white rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
          <span className="text-gray-400">🔍</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destination..."
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-[#1C3A2A] uppercase tracking-wide">
            {search ? `${filtered.length} destinations found` : "Popular Destinations"}
          </p>
          <Link href="/travel/destinations" className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((d, i) => (
            <Link
              key={d.id}
              href={`/travel/destinations/${d.slug}`}
              className={`relative rounded-xl bg-gradient-to-br ${DESTINATION_GRADIENTS[i % DESTINATION_GRADIENTS.length]} p-4 text-white min-h-[90px] flex flex-col justify-end`}
            >
              {d.is_featured && (
                <span className="absolute top-2 right-2 bg-[#F5C842] text-[#1C3A2A] text-[9px] font-black px-2 py-0.5 rounded-full">
                  🔥 HOT
                </span>
              )}
              {d.activities[0] && (
                <p className="text-[10px] text-white/60 mb-1">{d.activities[0]}</p>
              )}
              <p className="font-black text-sm leading-tight">{d.name}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{d.region}</p>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-2xl mb-2">🗺️</p>
            <p className="text-sm">No destinations found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/travel/page.tsx app/travel/TravelHomeClient.tsx
git commit -m "feat(travel): add ZuulaUganda home page with destination grid"
```

---

## Task 4: Destinations List Page

**Files:**
- Create: `app/travel/destinations/page.tsx`

- [ ] **Step 1: Create destinations list page**

Create `app/travel/destinations/page.tsx`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Link from "next/link";
import type { TravelDestination } from "@/lib/supabase/travel-types";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Destinations in Uganda | ZuulaUganda",
  description: "Browse all travel destinations in Uganda — national parks, lakes, cities, and adventure spots.",
  alternates: { canonical: `${SITE_URL}/travel/destinations` },
};

const GRADIENTS = [
  "from-[#1a3a1a] to-[#2d5a27]", "from-[#1a4a6e] to-[#0d3a5c]",
  "from-[#5a3a1a] to-[#3a2010]", "from-[#1a5a3a] to-[#0d3a27]",
  "from-[#3a1a5a] to-[#2a0d3a]", "from-[#5a1a1a] to-[#3a0d0d]",
];

export default async function DestinationsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("travel_destinations").select("*").order("sort_order");
  const destinations = (data ?? []) as TravelDestination[];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] px-4 py-6 text-center text-white">
        <Link href="/travel" className="text-xs text-white/60 mb-2 block">← ZuulaUganda</Link>
        <h1 className="text-2xl font-black text-[#F5C842]" style={{ fontFamily: "Georgia, serif" }}>All Destinations</h1>
        <p className="text-sm text-white/70 mt-1">{destinations.length} destinations across Uganda</p>
      </div>
      <div className="px-4 py-5 max-w-2xl mx-auto grid grid-cols-2 gap-3">
        {destinations.map((d, i) => (
          <Link key={d.id} href={`/travel/destinations/${d.slug}`}
            className={`relative rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} p-4 text-white min-h-[90px] flex flex-col justify-end`}>
            {d.is_featured && (
              <span className="absolute top-2 right-2 bg-[#F5C842] text-[#1C3A2A] text-[9px] font-black px-2 py-0.5 rounded-full">🔥 HOT</span>
            )}
            {d.activities[0] && <p className="text-[10px] text-white/60 mb-1">{d.activities[0]}</p>}
            <p className="font-black text-sm leading-tight">{d.name}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{d.region}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/travel/destinations/page.tsx
git commit -m "feat(travel): add all destinations list page"
```

---

## Task 5: Destination Page

**Files:**
- Create: `app/travel/destinations/[slug]/page.tsx`
- Create: `app/travel/destinations/[slug]/DestinationClient.tsx`

- [ ] **Step 1: Create destination server page**

Create `app/travel/destinations/[slug]/page.tsx`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { TravelDestination, TravelStay } from "@/lib/supabase/travel-types";
import DestinationClient from "./DestinationClient";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

function makeSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await makeSupabase().from("travel_destinations").select("name, description, region").eq("slug", slug).single();
  if (!data) return { title: "Destination Not Found | ZuulaUganda" };
  return {
    title: `Places to Stay near ${data.name}, Uganda | ZuulaUganda`,
    description: `Find hotels, guesthouses, and lodges near ${data.name}. ${data.description}`,
    alternates: { canonical: `${SITE_URL}/travel/destinations/${slug}` },
    openGraph: { title: `Places to Stay near ${data.name} | ZuulaUganda`, description: data.description, url: `${SITE_URL}/travel/destinations/${slug}`, siteName: "ZuulaUganda", locale: "en_UG", type: "website" },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = makeSupabase();

  const [{ data: destData }, ] = await Promise.all([
    supabase.from("travel_destinations").select("*").eq("slug", slug).single(),
  ]);

  if (!destData) notFound();
  const destination = destData as TravelDestination;

  const { data: staysData } = await supabase
    .from("travel_stays")
    .select("id,name,type,town,district,price_from,whatsapp,booking_com_url,cover_photo_url,status")
    .eq("destination_id", destination.id)
    .in("status", ["active", "featured"])
    .order("status", { ascending: false })
    .order("price_from", { ascending: true })
    .limit(20);

  const stays = (staysData ?? []) as Pick<TravelStay, "id" | "name" | "type" | "town" | "district" | "price_from" | "whatsapp" | "booking_com_url" | "cover_photo_url" | "status">[];

  return <DestinationClient destination={destination} initialStays={stays} />;
}
```

- [ ] **Step 2: Create destination client component**

Create `app/travel/destinations/[slug]/DestinationClient.tsx`:

```typescript
"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import type { TravelDestination, TravelStay } from "@/lib/supabase/travel-types";
import { STAY_TYPE_LABELS, BUDGET_RANGES } from "@/app/data/travel";

type StayCard = Pick<TravelStay, "id" | "name" | "type" | "town" | "district" | "price_from" | "whatsapp" | "booking_com_url" | "cover_photo_url" | "status">;

const PAGE_SIZE = 20;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export default function DestinationClient({
  destination,
  initialStays,
}: {
  destination: TravelDestination;
  initialStays: StayCard[];
}) {
  const [stays, setStays] = useState(initialStays);
  const [type, setType] = useState("");
  const [budgetIdx, setBudgetIdx] = useState(0);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(initialStays.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const budget = BUDGET_RANGES[budgetIdx];

  const filtered = useMemo(() => {
    return stays.filter((s) => {
      const matchesType = !type || s.type === type;
      const matchesBudget =
        (!budget.min || s.price_from >= budget.min) &&
        (!budget.max || s.price_from <= budget.max);
      return matchesType && matchesBudget;
    });
  }, [stays, type, budget]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const { data } = await getSupabase()
      .from("travel_stays")
      .select("id,name,type,town,district,price_from,whatsapp,booking_com_url,cover_photo_url,status")
      .eq("destination_id", destination.id)
      .in("status", ["active", "featured"])
      .order("status", { ascending: false })
      .order("price_from", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    const rows = (data ?? []) as StayCard[];
    setStays((prev) => [...prev, ...rows]);
    setOffset((o) => o + PAGE_SIZE);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [offset, destination.id]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-500 flex gap-1">
        <Link href="/travel" className="hover:text-[#1C3A2A]">ZuulaUganda</Link>
        <span>›</span>
        <Link href="/travel/destinations" className="hover:text-[#1C3A2A]">Destinations</Link>
        <span>›</span>
        <span className="text-[#1C3A2A] font-semibold truncate">{destination.name}</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d5a27] px-4 py-6 text-white">
        <p className="text-xs text-white/50 mb-1">🇺🇬 {destination.region}</p>
        <h1 className="text-2xl font-black text-[#F5C842] mb-2" style={{ fontFamily: "Georgia, serif" }}>{destination.name}</h1>
        <p className="text-sm text-white/80 leading-relaxed mb-3">{destination.description}</p>
        <div className="flex gap-2 flex-wrap">
          {destination.activities.map((a) => (
            <span key={a} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{a}</span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2 flex-wrap">
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#1C3A2A]">
          <option value="">All types</option>
          {Object.entries(STAY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={budgetIdx.toString()} onChange={(e) => setBudgetIdx(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#1C3A2A]">
          {BUDGET_RANGES.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
        </select>
      </div>

      {/* Stays */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">{filtered.length} places to stay near {destination.name}</p>
          <Link href="/travel/register" className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2">+ List your place</Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-2xl mb-2">🏨</p>
            <p className="text-sm">No stays found with these filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((stay) => (
              <Link key={stay.id} href={`/travel/stays/${stay.id}`}
                className={`block bg-white rounded-xl border overflow-hidden transition-colors ${stay.status === "featured" ? "border-[#F5C842] border-2" : "border-gray-200 hover:border-[#1C3A2A]"}`}>
                {stay.cover_photo_url ? (
                  <div className="relative h-36 w-full">
                    <Image src={stay.cover_photo_url} alt={stay.name} fill className="object-cover" />
                    {stay.status === "featured" && (
                      <span className="absolute top-2 left-2 bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-0.5 rounded-full">⭐ FEATURED</span>
                    )}
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] flex items-center justify-center text-3xl">🏨</div>
                )}
                <div className="p-3">
                  <p className="font-black text-[#1C3A2A] text-sm">{stay.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{STAY_TYPE_LABELS[stay.type]} · {stay.town}</p>
                  <p className="text-xs font-bold text-[#2d6a4f] mt-1">From UGX {stay.price_from.toLocaleString()} / night</p>
                  <div className="flex gap-2 mt-2">
                    {stay.whatsapp && (
                      <div onClick={(e) => { e.preventDefault(); window.open(`https://wa.me/${stay.whatsapp.replace(/\D/g, "")}`, "_blank"); }}
                        className="flex-1 bg-[#25d366] text-white text-center text-xs font-bold py-1.5 rounded-lg">💬 WhatsApp</div>
                    )}
                    {stay.booking_com_url ? (
                      <div onClick={(e) => { e.preventDefault(); window.open(stay.booking_com_url!, "_blank"); }}
                        className="flex-1 bg-[#003580] text-white text-center text-xs font-bold py-1.5 rounded-lg">🌐 Booking.com</div>
                    ) : (
                      <div className="flex-1 bg-[#1C3A2A] text-white text-center text-xs font-bold py-1.5 rounded-lg">📋 Request</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && (
          <button onClick={loadMore} disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#1C3A2A] py-3 text-sm font-bold text-white disabled:opacity-50">
            {loading ? "Loading..." : "Load more stays →"}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/travel/destinations/[slug]/"
git commit -m "feat(travel): add destination page with filtered stay listing"
```

---

## Task 6: Accommodation Profile Page

**Files:**
- Create: `app/travel/stays/[id]/page.tsx`

- [ ] **Step 1: Create the stay profile page**

Create `app/travel/stays/[id]/page.tsx`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { TravelStay, TravelStayRoom, TravelStayPhoto, TravelDestination } from "@/lib/supabase/travel-types";
import { STAY_TYPE_LABELS } from "@/app/data/travel";
import { SITE_URL } from "@/lib/site";
import RequestToBookForm from "./RequestToBookForm";

export const revalidate = 60;

function makeSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await makeSupabase().from("travel_stays").select("name, description, town").eq("id", id).in("status", ["active", "featured"]).single();
  if (!data) return { title: "Stay Not Found | ZuulaUganda" };
  return {
    title: `${data.name} | ${data.town} Uganda | ZuulaUganda`,
    description: data.description.slice(0, 160),
    alternates: { canonical: `${SITE_URL}/travel/stays/${id}` },
  };
}

export default async function StayProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = makeSupabase();

  const [{ data: stayData }, { data: roomsData }, { data: photosData }] = await Promise.all([
    supabase.from("travel_stays").select("*, travel_destinations(name, slug)").eq("id", id).in("status", ["active", "featured"]).single(),
    supabase.from("travel_stay_rooms").select("*").eq("stay_id", id).order("sort_order"),
    supabase.from("travel_stay_photos").select("*").eq("stay_id", id).order("sort_order"),
  ]);

  if (!stayData) notFound();

  const stay = stayData as TravelStay & { travel_destinations: Pick<TravelDestination, "name" | "slug"> };
  const rooms = (roomsData ?? []) as TravelStayRoom[];
  const photos = (photosData ?? []) as TravelStayPhoto[];
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(stay.name + " " + stay.district + " Uganda")}`;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-500 flex gap-1 flex-wrap">
        <Link href="/travel" className="hover:text-[#1C3A2A]">ZuulaUganda</Link>
        <span>›</span>
        <Link href={`/travel/destinations/${stay.travel_destinations.slug}`} className="hover:text-[#1C3A2A]">{stay.travel_destinations.name}</Link>
        <span>›</span>
        <span className="text-[#1C3A2A] font-semibold truncate">{stay.name}</span>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] px-5 py-8 text-white">
        {stay.status === "featured" && (
          <span className="absolute top-3 right-3 bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-1 rounded-full">⭐ FEATURED</span>
        )}
        <p className="text-xs text-white/50 mb-1">{STAY_TYPE_LABELS[stay.type]} · {stay.town}</p>
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>{stay.name}</h1>
        <p className="text-sm font-bold text-white/80">From UGX {stay.price_from.toLocaleString()} / night</p>
      </div>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="p-3 bg-[#f5f0e8]">
          <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
            <div className="col-span-2 relative rounded-xl overflow-hidden" style={{ height: 140 }}>
              <Image src={photos[0].photo_url} alt={photos[0].caption ?? stay.name} fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              {photos[1] && (
                <div className="relative rounded-xl overflow-hidden flex-1">
                  <Image src={photos[1].photo_url} alt={photos[1].caption ?? stay.name} fill className="object-cover" />
                </div>
              )}
              {photos.length > 2 && (
                <div className="relative rounded-xl overflow-hidden flex-1 bg-black/40 flex items-center justify-center">
                  {photos[2] && <Image src={photos[2].photo_url} alt="" fill className="object-cover opacity-50" />}
                  <span className="relative text-white text-xs font-bold">+{photos.length - 2} more</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-white border-b border-gray-200">
        {stay.whatsapp && (
          <a href={`https://wa.me/${stay.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 bg-[#25d366] text-white rounded-xl py-3 text-xs font-bold">💬 WhatsApp</a>
        )}
        {stay.booking_com_url && (
          <a href={stay.booking_com_url} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 bg-[#003580] text-white rounded-xl py-3 text-xs font-bold">🌐 Booking.com</a>
        )}
        <a href="#request" className="flex flex-col items-center justify-center gap-1 bg-[#1C3A2A] text-white rounded-xl py-3 text-xs font-bold">📋 Request</a>
      </div>

      {/* Info strip */}
      <div className="bg-[#f0f7f0] px-4 py-2.5 border-b border-[#d0e8d0] text-xs text-[#2d6a4f] flex gap-4 flex-wrap">
        <span>{STAY_TYPE_LABELS[stay.type]}</span>
        <span>👥 Up to {stay.capacity} guests</span>
        <span>🔑 Check-in {stay.checkin_time}</span>
        <span>📍 {stay.town}, {stay.district}</span>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {/* About */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">About</p>
          <p className="text-sm text-gray-700 leading-relaxed">{stay.description}</p>
        </div>

        {/* Amenities */}
        {stay.amenities.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {stay.amenities.map((a) => (
                <span key={a} className="bg-[#f0f0f0] text-gray-700 text-xs px-3 py-1.5 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Rooms */}
        {rooms.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Room Types & Prices</p>
            <div className="divide-y divide-gray-100">
              {rooms.map((r) => (
                <div key={r.id} className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-semibold text-[#1C3A2A]">{r.name}</p>
                    <p className="text-xs text-gray-400">Up to {r.capacity} guest{r.capacity > 1 ? "s" : ""}</p>
                  </div>
                  <p className="text-sm font-bold text-[#2d6a4f]">UGX {r.price_per_night.toLocaleString()}/night</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request to Book */}
        <div id="request" className="bg-[#f5f0e8] rounded-xl border border-[#e0d8cc] p-4">
          <p className="text-xs font-bold text-[#1C3A2A] uppercase tracking-wide mb-3">📋 Request to Book</p>
          <RequestToBookForm stayName={stay.name} stayWhatsapp={stay.whatsapp} />
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Location</p>
          <p className="text-sm text-gray-600 mb-3">{stay.town}, {stay.district}, Uganda</p>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="block w-full bg-[#e8f5e8] text-[#2d6a4f] text-sm font-bold text-center py-3 rounded-xl">
            🗺️ Open in Google Maps
          </a>
        </div>

        <Link href={`/travel/destinations/${stay.travel_destinations.slug}`}
          className="block text-center text-sm font-bold text-[#1C3A2A] underline underline-offset-2 pb-4">
          ← Back to {stay.travel_destinations.name}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Request to Book form component**

Create `app/travel/stays/[id]/RequestToBookForm.tsx`:

```typescript
"use client";

import { useState } from "react";

export default function RequestToBookForm({ stayName, stayWhatsapp }: { stayName: string; stayWhatsapp: string }) {
  const [guestName, setGuestName] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("1");
  const [myWhatsapp, setMyWhatsapp] = useState("");

  const fieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white";

  const handleRequest = () => {
    const message = `Hi, I'd like to book ${stayName}. Name: ${guestName}. Check-in: ${checkin}. Check-out: ${checkout}. Guests: ${guests}. My WhatsApp: ${myWhatsapp}.`;
    const url = `https://wa.me/${stayWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const isValid = guestName.trim() && checkin && checkout && myWhatsapp.trim();

  return (
    <div className="space-y-3">
      <input className={fieldClass} placeholder="Your name" value={guestName} onChange={e => setGuestName(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <input className={fieldClass} type="date" placeholder="Check-in" value={checkin} onChange={e => setCheckin(e.target.value)} />
        <input className={fieldClass} type="date" placeholder="Check-out" value={checkout} onChange={e => setCheckout(e.target.value)} />
      </div>
      <input className={fieldClass} type="number" min="1" placeholder="Number of guests" value={guests} onChange={e => setGuests(e.target.value)} />
      <input className={fieldClass} type="tel" placeholder="Your WhatsApp number" value={myWhatsapp} onChange={e => setMyWhatsapp(e.target.value)} />
      <button
        onClick={handleRequest}
        disabled={!isValid}
        className="w-full bg-[#1C3A2A] text-white font-black text-sm py-3 rounded-xl disabled:opacity-40"
      >
        Send Request via WhatsApp →
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/travel/stays/[id]/"
git commit -m "feat(travel): add accommodation profile with Request to Book form"
```

---

## Task 7: Registration Form

**Files:**
- Create: `app/travel/register/page.tsx`
- Create: `app/travel/register/TravelRegisterForm.tsx`

- [ ] **Step 1: Create registration page wrapper**

Create `app/travel/register/page.tsx`:

```typescript
import type { Metadata } from "next";
import TravelRegisterForm from "./TravelRegisterForm";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "List Your Accommodation | ZuulaUganda",
  description: "Register your hotel, guesthouse, lodge, or campsite on ZuulaUganda. Reach travellers across Uganda for free.",
  alternates: { canonical: `${SITE_URL}/travel/register` },
};

export default function TravelRegisterPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>🏨 List Your Place</h1>
        <p className="text-sm text-white/70">Free to list. Reach travellers across Uganda.</p>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <TravelRegisterForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create registration form**

Create `app/travel/register/TravelRegisterForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { STAY_TYPE_LABELS, STAY_AMENITY_OPTIONS, SEED_DESTINATIONS } from "@/app/data/travel";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 7);
}

type RoomDraft = { name: string; capacity: string; price_per_night: string };

export default function TravelRegisterForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [name, setName] = useState("");
  const [type, setType] = useState("guesthouse");
  const [destinationSlug, setDestinationSlug] = useState("");
  const [town, setTown] = useState("");
  const [district, setDistrict] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingComUrl, setBookingComUrl] = useState("");
  const [checkinTime, setCheckinTime] = useState("2:00 PM");
  const [checkoutTime, setCheckoutTime] = useState("11:00 AM");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [amenities, setAmenities] = useState<string[]>([]);

  // Step 3
  const [rooms, setRooms] = useState<RoomDraft[]>([{ name: "", capacity: "2", price_per_night: "" }]);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([""]);

  const fieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white";
  const labelClass = "block text-xs font-bold text-gray-600 mb-1";

  const toggleAmenity = (a: string) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const validateStep1 = () => {
    if (!name.trim()) return "Accommodation name is required.";
    if (!destinationSlug) return "Please select a destination.";
    if (!town.trim()) return "Town/area is required.";
    if (!district.trim()) return "District is required.";
    if (!whatsapp.trim()) return "WhatsApp number is required.";
    if (!capacity) return "Maximum capacity is required.";
    if (!description.trim()) return "Description is required.";
    if (description.length > 500) return "Description must be 500 characters or less.";
    return "";
  };

  const validateStep3 = () => {
    if (rooms.every(r => !r.name.trim())) return "Please add at least one room type.";
    return "";
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    const supabase = getSupabase();

    const dest = SEED_DESTINATIONS.find(d => d.slug === destinationSlug);
    if (!dest) { setError("Invalid destination."); setSubmitting(false); return; }

    // Get destination id
    const { data: destData } = await supabase.from("travel_destinations").select("id").eq("slug", destinationSlug).single();
    if (!destData) { setError("Destination not found. Please try again."); setSubmitting(false); return; }

    const { data: stayData, error: stayError } = await supabase
      .from("travel_stays")
      .insert({
        name: name.trim(),
        slug: slugify(name.trim()),
        destination_id: destData.id,
        type,
        district: district.trim(),
        town: town.trim(),
        description: description.trim(),
        price_from: rooms.filter(r => r.price_per_night).length > 0
          ? Math.min(...rooms.filter(r => r.price_per_night).map(r => parseInt(r.price_per_night)))
          : 0,
        checkin_time: checkinTime,
        checkout_time: checkoutTime,
        capacity: parseInt(capacity),
        whatsapp: whatsapp.trim(),
        phone: phone.trim() || null,
        booking_com_url: bookingComUrl.trim() || null,
        amenities,
        cover_photo_url: coverPhotoUrl.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (stayError || !stayData) { setError("Something went wrong. Please try again."); setSubmitting(false); return; }
    const stayId = stayData.id;

    const validRooms = rooms.filter(r => r.name.trim() && r.price_per_night);
    if (validRooms.length > 0) {
      await supabase.from("travel_stay_rooms").insert(validRooms.map((r, i) => ({
        stay_id: stayId, name: r.name.trim(), capacity: parseInt(r.capacity) || 2,
        price_per_night: parseInt(r.price_per_night), sort_order: i,
      })));
    }

    const validPhotos = photoUrls.filter(u => u.trim());
    if (validPhotos.length > 0) {
      await supabase.from("travel_stay_photos").insert(validPhotos.map((url, i) => ({ stay_id: stayId, photo_url: url.trim(), sort_order: i })));
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-xl font-black text-[#1C3A2A] mb-2">Listing submitted!</h2>
        <p className="text-sm text-gray-600 leading-relaxed">Your listing is under review. We'll contact you on WhatsApp once approved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-[#1C3A2A]" : "bg-gray-200"}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">Step {step} of 4</p>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#1C3A2A]">Basic Info</h2>
          <div><label className={labelClass}>Accommodation name *</label><input className={fieldClass} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bwindi Forest Guesthouse" /></div>
          <div>
            <label className={labelClass}>Type *</label>
            <select className={fieldClass} value={type} onChange={e => setType(e.target.value)}>
              {Object.entries(STAY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Destination *</label>
            <select className={fieldClass} value={destinationSlug} onChange={e => setDestinationSlug(e.target.value)}>
              <option value="">Select destination</option>
              {SEED_DESTINATIONS.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Town / area within destination *</label><input className={fieldClass} value={town} onChange={e => setTown(e.target.value)} placeholder="e.g. Buhoma" /></div>
          <div><label className={labelClass}>District *</label><input className={fieldClass} value={district} onChange={e => setDistrict(e.target.value)} placeholder="e.g. Kanungu" /></div>
          <div><label className={labelClass}>WhatsApp number *</label><input className={fieldClass} type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+256 7XX XXX XXX" /></div>
          <div><label className={labelClass}>Phone number</label><input className={fieldClass} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" /></div>
          <div><label className={labelClass}>Booking.com listing URL (optional — for affiliate)</label><input className={fieldClass} type="url" value={bookingComUrl} onChange={e => setBookingComUrl(e.target.value)} placeholder="https://booking.com/hotel/..." /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Check-in time *</label><input className={fieldClass} value={checkinTime} onChange={e => setCheckinTime(e.target.value)} placeholder="2:00 PM" /></div>
            <div><label className={labelClass}>Check-out time *</label><input className={fieldClass} value={checkoutTime} onChange={e => setCheckoutTime(e.target.value)} placeholder="11:00 AM" /></div>
          </div>
          <div><label className={labelClass}>Max guests *</label><input className={fieldClass} type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="e.g. 20" /></div>
          <div>
            <label className={labelClass}>Description * ({description.length}/500)</label>
            <textarea className={`${fieldClass} resize-none`} rows={4} value={description} onChange={e => setDescription(e.target.value)} maxLength={500} placeholder="Describe your accommodation, location, and what makes it special." />
          </div>
          <button onClick={() => { const e = validateStep1(); if (e) { setError(e); return; } setError(""); setStep(2); }}
            className="w-full rounded-xl bg-[#1C3A2A] py-4 text-sm font-black text-[#F5C842]">Next: Amenities →</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#1C3A2A]">Amenities</h2>
          <p className="text-xs text-gray-500">Select all that apply.</p>
          <div className="grid grid-cols-2 gap-2">
            {STAY_AMENITY_OPTIONS.map(a => (
              <button key={a} onClick={() => toggleAmenity(a)}
                className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-colors ${amenities.includes(a) ? "bg-[#1C3A2A] text-white border-[#1C3A2A]" : "bg-white text-gray-700 border-gray-300"}`}>
                {amenities.includes(a) ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 rounded-xl border-2 border-[#1C3A2A] py-3 text-sm font-bold text-[#1C3A2A]">← Back</button>
            <button onClick={() => { setError(""); setStep(3); }} className="flex-1 rounded-xl bg-[#1C3A2A] py-3 text-sm font-black text-[#F5C842]">Next: Rooms →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#1C3A2A]">Room Types & Photos</h2>
          {rooms.map((r, i) => (
            <div key={i} className="bg-[#f5f0e8] rounded-xl p-3 space-y-2">
              <div className="flex justify-between">
                <p className="text-xs font-bold text-[#1C3A2A]">Room Type {i + 1}</p>
                {rooms.length > 1 && <button onClick={() => setRooms(rooms.filter((_, idx) => idx !== i))} className="text-xs text-red-500">Remove</button>}
              </div>
              <input className={fieldClass} value={r.name} onChange={e => setRooms(rooms.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Room name (e.g. Standard Room, Family Cabin)" />
              <div className="grid grid-cols-2 gap-2">
                <input className={fieldClass} type="number" value={r.capacity} onChange={e => setRooms(rooms.map((x, idx) => idx === i ? { ...x, capacity: e.target.value } : x))} placeholder="Max guests" />
                <input className={fieldClass} type="number" value={r.price_per_night} onChange={e => setRooms(rooms.map((x, idx) => idx === i ? { ...x, price_per_night: e.target.value } : x))} placeholder="Price/night (UGX)" />
              </div>
            </div>
          ))}
          <button onClick={() => setRooms([...rooms, { name: "", capacity: "2", price_per_night: "" }])}
            className="w-full rounded-xl border-2 border-dashed border-[#1C3A2A] py-3 text-sm font-bold text-[#1C3A2A]">
            + Add room type
          </button>
          <div>
            <label className={labelClass}>Cover photo URL</label>
            <input className={fieldClass} value={coverPhotoUrl} onChange={e => setCoverPhotoUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>Gallery photos (paste URLs)</label>
            {photoUrls.map((url, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className={fieldClass} value={url} onChange={e => setPhotoUrls(photoUrls.map((u, idx) => idx === i ? e.target.value : u))} placeholder={`Photo ${i + 1} URL`} />
                {photoUrls.length > 1 && <button onClick={() => setPhotoUrls(photoUrls.filter((_, idx) => idx !== i))} className="text-xs text-red-500 px-2">✕</button>}
              </div>
            ))}
            {photoUrls.length < 10 && <button onClick={() => setPhotoUrls([...photoUrls, ""])} className="text-xs font-bold text-[#1C3A2A] underline">+ Add photo</button>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 rounded-xl border-2 border-[#1C3A2A] py-3 text-sm font-bold text-[#1C3A2A]">← Back</button>
            <button onClick={() => { const e = validateStep3(); if (e) { setError(e); return; } setError(""); setStep(4); }}
              className="flex-1 rounded-xl bg-[#1C3A2A] py-3 text-sm font-black text-[#F5C842]">Next: Review →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#1C3A2A]">Review & Submit</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            <p><span className="font-bold">Name:</span> {name}</p>
            <p><span className="font-bold">Type:</span> {STAY_TYPE_LABELS[type]}</p>
            <p><span className="font-bold">Destination:</span> {destinationSlug}</p>
            <p><span className="font-bold">Location:</span> {town}, {district}</p>
            <p><span className="font-bold">WhatsApp:</span> {whatsapp}</p>
            <p><span className="font-bold">Capacity:</span> {capacity} guests</p>
            <p><span className="font-bold">Amenities:</span> {amenities.length} selected</p>
            <p><span className="font-bold">Room types:</span> {rooms.filter(r => r.name.trim()).length} added</p>
            <p><span className="font-bold">Photos:</span> {photoUrls.filter(u => u.trim()).length} added</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="flex-1 rounded-xl border-2 border-[#1C3A2A] py-3 text-sm font-bold text-[#1C3A2A]">← Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-xl bg-[#1C3A2A] py-3 text-sm font-black text-[#F5C842] disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit for Review →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/travel/register/
git commit -m "feat(travel): add accommodation registration form"
```

---

## Task 8: Admin Panel

**Files:**
- Create: `app/admin/travel/page.tsx`
- Create: `app/admin/travel/AdminTravelClient.tsx`
- Create: `app/api/admin/travel/approve/route.ts`
- Create: `app/api/admin/travel/reject/route.ts`
- Create: `app/api/admin/travel/feature/route.ts`

- [ ] **Step 1: Create admin page**

Create `app/admin/travel/page.tsx`:

```typescript
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminTravelClient from "./AdminTravelClient";

export default async function AdminTravelPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) redirect("/admin/login");

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: pending } = await supabase.from("travel_stays").select("id,name,type,town,whatsapp,created_at").eq("status", "pending").order("created_at", { ascending: false });
  const { data: active } = await supabase.from("travel_stays").select("id,name,type,town,status,created_at").in("status", ["active", "featured"]).order("created_at", { ascending: false });

  return <AdminTravelClient pending={pending ?? []} active={active ?? []} />;
}
```

- [ ] **Step 2: Create admin client**

Create `app/admin/travel/AdminTravelClient.tsx`:

```typescript
"use client";

import { useState } from "react";

type StayRow = { id: string; name: string; type: string; town: string; whatsapp?: string; status?: string; created_at: string };

export default function AdminTravelClient({ pending, active }: { pending: StayRow[]; active: StayRow[] }) {
  const [tab, setTab] = useState<"pending" | "active">("pending");
  const [pendingList, setPendingList] = useState(pending);
  const [activeList, setActiveList] = useState(active);
  const [loading, setLoading] = useState<string | null>(null);

  const approve = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/travel/approve", { method: "POST", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    setPendingList(p => p.filter(s => s.id !== id));
    setLoading(null);
  };

  const reject = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/travel/reject", { method: "POST", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    setPendingList(p => p.filter(s => s.id !== id));
    setLoading(null);
  };

  const toggleFeatured = async (id: string, currentStatus: string) => {
    setLoading(id);
    const newStatus = currentStatus === "featured" ? "active" : "featured";
    await fetch("/api/admin/travel/feature", { method: "POST", body: JSON.stringify({ id, status: newStatus }), headers: { "Content-Type": "application/json" } });
    setActiveList(a => a.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4">
      <h1 className="text-xl font-black text-[#1C3A2A] mb-4">🏨 Travel Admin — ZuulaUganda</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("pending")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "pending" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>Pending ({pendingList.length})</button>
        <button onClick={() => setTab("active")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "active" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>Active ({activeList.length})</button>
      </div>
      {tab === "pending" && (
        <div className="space-y-3">
          {pendingList.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No pending stays.</p>}
          {pendingList.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="font-black text-[#1C3A2A]">{s.name}</p>
              <p className="text-xs text-gray-500 mt-1">{s.type} · {s.town}</p>
              {s.whatsapp && <p className="text-xs text-gray-500">📱 {s.whatsapp}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => approve(s.id)} disabled={loading === s.id} className="flex-1 bg-[#1C3A2A] text-white rounded-lg py-2 text-sm font-bold disabled:opacity-50">✅ Approve</button>
                <button onClick={() => reject(s.id)} disabled={loading === s.id} className="flex-1 bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-bold disabled:opacity-50">❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "active" && (
        <div className="space-y-3">
          {activeList.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div><p className="font-black text-[#1C3A2A]">{s.name}</p><p className="text-xs text-gray-500 mt-1">{s.type} · {s.town}</p></div>
                {s.status === "featured" && <span className="bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-0.5 rounded-full">⭐ FEATURED</span>}
              </div>
              <button onClick={() => toggleFeatured(s.id, s.status!)} disabled={loading === s.id}
                className={`mt-3 w-full rounded-lg py-2 text-sm font-bold disabled:opacity-50 ${s.status === "featured" ? "bg-gray-100 text-gray-600" : "bg-[#F5C842] text-[#1C3A2A]"}`}>
                {s.status === "featured" ? "Remove Featured" : "⭐ Make Featured"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create admin API routes**

Create `app/api/admin/travel/approve/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await supabase.from("travel_stays").update({ status: "active" }).eq("id", id);
  return NextResponse.json({ ok: true });
}
```

Create `app/api/admin/travel/reject/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await supabase.from("travel_stays").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
```

Create `app/api/admin/travel/feature/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await supabase.from("travel_stays").update({ status }).eq("id", id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/travel/ app/api/admin/travel/
git commit -m "feat(travel): add travel admin panel and API routes"
```

---

## Task 9: Sitemap & Final Build

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Add travel routes to sitemap**

Open `app/sitemap.ts` and add:

```typescript
{ url: `${SITE_URL}/travel`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
{ url: `${SITE_URL}/travel/destinations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
{ url: `${SITE_URL}/travel/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
```

- [ ] **Step 2: Build check**

```bash
cd d:\projects\uganda-business-ideas
npm run build
```

Expected: Build completes with no TypeScript errors.

- [ ] **Step 3: Smoke test**

Start dev server: `npm run dev`

Check these URLs:
- `http://localhost:3000/travel` — home page with destination grid loads
- `http://localhost:3000/travel/destinations` — all 12 destinations show (after seeding SQL)
- `http://localhost:3000/travel/destinations/bwindi` — Bwindi page loads with filters
- `http://localhost:3000/travel/register` — form loads, all 4 steps work
- `http://localhost:3000/admin/travel` — redirects to login if not authenticated

- [ ] **Step 4: Final commit**

```bash
git add app/sitemap.ts
git commit -m "feat(travel): complete ZuulaUganda travel app implementation"
```
