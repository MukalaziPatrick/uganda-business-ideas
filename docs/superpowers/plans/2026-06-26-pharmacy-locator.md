# Pharmacy Locator Vertical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compliance-safe "Find a Licensed Pharmacy" directory at `/pharmacy` to the Business Yoo app — facility info + WhatsApp/Call contact only, NDA licence badge, auto-hide on lapsed licence; no drug names, prices, or ordering.

**Architecture:** Follows the existing Business Yoo vertical pattern (laundry/salons). A new Supabase table `pharmacy_businesses` (migration + RLS), a typed query helper in `lib/pharmacy/queries.ts` (unit-tested), a server-rendered page `app/pharmacy/page.tsx`, three admin status endpoints under `app/api/admin/pharmacy/`, and one entry added to the `/apps` directory grid. Homepage and main nav are untouched (homepage freeze).

**Tech Stack:** Next.js 16 (App Router, server components), Supabase (PostgreSQL, anon key for public read / service-role for admin), TypeScript, Tailwind CSS 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-26-pharmacy-locator-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `supabase/migrations/20260626000001_pharmacy.sql` | Create `pharmacy_businesses` table + indexes |
| `supabase/migrations/20260626000002_pharmacy_rls.sql` | Enable RLS + public-read / admin-manage policies |
| `lib/supabase/pharmacy-types.ts` | `PharmacyBusiness` type + status type |
| `lib/pharmacy/queries.ts` | `getActivePharmacies()` — the public query (active/featured + valid licence) |
| `lib/pharmacy/queries.test.ts` | Unit tests for the query's compliance/filter contract |
| `app/pharmacy/page.tsx` | Public directory page (card grid, disclaimer, CTAs) |
| `app/api/admin/pharmacy/approve/route.ts` | Set status = active |
| `app/api/admin/pharmacy/feature/route.ts` | Set status = featured |
| `app/api/admin/pharmacy/reject/route.ts` | Set status = pending |
| `app/apps/page.tsx` (modify) | Add pharmacy entry to `BASE_APPS` |
| `supabase/migrations/20260626000003_pharmacy_seed.sql` | Seed real licensed pharmacies (placeholders flagged) |

---

## Task 1: Database migration — `pharmacy_businesses` table

**Files:**
- Create: `supabase/migrations/20260626000001_pharmacy.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260626000001_pharmacy.sql`:

```sql
-- Pharmacy Locator vertical: facility-level directory only.
-- Compliance: NO drug names, prices, stock, or ordering fields by design.
-- See docs/superpowers/specs/2026-06-26-pharmacy-locator-design.md

create table if not exists public.pharmacy_businesses (
  id                     uuid        primary key default gen_random_uuid(),
  slug                   text        not null unique,
  name                   text        not null,

  -- Location
  region                 text,
  district               text,
  service_area           text,
  address                text,

  -- Contact (the only action — off-platform)
  whatsapp               text        not null,
  phone                  text,

  -- Facility info (no drug names / prices / stock)
  hours                  text,
  is_24_hour             boolean     not null default false,
  has_delivery           boolean     not null default false,
  supervising_pharmacist text,

  -- Compliance / verification
  nda_licence_no         text,
  licence_expiry         date,

  -- Lifecycle
  status                 text        not null default 'pending'
                                     check (status in ('pending', 'active', 'featured')),
  created_at             timestamptz not null default now()
);

create index if not exists pharmacy_businesses_status_idx
  on public.pharmacy_businesses (status);
create index if not exists pharmacy_businesses_slug_idx
  on public.pharmacy_businesses (slug);
create index if not exists pharmacy_businesses_licence_expiry_idx
  on public.pharmacy_businesses (licence_expiry);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260626000001_pharmacy.sql
git commit -m "feat(pharmacy): add pharmacy_businesses table migration"
```

---

## Task 2: Database migration — RLS policies

