# ZuulaUganda Travel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the fully-coded ZuulaUganda travel section to a live Supabase database and seed the 12 destinations — making the feature live. All code (frontend, admin, API routes, migration files) is already written.

**Architecture:** All route files (`/travel`, `/travel/destinations/[slug]`, `/travel/stays/[id]`, `/travel/register`, `/admin/travel`) plus their client components and admin API routes are already written. The only missing pieces are: (1) the Supabase migration creating the 4 travel tables, (2) seeding the 12 destinations, (3) the admin Destinations management tab, (4) `next.config.ts` image domain allowlist, and (5) a homepage card linking to `/travel`.

**Tech Stack:** Next.js 16 App Router, Supabase (PostgreSQL + anon/service-role keys), Tailwind CSS 4, TypeScript 5

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/202605230001_travel.sql` | **CREATE** | 4 travel tables + indexes + RLS policies |
| `supabase/seeds/travel_destinations.sql` | **CREATE** | INSERT 12 destinations from `SEED_DESTINATIONS` |
| `next.config.ts` | **MODIFY** | Add `images.remotePatterns` for external photo URLs |
| `app/admin/travel/AdminTravelClient.tsx` | **MODIFY** | Add Destinations tab (edit description, activities, sort_order) |
| `app/api/admin/travel/update-destination/route.ts` | **CREATE** | PATCH endpoint for destination edits |
| `app/HomeClient.tsx` | **MODIFY** | Add ZuulaUganda card to homepage feature grid |

**Already complete — do not touch:**
- `app/travel/page.tsx` + `TravelHomeClient.tsx`
- `app/travel/destinations/page.tsx`
- `app/travel/destinations/[slug]/page.tsx` + `DestinationClient.tsx`
- `app/travel/stays/[id]/page.tsx` + `RequestToBookForm.tsx`
- `app/travel/register/page.tsx` + `TravelRegisterForm.tsx`
- `app/admin/travel/page.tsx`
- `app/api/admin/travel/approve/route.ts`
- `app/api/admin/travel/feature/route.ts`
- `app/api/admin/travel/reject/route.ts`
- `lib/supabase/travel-types.ts`
- `app/data/travel.ts`

---

## Task 1: Supabase Migration — 4 Travel Tables

**Files:**
- Create: `supabase/migrations/202605230001_travel.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/202605230001_travel.sql

-- ─── Enum types ──────────────────────────────────────────────────────────────
create type public.stay_status as enum ('pending', 'active', 'featured');
create type public.stay_type   as enum ('hotel', 'guesthouse', 'lodge', 'airbnb', 'camping');

-- ─── travel_destinations ─────────────────────────────────────────────────────
create table public.travel_destinations (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  slug            text        not null unique,
  region          text        not null,
  description     text        not null,
  activities      text[]      not null default '{}',
  cover_photo_url text,
  sort_order      integer     not null default 0,
  is_featured     boolean     not null default false
);

create index travel_destinations_sort_idx on public.travel_destinations(sort_order);

alter table public.travel_destinations enable row level security;

create policy "Public can read destinations"
  on public.travel_destinations for select using (true);

create policy "Service role can manage destinations"
  on public.travel_destinations for all using (auth.role() = 'service_role');

-- ─── travel_stays ─────────────────────────────────────────────────────────────
create table public.travel_stays (
  id              uuid            primary key default gen_random_uuid(),
  name            text            not null,
  slug            text            not null unique,
  destination_id  uuid            not null references public.travel_destinations(id) on delete cascade,
  type            public.stay_type not null,
  district        text            not null,
  town            text            not null,
  description     text            not null check (char_length(description) <= 500),
  price_from      integer         not null default 0,
  checkin_time    text            not null,
  checkout_time   text            not null,
  capacity        integer         not null,
  whatsapp        text            not null,
  phone           text,
  booking_com_url text,
  amenities       text[]          not null default '{}',
  cover_photo_url text,
  status          public.stay_status not null default 'pending',
  created_at      timestamptz     not null default now()
);

create index travel_stays_destination_idx on public.travel_stays(destination_id);
create index travel_stays_status_idx      on public.travel_stays(status);
create index travel_stays_type_idx        on public.travel_stays(type);
create index travel_stays_price_idx       on public.travel_stays(price_from);

alter table public.travel_stays enable row level security;

create policy "Public can read active stays"
  on public.travel_stays for select
  using (status in ('active', 'featured'));

create policy "Public can insert stays"
  on public.travel_stays for insert
  with check (true);

create policy "Service role can manage stays"
  on public.travel_stays for all using (auth.role() = 'service_role');

-- ─── travel_stay_rooms ────────────────────────────────────────────────────────
create table public.travel_stay_rooms (
  id             uuid    primary key default gen_random_uuid(),
  stay_id        uuid    not null references public.travel_stays(id) on delete cascade,
  name           text    not null,
  price_per_night integer not null,
  capacity       integer not null,
  sort_order     integer not null default 0
);

create index travel_stay_rooms_stay_idx on public.travel_stay_rooms(stay_id);

alter table public.travel_stay_rooms enable row level security;

create policy "Public can read rooms"
  on public.travel_stay_rooms for select using (true);

create policy "Public can insert rooms"
  on public.travel_stay_rooms for insert
  with check (true);

create policy "Service role can manage rooms"
  on public.travel_stay_rooms for all using (auth.role() = 'service_role');

-- ─── travel_stay_photos ───────────────────────────────────────────────────────
create table public.travel_stay_photos (
  id         uuid  primary key default gen_random_uuid(),
  stay_id    uuid  not null references public.travel_stays(id) on delete cascade,
  photo_url  text  not null,
  caption    text,
  sort_order integer not null default 0
);

create index travel_stay_photos_stay_idx on public.travel_stay_photos(stay_id);

alter table public.travel_stay_photos enable row level security;

create policy "Public can read photos"
  on public.travel_stay_photos for select using (true);

create policy "Public can insert photos"
  on public.travel_stay_photos for insert
  with check (true);

create policy "Service role can manage photos"
  on public.travel_stay_photos for all using (auth.role() = 'service_role');
```

- [ ] **Step 2: Apply the migration via Supabase CLI**

```bash
npx supabase db push
```

Expected output: migration applied, no errors.

If not using CLI, paste the SQL into the Supabase Dashboard → SQL Editor and run it.

- [ ] **Step 3: Verify tables exist in Supabase Dashboard**

In Supabase Dashboard → Table Editor, confirm these four tables appear:
- `travel_destinations`
- `travel_stays`
- `travel_stay_rooms`
- `travel_stay_photos`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/202605230001_travel.sql
git commit -m "feat: add travel tables migration (ZuulaUganda)"
```

---

## Task 2: Seed the 12 Destinations

**Files:**
- Create: `supabase/seeds/travel_destinations.sql`

- [ ] **Step 1: Create the seed file**