**Files:**
- Create: `supabase/migrations/20260626000002_pharmacy_rls.sql`

This mirrors the ideas RLS pattern (`20260617000002_ideas_rls.sql`), which uses the existing `public.is_admin()` helper. Public anon read is restricted to active/featured rows with a non-lapsed licence; all writes go through the service-role admin client (bypasses RLS).

- [ ] **Step 1: Write the RLS migration**

Create `supabase/migrations/20260626000002_pharmacy_rls.sql`:

```sql
-- Enable RLS on pharmacy_businesses. App admin writes go through the
-- service-role client (bypasses RLS); these policies govern direct anon access.

alter table public.pharmacy_businesses enable row level security;

-- Public can read only active/featured pharmacies with a valid (non-lapsed) licence.
-- A null licence_expiry is treated as valid (licence date unknown but pharmacy approved).
drop policy if exists "Public can read active pharmacies" on public.pharmacy_businesses;
create policy "Public can read active pharmacies"
  on public.pharmacy_businesses for select
  using (
    status in ('active', 'featured')
    and (licence_expiry is null or licence_expiry >= current_date)
  );

-- Admins manage all rows.
drop policy if exists "Admins can manage pharmacies" on public.pharmacy_businesses;
create policy "Admins can manage pharmacies"
  on public.pharmacy_businesses for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260626000002_pharmacy_rls.sql
git commit -m "feat(pharmacy): add RLS policies for pharmacy_businesses"
```

---

## Task 3: TypeScript type

**Files:**
- Create: `lib/supabase/pharmacy-types.ts`

- [ ] **Step 1: Write the type**

Create `lib/supabase/pharmacy-types.ts`:

```typescript
export type PharmacyBusinessStatus = 'pending' | 'active' | 'featured';

export interface PharmacyBusiness {
  id: string;
  slug: string;
  name: string;

  // Location
  region: string | null;
  district: string | null;
  service_area: string | null;
  address: string | null;

  // Contact (the only action — off-platform)
  whatsapp: string;
  phone: string | null;

  // Facility info (no drug names / prices / stock)
  hours: string | null;
  is_24_hour: boolean;
  has_delivery: boolean;
  supervising_pharmacist: string | null;

  // Compliance / verification
  nda_licence_no: string | null;
  licence_expiry: string | null;

  // Lifecycle
  status: PharmacyBusinessStatus;
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/supabase/pharmacy-types.ts
git commit -m "feat(pharmacy): add PharmacyBusiness type"
```

---

## Task 4: Public query helper (TDD)

The public query is extracted into a helper so its compliance contract is unit-testable (mirrors how `lib/ideas/queries.ts` is tested). It uses the anon key and selects only the columns the card needs.

**Files:**
- Create: `lib/pharmacy/queries.ts`
- Test: `lib/pharmacy/queries.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/pharmacy/queries.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

import { getActivePharmacies } from './queries';
import { createClient } from '@supabase/supabase-js';

const mockCreate = createClient as ReturnType<typeof vi.fn>;

function makeBuilder() {
  const builder: Record<string, unknown> = {
    select: vi.fn(),
    in: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };
  (builder.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.in as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.or as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.order as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.limit as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getActivePharmacies compliance contract', () => {
  it('restricts to active/featured status', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    await getActivePharmacies();

    expect(builder.in).toHaveBeenCalledWith('status', ['active', 'featured']);
  });

  it('filters out lapsed licences (licence_expiry in the future or null only)', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    await getActivePharmacies();

    const orArg = (builder.or as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(orArg).toContain('licence_expiry.is.null');
    expect(orArg).toContain('licence_expiry.gte.');
  });

  it('returns [] when DB has no matching rows', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    const result = await getActivePharmacies();

    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/pharmacy/queries.test.ts`
Expected: FAIL — cannot find module `./queries`.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/pharmacy/queries.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { PharmacyBusiness } from '@/lib/supabase/pharmacy-types';