```sql
-- supabase/seeds/travel_destinations.sql
-- Run this once after the migration to populate destination data.

insert into public.travel_destinations (name, slug, region, description, activities, sort_order, is_featured)
values
  ('Bwindi Impenetrable Forest', 'bwindi', 'South Western Uganda',
   'Home to half the world''s mountain gorillas. A UNESCO World Heritage Site and Uganda''s most iconic destination for gorilla trekking.',
   array['Gorilla Trekking','Bird Watching','Nature Walks'], 1, true),

  ('Jinja', 'jinja', 'Eastern Uganda',
   'The adventure capital of East Africa, sitting at the source of the River Nile. Famous for white-water rafting, kayaking, and bungee jumping.',
   array['White Water Rafting','Kayaking','Bungee Jumping','Nile Cruises'], 2, true),

  ('Murchison Falls National Park', 'murchison-falls', 'Northern Uganda',
   'Uganda''s largest national park, home to the world''s most powerful waterfall and abundant wildlife including elephants, hippos, and lions.',
   array['Safari Drives','Nile Boat Cruise','Waterfall Hike','Sport Fishing'], 3, true),

  ('Queen Elizabeth National Park', 'queen-elizabeth', 'Western Uganda',
   'A diverse park offering savannah, forests, and wetlands. Famous for tree-climbing lions, chimpanzees, and the scenic Kazinga Channel.',
   array['Game Drives','Boat Safari','Chimpanzee Tracking','Bird Watching'], 4, false),

  ('Lake Bunyonyi', 'lake-bunyonyi', 'South Western Uganda',
   'One of the most beautiful lakes in Africa, dotted with 29 islands and surrounded by terraced hills. Perfect for canoeing and relaxation.',
   array['Canoeing','Island Hopping','Swimming','Cultural Tours'], 5, false),

  ('Fort Portal', 'fort-portal', 'Western Uganda',
   'Gateway to Kibale Forest and the crater lakes region. A charming town surrounded by tea plantations and volcanic crater lakes.',
   array['Chimpanzee Tracking','Crater Lake Tours','Tea Plantation Visits','Bird Watching'], 6, true),

  ('Rwenzori Mountains', 'rwenzori', 'Western Uganda',
   'The legendary Mountains of the Moon, offering challenging treks through afro-alpine vegetation to glaciated peaks straddling the equator.',
   array['Mountain Trekking','Bird Watching','Glacier Views','Waterfalls'], 7, false),

  ('Kampala', 'kampala', 'Central Uganda',
   'Uganda''s vibrant capital city, built on seven hills. A bustling hub of culture, food, nightlife, and business with rich historical sites.',
   array['City Tours','Food & Markets','Nightlife','Historical Sites','Shopping'], 8, false),

  ('Entebbe', 'entebbe', 'Central Uganda',
   'Uganda''s lakeside city on the shores of Lake Victoria. Home to the international airport, the Uganda Wildlife Education Centre, and beautiful botanical gardens.',
   array['Lake Victoria Cruises','Uganda Wildlife Education Centre','Botanical Gardens','Beach Relaxation'], 9, false),

  ('Mbale', 'mbale', 'Eastern Uganda',
   'Eastern Uganda''s main city at the foot of Mount Elgon. A gateway for trekking, waterfalls, and exploring the Bugisu cultural heartland.',
   array['Mount Elgon Trekking','Sipi Falls','Cultural Tours','Coffee Farm Visits'], 10, false),

  ('Gulu', 'gulu', 'Northern Uganda',
   'Northern Uganda''s largest city, now a growing hub of commerce and culture. Gateway to Murchison Falls and the Acholi cultural heritage.',
   array['Cultural Heritage Tours','Murchison Falls Access','Local Markets','Community Tourism'], 11, false),

  ('Kabale', 'kabale', 'South Western Uganda',
   'The gateway to Bwindi and Lake Bunyonyi, nicknamed "Little Switzerland" for its dramatic hilly landscape and cool highland climate.',
   array['Lake Bunyonyi Access','Bwindi Gateway','Hiking','Cultural Visits'], 12, false)
;
```

- [ ] **Step 2: Run the seed in Supabase Dashboard → SQL Editor**

Paste the contents of `supabase/seeds/travel_destinations.sql` and click Run.

Expected result: 12 rows inserted, no errors.

- [ ] **Step 3: Verify in Dashboard**

In Table Editor → `travel_destinations`, confirm 12 rows are present with correct slugs.

- [ ] **Step 4: Commit**

```bash
git add supabase/seeds/travel_destinations.sql
git commit -m "feat: seed 12 ZuulaUganda travel destinations"
```

---

## Task 3: Configure `next.config.ts` for External Images

**Files:**
- Modify: `next.config.ts`

**Context:** The codebase uses `next/image` with external URLs pasted by accommodation owners. Without a domain allowlist, Next.js throws a 400 error on every `<Image src="https://...">`. The current `next.config.ts` is empty.

- [ ] **Step 1: Read the current file**

Current content of `next.config.ts`:
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```

- [ ] **Step 2: Add `images.remotePatterns`**

Replace the full contents of `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },
};

export default nextConfig;
```

This uses wildcard patterns to allow any external image URL. This is appropriate for a user-submitted content platform where owners paste their own photo URLs.

- [ ] **Step 3: Restart dev server and verify no image errors**

```bash
npm run dev
```

Navigate to `/travel` and check the browser console — no `Invalid src` errors.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat: allow external image domains for ZuulaUganda photo URLs"
```

---

## Task 4: Admin Destinations Tab

**Files:**
- Modify: `app/admin/travel/AdminTravelClient.tsx`
- Modify: `app/admin/travel/page.tsx`
- Create: `app/api/admin/travel/update-destination/route.ts`

**Context:** The spec requires a "Destinations tab" in `/admin/travel` to edit destination descriptions, photos, activity tags, and sort order. Currently `AdminTravelClient.tsx` only has Pending and Active tabs.

- [ ] **Step 1: Create the update-destination API route**

Create `app/api/admin/travel/update-destination/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, description, cover_photo_url, activities, sort_order, is_featured } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("travel_destinations")
    .update({ description, cover_photo_url: cover_photo_url || null, activities, sort_order, is_featured })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Update `app/admin/travel/page.tsx` to fetch destinations**

Replace the current content of `app/admin/travel/page.tsx`:

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminTravelClient from "./AdminTravelClient";
import type { TravelDestination } from "@/lib/supabase/travel-types";

export default async function AdminTravelPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) redirect("/admin/login");

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const [{ data: pending }, { data: active }, { data: destinations }] = await Promise.all([
    supabase.from("travel_stays").select("id,name,type,town,whatsapp,created_at").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("travel_stays").select("id,name,type,town,status,created_at").in("status", ["active", "featured"]).order("created_at", { ascending: false }),
    supabase.from("travel_destinations").select("*").order("sort_order"),
  ]);

  return (
    <AdminTravelClient
      pending={pending ?? []}
      active={active ?? []}
      destinations={(destinations ?? []) as TravelDestination[]}
    />
  );
}
```

- [ ] **Step 3: Update `app/admin/travel/AdminTravelClient.tsx` to add Destinations tab**