export type PharmacyCard = Pick<
  PharmacyBusiness,
  | 'id'
  | 'slug'
  | 'name'
  | 'district'
  | 'service_area'
  | 'whatsapp'
  | 'phone'
  | 'hours'
  | 'is_24_hour'
  | 'has_delivery'
  | 'supervising_pharmacist'
  | 'nda_licence_no'
  | 'status'
>;

const CARD_COLUMNS =
  'id,slug,name,district,service_area,whatsapp,phone,hours,is_24_hour,has_delivery,supervising_pharmacist,nda_licence_no,status';

// Returns active/featured pharmacies with a valid (non-lapsed) NDA licence,
// featured first. Compliance: no drug/price/stock columns are ever selected.
export async function getActivePharmacies(): Promise<PharmacyCard[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data } = await supabase
    .from('pharmacy_businesses')
    .select(CARD_COLUMNS)
    .in('status', ['active', 'featured'])
    .or(`licence_expiry.is.null,licence_expiry.gte.${today}`)
    .order('status', { ascending: false }) // featured before active
    .order('created_at', { ascending: false })
    .limit(20);

  return (data ?? []) as PharmacyCard[];
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/pharmacy/queries.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/pharmacy/queries.ts lib/pharmacy/queries.test.ts
git commit -m "feat(pharmacy): add getActivePharmacies query with licence-validity filter"
```

---

## Task 5: Public directory page

**Files:**
- Create: `app/pharmacy/page.tsx`

This follows the laundry page structure (`app/pharmacy` ← `app/laundry/page.tsx`) but uses `getActivePharmacies()`, adds the compliance banner, the NDA licence badge, service tags, and two contact buttons (WhatsApp + Call).

- [ ] **Step 1: Write the page**

Create `app/pharmacy/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getActivePharmacies } from "@/lib/pharmacy/queries";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find a Licensed Pharmacy in Uganda | Business Yoo",
  description:
    "A directory of NDA-licensed pharmacies across Uganda. Find verified pharmacies near you and contact them directly by WhatsApp or phone.",
  alternates: { canonical: `${SITE_URL}/pharmacy` },
  openGraph: {
    title: "Find a Licensed Pharmacy in Uganda | Business Yoo",
    description: "A directory of NDA-licensed pharmacies across Uganda.",
    url: `${SITE_URL}/pharmacy`,
    siteName: "Business Yoo",
    locale: "en_UG",
    type: "website",
  },
};