Replace the full contents of `app/admin/travel/AdminTravelClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { TravelDestination } from "@/lib/supabase/travel-types";

type StayRow = { id: string; name: string; type: string; town: string; whatsapp?: string; status?: string; created_at: string };

export default function AdminTravelClient({
  pending,
  active,
  destinations,
}: {
  pending: StayRow[];
  active: StayRow[];
  destinations: TravelDestination[];
}) {
  const [tab, setTab] = useState<"pending" | "active" | "destinations">("pending");
  const [pendingList, setPendingList] = useState(pending);
  const [activeList, setActiveList] = useState(active);
  const [destList, setDestList] = useState(destinations);
  const [loading, setLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TravelDestination>>({});

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

  const startEdit = (dest: TravelDestination) => {
    setEditingId(dest.id);
    setEditForm({
      description: dest.description,
      cover_photo_url: dest.cover_photo_url ?? "",
      activities: dest.activities,
      sort_order: dest.sort_order,
      is_featured: dest.is_featured,
    });
  };

  const saveDestination = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/travel/update-destination", {
      method: "POST",
      body: JSON.stringify({ id, ...editForm, activities: editForm.activities ?? [] }),
      headers: { "Content-Type": "application/json" },
    });
    setDestList(dl => dl.map(d => d.id === id ? { ...d, ...editForm, activities: editForm.activities ?? d.activities } as TravelDestination : d));
    setEditingId(null);
    setLoading(null);
  };

  const fieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1C3A2A] bg-white";

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4">
      <h1 className="text-xl font-black text-[#1C3A2A] mb-4">🏨 Travel Admin — ZuulaUganda</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setTab("pending")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "pending" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>Pending ({pendingList.length})</button>
        <button onClick={() => setTab("active")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "active" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>Active ({activeList.length})</button>
        <button onClick={() => setTab("destinations")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "destinations" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>Destinations ({destList.length})</button>
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
          {activeList.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No active stays yet.</p>}
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

      {tab === "destinations" && (
        <div className="space-y-3">
          {destList.map(d => (
            <div key={d.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-black text-[#1C3A2A]">{d.name}</p>
                  <p className="text-xs text-gray-400">/{d.slug} · order {d.sort_order}</p>
                </div>
                {d.is_featured && <span className="bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-0.5 rounded-full">🔥 HOT</span>}
              </div>

              {editingId === d.id ? (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Description</label>
                    <textarea className={`${fieldClass} resize-none`} rows={3} value={editForm.description ?? ""} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Cover photo URL</label>
                    <input className={fieldClass} value={editForm.cover_photo_url ?? ""} onChange={e => setEditForm(f => ({ ...f, cover_photo_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Activities (comma-separated)</label>
                    <input className={fieldClass} value={(editForm.activities ?? []).join(", ")}
                      onChange={e => setEditForm(f => ({ ...f, activities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Sort order</label>
                      <input className={fieldClass} type="number" value={editForm.sort_order ?? 0} onChange={e => setEditForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={editForm.is_featured ?? false} onChange={e => setEditForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4" />
                        <span className="text-xs font-bold text-gray-600">🔥 Featured (HOT badge)</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-bold text-gray-600">Cancel</button>
                    <button onClick={() => saveDestination(d.id)} disabled={loading === d.id}
                      className="flex-1 bg-[#1C3A2A] text-white rounded-lg py-2 text-sm font-bold disabled:opacity-50">
                      {loading === d.id ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{d.description}</p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {d.activities.slice(0, 3).map(a => <span key={a} className="bg-[#f0f7f0] text-[#2d6a4f] text-[10px] px-2 py-0.5 rounded-full">{a}</span>)}
                  </div>
                  <button onClick={() => startEdit(d)} className="mt-3 w-full border border-[#1C3A2A] text-[#1C3A2A] rounded-lg py-2 text-sm font-bold">✏️ Edit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run dev server and navigate to `/admin/travel`**

```bash
npm run dev
```

Open `http://localhost:3000/admin/travel`. Confirm three tabs appear: Pending, Active, Destinations. Click Destinations — all 12 destinations should be listed. Click Edit on any destination, change a field, click Save. Reload the page — changes should persist.

- [ ] **Step 5: Commit**

```bash
git add app/admin/travel/AdminTravelClient.tsx app/admin/travel/page.tsx app/api/admin/travel/update-destination/route.ts
git commit -m "feat: add Destinations tab to ZuulaUganda admin panel"
```

---

## Task 5: Add ZuulaUganda Entry Point on Homepage

**Files:**
- Modify: `app/HomeClient.tsx`

**Context:** The homepage (`/`) shows feature cards for the various Business Yoo sections. `/travel` has no entry point yet. We need to add a card so users can discover ZuulaUganda.

- [ ] **Step 1: Find the feature card section in HomeClient.tsx**

Search for the string `"salons"` in `app/HomeClient.tsx` — this is where the existing directory section cards live.

Run:
```bash
grep -n "salons\|pitch\|/jobs\|href.*/" app/HomeClient.tsx | head -20
```

Identify the pattern used for existing cards (look for the block that renders section links).

- [ ] **Step 2: Add the ZuulaUganda card**

In `app/HomeClient.tsx`, find the block that renders feature cards (look for the element containing "Restaurants, salons & more across Uganda" — that's around line 162). Add a ZuulaUganda card following the same pattern as adjacent cards.

The card to insert (match surrounding element structure exactly):

```tsx
<Link href="/travel"
  className="block bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] rounded-2xl p-4 text-white">
  <p className="text-2xl mb-1">🏨</p>
  <p className="font-black text-[#F5C842] text-sm">ZuulaUganda</p>
  <p className="text-xs text-white/70 leading-relaxed mt-1">Find places to stay across Uganda.</p>
</Link>
```

> **Note:** Read the actual surrounding card code in `app/HomeClient.tsx` before inserting. Match the exact className pattern of adjacent cards — don't use the snippet above verbatim if surrounding cards use different class names. The snippet shows the content and intent; the structure must mirror existing cards.

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Confirm the ZuulaUganda card appears in the feature grid. Click it — it should navigate to `/travel`.

- [ ] **Step 4: Commit**

```bash
git add app/HomeClient.tsx
git commit -m "feat: add ZuulaUganda entry card to Business Yoo homepage"
```

---

## Task 6: End-to-End Smoke Test

**Files:** None (read-only verification)

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test the full user journey**

| Route | What to check |
|-------|--------------|
| `/travel` | 12 destination cards appear; search filters by name |
| `/travel/destinations` | All 12 destinations listed |
| `/travel/destinations/bwindi` | Hero with Bwindi text, empty stays list with "0 places to stay" |
| `/travel/destinations/jinja` | Filter dropdowns work (type, budget) |
| `/travel/register` | 4-step form loads; fill all steps and submit → success screen; check Supabase `travel_stays` table shows `status=pending` |
| `/admin/travel` | Pending tab shows the submission just made; click Approve → it disappears from Pending |
| `/travel/destinations/jinja` | After approving, the new stay appears (may need hard refresh due to `revalidate=60`; force with `router.refresh()` or wait 60s) |
| `/travel/stays/[id]` | Stay profile loads with all sections; Request to Book form opens WhatsApp correctly |
| `/admin/travel` → Destinations tab | Edit a destination description → save → reload page → change persists |

- [ ] **Step 3: Check browser console for errors**

No `Invalid src` errors (image domains configured), no TypeScript errors in terminal, no Supabase `permission denied` errors.

- [ ] **Step 4: Commit if any minor fixes were needed**

```bash
git add -p
git commit -m "fix: ZuulaUganda smoke test fixes"
```

---

## Self-Review

### Spec Coverage Check

| Spec requirement | Covered by |
|-----------------|-----------|
| `/travel` home with search + destination grid | Already built — `TravelHomeClient.tsx` |
| `/travel/destinations` browse all | Already built — `destinations/page.tsx` |
| `/travel/destinations/[slug]` with hero, filters, stay list | Already built — `DestinationClient.tsx` |
| `/travel/stays/[id]` full profile | Already built — `stays/[id]/page.tsx` |
| `/travel/register` 4-step form | Already built — `TravelRegisterForm.tsx` |
| `/admin/travel` approve/reject/feature | Already built — `AdminTravelClient.tsx` |
| **Admin Destinations tab** | Task 4 |
| WhatsApp contact button | Already built |
| Booking.com affiliate link | Already built |
| Request to Book form | Already built — `RequestToBookForm.tsx` |
| Featured badge (gold ⭐) | Already built |
| `status = pending` on submit | Already built |
| **Supabase tables created** | Task 1 |
| **12 destinations seeded** | Task 2 |
| **External image URLs work** | Task 3 |
| **Homepage entry point** | Task 5 |
| SEO metadata per page | Already built |
| `revalidate = 60` | Already set |
| Load more (pagination) | Already built — `DestinationClient.tsx` |

### No placeholder check

All steps contain actual code, actual commands, and expected output. No "TBD" or "implement later" items.

### Type consistency check

- `TravelDestination` interface defined in `lib/supabase/travel-types.ts` — all components import from there.
- `StayStatus`, `StayType` enums match the SQL enum types created in Task 1.
- `update-destination` API route uses `TravelDestination` fields verbatim from the type file.
- `AdminTravelClient` receives `destinations: TravelDestination[]` — matches what `page.tsx` fetches.