export default async function PharmacyPage() {
  const pharmacies = await getActivePharmacies();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Find a Licensed Pharmacy</h1>
        <p className="text-gray-500 mb-6">Verified, NDA-licensed pharmacies near you.</p>

        {/* Compliance disclaimer — required */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          This is an informational directory. Business Yoo does not sell or dispense
          medicines. We list licensed pharmacies only — for prescriptions and orders,
          contact the pharmacy directly.
        </div>

        {pharmacies.length === 0 && (
          <p className="text-gray-400">
            We&apos;re verifying pharmacies in your area. Check back soon.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {pharmacies.map((p) => {
            const waNumber = p.whatsapp.replace(/[^0-9]/g, "");
            const telNumber = (p.phone ?? p.whatsapp).replace(/[^0-9+]/g, "");
            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-gray-200 bg-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-[#0A2540] text-lg">{p.name}</div>
                  {p.status === "featured" && (
                    <span className="text-xs font-semibold text-[#3DA9FC] bg-[#eef6ff] px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {p.nda_licence_no && (
                  <div className="text-xs font-medium text-green-700 bg-green-50 inline-block px-2 py-0.5 rounded-full mt-2">
                    ✓ NDA Licensed · #{p.nda_licence_no}
                  </div>
                )}

                {p.service_area && (
                  <div className="text-xs text-gray-400 mt-2">📍 {p.service_area}</div>
                )}
                {p.hours && <div className="text-xs text-gray-400 mt-1">🕐 {p.hours}</div>}

                {(p.is_24_hour || p.has_delivery) && (
                  <div className="flex gap-2 mt-2">
                    {p.is_24_hour && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        24-Hour
                      </span>
                    )}
                    {p.has_delivery && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        🛵 Delivery available
                      </span>
                    )}
                  </div>
                )}

                {p.supervising_pharmacist && (
                  <div className="text-xs text-gray-400 mt-2">
                    Supervising pharmacist: {p.supervising_pharmacist}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <a
                    href={`https://wa.me/${waNumber}`}
                    className="flex-1 text-center text-sm font-medium text-white bg-[#25D366] rounded-xl py-2 hover:opacity-90 transition-opacity"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${telNumber}`}
                    className="flex-1 text-center text-sm font-medium text-[#0A2540] border border-gray-300 rounded-xl py-2 hover:bg-gray-50 transition-colors"
                  >
                    📞 Call
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds, `/pharmacy` appears in the route list (it will render the empty state until the DB is seeded).

- [ ] **Step 3: Commit**

```bash
git add app/pharmacy/page.tsx
git commit -m "feat(pharmacy): add public pharmacy directory page"
```

---

## Task 6: Admin status endpoints

**Files:**
- Create: `app/api/admin/pharmacy/approve/route.ts`
- Create: `app/api/admin/pharmacy/feature/route.ts`
- Create: `app/api/admin/pharmacy/reject/route.ts`

These copy the salons admin route exactly (`app/api/admin/salons/approve/route.ts`): the `admin_token` cookie must equal `ADMIN_SECRET`, then the service-role client updates the row's status.

- [ ] **Step 1: Write the approve route**

Create `app/api/admin/pharmacy/approve/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await supabase.from("pharmacy_businesses").update({ status: "active" }).eq("id", id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Write the feature route**

Create `app/api/admin/pharmacy/feature/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await supabase.from("pharmacy_businesses").update({ status: "featured" }).eq("id", id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Write the reject route**

Create `app/api/admin/pharmacy/reject/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await supabase.from("pharmacy_businesses").update({ status: "pending" }).eq("id", id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds; the three `/api/admin/pharmacy/*` routes appear in the route list.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/pharmacy/approve/route.ts app/api/admin/pharmacy/feature/route.ts app/api/admin/pharmacy/reject/route.ts
git commit -m "feat(pharmacy): add admin approve/feature/reject endpoints"
```

---

## Task 7: Add pharmacy to the `/apps` directory grid

**Files:**
- Modify: `app/apps/page.tsx` (the `BASE_APPS` array, currently ending at line 62)

Per the homepage freeze, the pharmacy entry goes in `/apps` only — never `app/page.tsx` or the main nav.

- [ ] **Step 1: Add the pharmacy entry to `BASE_APPS`**

In `app/apps/page.tsx`, add this object as the last element of the `BASE_APPS` array, immediately after the `/jobs` entry (which ends with `},` at line 61):

```typescript
  {
    href: '/pharmacy',
    emoji: '💊',
    name: 'Find a Pharmacy',
    tagline: 'Licensed pharmacies near you',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
```

The resulting array tail should read:

```typescript
  {
    href: '/jobs',
    emoji: '👷',
    name: 'Find Work',
    tagline: 'Browse jobs and post your skills',
    color: '#1a56db',
    bg: '#eff6ff',
  },
  {
    href: '/pharmacy',
    emoji: '💊',
    name: 'Find a Pharmacy',
    tagline: 'Licensed pharmacies near you',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
];
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds; no type errors.

- [ ] **Step 3: Commit**

```bash
git add app/apps/page.tsx
git commit -m "feat(pharmacy): list pharmacy directory in /apps grid"
```

---

## Task 8: Seed migration — real licensed pharmacies

**Files:**
- Create: `supabase/migrations/20260626000003_pharmacy_seed.sql`

This seeds a few **real** Kampala pharmacies. Each `nda_licence_no` and `licence_expiry` is a **placeholder that Patrick must confirm against the NDA/PSU public register before this migration is run against production.** Until confirmed, leave `nda_licence_no` and `licence_expiry` NULL (the pharmacy still shows, just without the licence badge) rather than inventing a number.

- [ ] **Step 1: Write the seed migration**

Create `supabase/migrations/20260626000003_pharmacy_seed.sql`:

```sql
-- Seed real Kampala pharmacies. status='active' so they appear immediately.
-- IMPORTANT: nda_licence_no and licence_expiry are left NULL until Patrick
-- confirms each licence against the NDA/PSU public register. Do NOT invent
-- licence numbers — a NULL licence simply hides the "NDA Licensed" badge.
-- Replace whatsapp/phone with the pharmacy's real, verified numbers before running.

insert into public.pharmacy_businesses
  (slug, name, district, service_area, address, whatsapp, phone, hours, is_24_hour, has_delivery, status)
values
  ('rocket-health-pharmacy', 'Rocket Health Pharmacy', 'Kampala', 'Greater Kampala',
   'Kampala', '256000000000', '256000000000', 'Mon–Sun 24 hours', true, true, 'active'),
  ('happy-pills-pharmacy', 'Happy Pills Pharmacy', 'Wakiso', 'Nansana, Wakiso',
   'Nansana', '256000000000', '256000000000', 'Mon–Sat 8am–9pm', false, true, 'active'),
  ('ecopharm', 'Ecopharm', 'Kampala', 'Kampala',
   'Kampala', '256000000000', '256000000000', 'Mon–Sat 8am–8pm', false, true, 'active')
on conflict (slug) do nothing;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260626000003_pharmacy_seed.sql
git commit -m "feat(pharmacy): seed initial Kampala pharmacies (licence numbers pending verification)"
```

---

## Task 9: Apply migrations and final verification

This is the only task that touches the live Supabase project. Per the project guardrail, verify live data after applying — do not trust local state.

- [ ] **Step 1: Apply the migrations**

Run: `npm run supabase:push`
Expected: the three new migrations (`20260626000001_pharmacy`, `_002_pharmacy_rls`, `_003_pharmacy_seed`) apply without error.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including `lib/pharmacy/queries.test.ts` (3 tests).

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: build succeeds; `/pharmacy` and `/api/admin/pharmacy/*` routes present.

- [ ] **Step 4: Verify live data (do not trust local state)**

Confirm the seeded rows are actually live and visible to the public anon role. Either query via the Supabase dashboard/SQL editor, or load `/pharmacy` on the running dev server (`npm run dev`) and confirm the three seeded pharmacies render with WhatsApp/Call buttons and that the compliance disclaimer is shown.
Expected: 3 pharmacy cards visible; no licence badge yet (licence numbers still NULL/pending verification); empty state gone.

- [ ] **Step 5: Final commit (if any working-tree changes remain)**

```bash
git add -A
git commit -m "chore(pharmacy): apply migrations and verify directory live"
```

(If the working tree is clean after Step 4, skip this commit.)

---

## Notes for the implementer

- **Homepage freeze:** never edit `app/page.tsx` or the main nav in `app/layout.tsx`. The pharmacy entry belongs only in `app/apps/page.tsx`.
- **Compliance is the point:** do not add drug names, prices, stock levels, discounts, ordering, cart, or payment — these are explicitly out of scope for legal reasons (see spec §2, §10). If a future task asks for them, that requires a fresh spec.
- **Licence numbers:** never invent an `nda_licence_no`. Leave NULL until verified against the NDA/PSU register.
- **Pattern source files** to copy idioms from: `app/laundry/page.tsx`, `app/api/admin/salons/approve/route.ts`, `lib/ideas/queries.test.ts`, `supabase/migrations/20260617000002_ideas_rls.sql`.
```
