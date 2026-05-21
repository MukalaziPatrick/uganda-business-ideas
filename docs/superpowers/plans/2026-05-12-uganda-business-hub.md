# Uganda Business Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Uganda Business Ideas homepage into a three-pillar platform (Ideas | Businesses | Jobs) and build a full /jobs section with job board, worker profiles, and post-a-job form — all Uganda-specific.

**Architecture:** The existing `uganda-business-ideas` Next.js app gets a redesigned homepage and new `/jobs/*` pages. A new Supabase migration adds `jobs` and `worker_profiles` tables. LocateUG (`uganda-map`) stays separate and is linked from the homepage. No user auth in this phase — all contact via WhatsApp/phone.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Supabase (`@supabase/supabase-js`), TypeScript

---

## File Map

### New files
- `supabase/migrations/202605120001_jobs_and_workers.sql` — creates `jobs` + `worker_profiles` tables
- `lib/supabase.ts` — browser Supabase client (reusable across new pages)
- `lib/constants/skills.ts` — Uganda skills list + districts list
- `app/jobs/page.tsx` — server component: fetches jobs + workers, renders JobsClient
- `app/jobs/JobsClient.tsx` — client component: tabs, filters, cards
- `app/jobs/post/page.tsx` — server component shell for post-a-job
- `app/jobs/post/PostJobForm.tsx` — client component: post-a-job form
- `app/jobs/worker/new/page.tsx` — server component shell for worker registration
- `app/jobs/worker/new/WorkerForm.tsx` — client component: worker profile form
- `app/jobs/worker/[id]/page.tsx` — server component: public worker profile page
- `app/api/jobs/route.ts` — POST new job listing
- `app/api/workers/route.ts` — POST new worker profile

### Modified files
- `app/HomeClient.tsx` — add three-pillar hero, jobs teaser strip, update nav
- `app/layout.tsx` — no change needed

---

## Task 1: Supabase migration — jobs + worker_profiles tables

**Files:**
- Create: `supabase/migrations/202605120001_jobs_and_workers.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/202605120001_jobs_and_workers.sql

create table if not exists public.jobs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  skill_category   text not null,
  district         text not null,
  town             text,
  employer_name    text not null,
  contact_whatsapp text,
  contact_phone    text,
  contact_walkin   text,
  pay_amount       integer,
  pay_period       text check (pay_period in ('daily','weekly','monthly')),
  job_type         text check (job_type in ('permanent','casual','contract')),
  gender_pref      text check (gender_pref in ('male','female','any')),
  min_education    text check (min_education in ('none','ple','uce','uace','certificate','diploma','degree')),
  accommodation    text check (accommodation in ('yes','no','negotiable')),
  food_provided    text check (food_provided in ('yes','no','negotiable')),
  languages        text[],
  description      text,
  status           text not null default 'pending' check (status in ('pending','active','rejected')),
  featured         boolean not null default false,
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default now() + interval '30 days'
);

create index if not exists jobs_status_idx       on public.jobs(status);
create index if not exists jobs_district_idx     on public.jobs(district);
create index if not exists jobs_skill_idx        on public.jobs(skill_category);
create index if not exists jobs_featured_idx     on public.jobs(featured, created_at desc);

create table if not exists public.worker_profiles (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  skill_primary    text not null,
  skills_extra     text[],
  district         text not null,
  town             text,
  contact_whatsapp text,
  contact_phone    text,
  experience_years integer,
  pay_expectation  integer,
  pay_period       text check (pay_period in ('daily','weekly','monthly')),
  job_type_pref    text[],
  education        text check (education in ('none','ple','uce','uace','certificate','diploma','degree')),
  languages        text[],
  own_tools        boolean,
  willing_to_travel boolean,
  bio              text check (char_length(bio) <= 100),
  available        boolean not null default true,
  status           text not null default 'active' check (status in ('active','hidden')),
  created_at       timestamptz not null default now()
);

create index if not exists workers_district_idx  on public.worker_profiles(district);
create index if not exists workers_skill_idx     on public.worker_profiles(skill_primary);
create index if not exists workers_available_idx on public.worker_profiles(available, status);

-- Allow public read of active jobs and active workers
alter table public.jobs enable row level security;
alter table public.worker_profiles enable row level security;

create policy "public can read active jobs"
  on public.jobs for select
  using (status = 'active');

create policy "public can insert jobs"
  on public.jobs for insert
  with check (true);

create policy "public can read active workers"
  on public.worker_profiles for select
  using (status = 'active');

create policy "public can insert worker profiles"
  on public.worker_profiles for insert
  with check (true);
```

- [ ] **Step 2: Run in Supabase SQL Editor**

Open your Supabase project dashboard → SQL Editor → paste the full migration → click Run.

Expected: "Success. No rows returned."

- [ ] **Step 3: Verify tables exist**

In Supabase Table Editor, confirm `jobs` and `worker_profiles` appear with the correct columns.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/202605120001_jobs_and_workers.sql
git commit -m "feat: add jobs and worker_profiles tables"
```

---

## Task 2: Supabase client + shared constants

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/constants/skills.ts`

- [ ] **Step 1: Create `lib/supabase.ts`**

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

- [ ] **Step 2: Check env vars exist**

Open `.env.local` (or `.env`) and confirm these two vars are set:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

If not set, get them from Supabase → Project Settings → API.

- [ ] **Step 3: Create `lib/constants/skills.ts`**

```typescript
// lib/constants/skills.ts

export const SKILL_CATEGORIES: Record<string, string[]> = {
  "Construction & Trades": ["Carpenter","Mason","Painter","Plumber","Electrician","Welder","Roofer","Tiler"],
  "Transport":             ["Boda rider","Taxi driver","Truck driver","Tuk-tuk driver"],
  "Domestic":              ["House cleaner","Cook","Nanny / Babysitter","Gardener","Laundry"],
  "Healthcare":            ["Nurse","Clinical officer","Lab technician","Pharmacist","Midwife"],
  "Security":              ["Security guard","Watchman"],
  "Agriculture":           ["Farm worker","Irrigation tech","Poultry worker","Dairy worker"],
  "Hospitality":           ["Waiter","Bartender","Hotel receptionist","Chef"],
  "Digital & Office":      ["Data entry","Receptionist","Accountant","Graphic designer","Social media"],
  "Retail":                ["Shop attendant","Cashier","Market vendor"],
  "Education":             ["Teacher (primary)","Teacher (secondary)","Tutor"],
  "Beauty":                ["Hairdresser","Barber","Nail technician","Makeup artist"],
};

export const ALL_SKILLS: string[] = Object.values(SKILL_CATEGORIES).flat();

export const UGANDA_DISTRICTS: string[] = [
  "Abim","Adjumani","Agago","Alebtong","Amolatar","Amudat","Amuria","Amuru",
  "Apac","Arua","Budaka","Bududa","Bugiri","Buhweju","Buikwe","Bukedea",
  "Bukomansimbi","Bukwa","Bulambuli","Buliisa","Bundibugyo","Bunyangabu",
  "Bushenyi","Busia","Butaleja","Butebo","Buvuma","Buyende","Dokolo",
  "Gomba","Gulu","Hoima","Ibanda","Iganga","Isingiro","Jinja","Kaabong",
  "Kabale","Kabarole","Kaberamaido","Kagadi","Kakumiro","Kalaki","Kalangala",
  "Kaliro","Kalungu","Kampala","Kamuli","Kamwenge","Kanungu","Kapchorwa",
  "Kapelebyong","Karenga","Kasanda","Kasese","Katakwi","Kayunga","Kazo",
  "Kibale","Kiboga","Kibuku","Kikuube","Kiruhura","Kiryandongo","Kisoro",
  "Kitagwenda","Kitgum","Koboko","Kole","Kotido","Kumi","Kwania","Kween",
  "Kyankwanzi","Kyegegwa","Kyenjojo","Kyotera","Lamwo","Lira","Luuka",
  "Luwero","Lwengo","Lyantonde","Madi-Okollo","Manafwa","Maracha","Masaka",
  "Masindi","Mayuge","Mbale","Mbarara","Mitooma","Mityana","Moroto","Moyo",
  "Mpigi","Mubende","Mukono","Nabilatuk","Nakapiripirit","Nakaseke","Nakasongola",
  "Namayingo","Namisindwa","Namutumba","Napak","Nebbi","Ngora","Ntoroko",
  "Ntungamo","Nwoya","Obongi","Omoro","Otuke","Oyam","Pader","Pakwach",
  "Pallisa","Rakai","Rubanda","Rubirizi","Rukiga","Rukungiri","Rwampara",
  "Sembabule","Serere","Sheema","Sironko","Soroti","Tororo","Wakiso",
  "Yumbe","Zombo",
];

export const EDUCATION_LEVELS = [
  { value: "none",        label: "None required" },
  { value: "ple",         label: "PLE (Primary)" },
  { value: "uce",         label: "UCE / O-Level" },
  { value: "uace",        label: "UACE / A-Level" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma",     label: "Diploma" },
  { value: "degree",      label: "Degree" },
];

export const LANGUAGES = ["Luganda","English","Swahili","Runyankole","Acholi","Lusoga","Ateso","Lugbara","Luo"];

export const JOB_TYPES = [
  { value: "permanent", label: "Permanent" },
  { value: "casual",    label: "Casual (by the day)" },
  { value: "contract",  label: "Contract (fixed period)" },
];

export const PAY_PERIODS = [
  { value: "daily",   label: "Per day" },
  { value: "weekly",  label: "Per week" },
  { value: "monthly", label: "Per month" },
];
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase.ts lib/constants/skills.ts
git commit -m "feat: supabase client + Uganda skills/districts constants"
```

---

## Task 3: API routes — POST job + POST worker

**Files:**
- Create: `app/api/jobs/route.ts`
- Create: `app/api/workers/route.ts`

- [ ] **Step 1: Create `app/api/jobs/route.ts`**

```typescript
// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();

  const required = ["title", "skill_category", "district", "employer_name"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  if (!body.contact_whatsapp && !body.contact_phone && !body.contact_walkin) {
    return NextResponse.json({ error: "At least one contact method required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("jobs")
    .insert({
      title:            body.title,
      skill_category:   body.skill_category,
      district:         body.district,
      town:             body.town ?? null,
      employer_name:    body.employer_name,
      contact_whatsapp: body.contact_whatsapp ?? null,
      contact_phone:    body.contact_phone ?? null,
      contact_walkin:   body.contact_walkin ?? null,
      pay_amount:       body.pay_amount ? Number(body.pay_amount) : null,
      pay_period:       body.pay_period ?? null,
      job_type:         body.job_type ?? null,
      gender_pref:      body.gender_pref ?? null,
      min_education:    body.min_education ?? null,
      accommodation:    body.accommodation ?? null,
      food_provided:    body.food_provided ?? null,
      languages:        body.languages ?? null,
      description:      body.description ?? null,
      status:           "pending",
      featured:         false,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
```

- [ ] **Step 2: Create `app/api/workers/route.ts`**

```typescript
// app/api/workers/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();

  const required = ["name", "skill_primary", "district"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  if (!body.contact_whatsapp && !body.contact_phone) {
    return NextResponse.json({ error: "At least one contact method required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("worker_profiles")
    .insert({
      name:              body.name,
      skill_primary:     body.skill_primary,
      skills_extra:      body.skills_extra ?? null,
      district:          body.district,
      town:              body.town ?? null,
      contact_whatsapp:  body.contact_whatsapp ?? null,
      contact_phone:     body.contact_phone ?? null,
      experience_years:  body.experience_years ? Number(body.experience_years) : null,
      pay_expectation:   body.pay_expectation ? Number(body.pay_expectation) : null,
      pay_period:        body.pay_period ?? null,
      job_type_pref:     body.job_type_pref ?? null,
      education:         body.education ?? null,
      languages:         body.languages ?? null,
      own_tools:         body.own_tools ?? null,
      willing_to_travel: body.willing_to_travel ?? null,
      bio:               body.bio ?? null,
      available:         true,
      status:            "active",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
```

- [ ] **Step 3: Start dev server and test both routes**

```bash
npm run dev
```

In a new terminal:
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Carpenter","skill_category":"Carpenter","district":"Kampala","employer_name":"Test Co","contact_whatsapp":"256700000000"}'
```
Expected: `{"id":"<uuid>"}` with status 201.

```bash
curl -X POST http://localhost:3000/api/workers \
  -H "Content-Type: application/json" \
  -d '{"name":"Okello James","skill_primary":"Carpenter","district":"Kampala","contact_whatsapp":"256700000001"}'
```
Expected: `{"id":"<uuid>"}` with status 201.

- [ ] **Step 4: Verify rows in Supabase**

Open Supabase → Table Editor → `jobs` — confirm the test row is there with `status = 'pending'`.
Open `worker_profiles` — confirm row with `status = 'active'`.

- [ ] **Step 5: Commit**

```bash
git add app/api/jobs/route.ts app/api/workers/route.ts
git commit -m "feat: POST /api/jobs and POST /api/workers routes"
```

---

## Task 4: Post-a-Job form (`/jobs/post`)

**Files:**
- Create: `app/jobs/post/PostJobForm.tsx`
- Create: `app/jobs/post/page.tsx`

- [ ] **Step 1: Create `app/jobs/post/PostJobForm.tsx`**

```typescript
// app/jobs/post/PostJobForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_SKILLS, UGANDA_DISTRICTS, EDUCATION_LEVELS, LANGUAGES, JOB_TYPES, PAY_PERIODS } from "@/lib/constants/skills";

const OPTIONAL_FIELDS = [
  { key: "pay",           label: "Pay amount & period" },
  { key: "job_type",      label: "Job type (Permanent / Casual / Contract)" },
  { key: "gender_pref",   label: "Gender preference" },
  { key: "min_education", label: "Minimum education" },
  { key: "accommodation", label: "Accommodation provided" },
  { key: "food_provided", label: "Food provided" },
  { key: "languages",     label: "Languages required" },
  { key: "description",   label: "Additional description" },
];

export default function PostJobForm() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [enabledOptionals, setEnabledOptionals] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "", skill_category: "", district: "", town: "", employer_name: "",
    contact_whatsapp: "", contact_phone: "", contact_walkin: "",
    pay_amount: "", pay_period: "", job_type: "", gender_pref: "",
    min_education: "", accommodation: "", food_provided: "",
    languages: [] as string[], description: "",
  });

  function toggle(field: string) {
    setEnabledOptionals(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  }

  function set(field: string, value: string | string[]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.contact_whatsapp && !form.contact_phone && !form.contact_walkin) {
      setError("Please provide at least one contact method.");
      return;
    }
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      title: form.title, skill_category: form.skill_category,
      district: form.district, town: form.town || undefined,
      employer_name: form.employer_name,
      contact_whatsapp: form.contact_whatsapp || undefined,
      contact_phone: form.contact_phone || undefined,
      contact_walkin: form.contact_walkin || undefined,
    };
    if (enabledOptionals.includes("pay")) {
      payload.pay_amount = form.pay_amount;
      payload.pay_period = form.pay_period;
    }
    if (enabledOptionals.includes("job_type"))      payload.job_type      = form.job_type;
    if (enabledOptionals.includes("gender_pref"))   payload.gender_pref   = form.gender_pref;
    if (enabledOptionals.includes("min_education")) payload.min_education = form.min_education;
    if (enabledOptionals.includes("accommodation")) payload.accommodation = form.accommodation;
    if (enabledOptionals.includes("food_provided")) payload.food_provided = form.food_provided;
    if (enabledOptionals.includes("languages"))     payload.languages     = form.languages;
    if (enabledOptionals.includes("description"))   payload.description   = form.description;

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Job submitted!</h1>
        <p className="text-slate-500 mb-6">Your job will go live after review — usually within 24 hours.</p>
        <div className="rounded-2xl bg-violet-50 border border-violet-200 p-5 text-left mb-6">
          <p className="text-sm font-semibold text-violet-900 mb-1">⭐ Get Featured Placement</p>
          <p className="text-sm text-violet-700">Send <strong>UGX 20,000</strong> via WhatsApp to get your job shown at the top of results with a Featured badge.</p>
          <a
            href="https://wa.me/256700000000?text=Hi%2C%20I%20want%20to%20feature%20my%20job%20listing"
            target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
          >
            📲 Pay via WhatsApp
          </a>
        </div>
        <button onClick={() => router.push("/jobs")} className="text-sm text-slate-500 underline">
          Back to jobs
        </button>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-black text-slate-900 mb-1">Post a Job</h1>
      <p className="text-sm text-slate-500 mb-8">Free to post. Goes live after review.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Required fields */}
        <div>
          <label className={labelCls}>Job Title *</label>
          <input required maxLength={60} value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="e.g. Experienced Carpenter Needed" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Skill Category *</label>
          <select required value={form.skill_category} onChange={e => set("skill_category", e.target.value)} className={inputCls}>
            <option value="">Select a skill...</option>
            {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>District *</label>
            <select required value={form.district} onChange={e => set("district", e.target.value)} className={inputCls}>
              <option value="">Select district...</option>
              {UGANDA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Town / Stage / Area</label>
            <input value={form.town} onChange={e => set("town", e.target.value)}
              placeholder="e.g. Bwaise, Nakawa" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Your Name / Business Name *</label>
          <input required value={form.employer_name} onChange={e => set("employer_name", e.target.value)}
            placeholder="e.g. Mukalazi Hardware" className={inputCls} />
        </div>

        {/* Contact — at least one required */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-3">Contact Method * (at least one)</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>WhatsApp Number</label>
              <input type="tel" value={form.contact_whatsapp} onChange={e => set("contact_whatsapp", e.target.value)}
                placeholder="256700000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)}
                placeholder="0700000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Walk-in Address</label>
              <input value={form.contact_walkin} onChange={e => set("contact_walkin", e.target.value)}
                placeholder="e.g. Plot 5, Kampala Road, Nakawa" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Optional fields selector */}
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-xs font-semibold text-violet-800 mb-3">Add optional details (tick what you want to show)</p>
          <div className="flex flex-col gap-2">
            {OPTIONAL_FIELDS.map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={enabledOptionals.includes(f.key)}
                  onChange={() => toggle(f.key)}
                  className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                <span className="text-sm text-slate-700">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditional optional fields */}
        {enabledOptionals.includes("pay") && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Pay Amount (UGX)</label>
              <input type="number" value={form.pay_amount} onChange={e => set("pay_amount", e.target.value)}
                placeholder="e.g. 80000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pay Period</label>
              <select value={form.pay_period} onChange={e => set("pay_period", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {PAY_PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
        )}
        {enabledOptionals.includes("job_type") && (
          <div>
            <label className={labelCls}>Job Type</label>
            <select value={form.job_type} onChange={e => set("job_type", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              {JOB_TYPES.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
            </select>
          </div>
        )}
        {enabledOptionals.includes("gender_pref") && (
          <div>
            <label className={labelCls}>Gender Preference</label>
            <select value={form.gender_pref} onChange={e => set("gender_pref", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              <option value="any">No preference</option>
              <option value="male">Male preferred</option>
              <option value="female">Female preferred</option>
            </select>
          </div>
        )}
        {enabledOptionals.includes("min_education") && (
          <div>
            <label className={labelCls}>Minimum Education</label>
            <select value={form.min_education} onChange={e => set("min_education", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              {EDUCATION_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
        )}
        {enabledOptionals.includes("accommodation") && (
          <div>
            <label className={labelCls}>Accommodation Provided</label>
            <select value={form.accommodation} onChange={e => set("accommodation", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>
        )}
        {enabledOptionals.includes("food_provided") && (
          <div>
            <label className={labelCls}>Food Provided</label>
            <select value={form.food_provided} onChange={e => set("food_provided", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>
        )}
        {enabledOptionals.includes("languages") && (
          <div>
            <label className={labelCls}>Languages Required</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <label key={lang} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox"
                    checked={form.languages.includes(lang)}
                    onChange={() => set("languages", form.languages.includes(lang)
                      ? form.languages.filter(l => l !== lang)
                      : [...form.languages, lang]
                    )}
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                  <span className="text-sm text-slate-700">{lang}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {enabledOptionals.includes("description") && (
          <div>
            <label className={labelCls}>Additional Description</label>
            <textarea maxLength={300} rows={3} value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Any extra details about the job..." className={inputCls} />
            <p className="text-xs text-slate-400 mt-1">{form.description.length}/300</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 active:scale-95 disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit Job →"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/jobs/post/page.tsx`**

```typescript
// app/jobs/post/page.tsx
import type { Metadata } from "next";
import PostJobForm from "./PostJobForm";

export const metadata: Metadata = {
  title: "Post a Job | Uganda Business Hub",
  description: "Post a job vacancy in Uganda. Free to list. Reach job seekers in your district.",
};

export default function PostJobPage() {
  return <PostJobForm />;
}
```

- [ ] **Step 3: Test in browser**

Navigate to `http://localhost:3000/jobs/post`. Fill in required fields and submit. Expect success screen. Check Supabase `jobs` table for the new row with `status = 'pending'`.

- [ ] **Step 4: Commit**

```bash
git add app/jobs/post/PostJobForm.tsx app/jobs/post/page.tsx
git commit -m "feat: post-a-job form at /jobs/post"
```

---

## Task 5: Worker registration form (`/jobs/worker/new`)

**Files:**
- Create: `app/jobs/worker/new/WorkerForm.tsx`
- Create: `app/jobs/worker/new/page.tsx`

- [ ] **Step 1: Create `app/jobs/worker/new/WorkerForm.tsx`**

```typescript
// app/jobs/worker/new/WorkerForm.tsx
"use client";

import { useState } from "react";
import { ALL_SKILLS, UGANDA_DISTRICTS, EDUCATION_LEVELS, LANGUAGES, JOB_TYPES, PAY_PERIODS } from "@/lib/constants/skills";

const OPTIONAL_FIELDS = [
  { key: "skills_extra",      label: "Additional skills (up to 2 more)" },
  { key: "experience_years",  label: "Years of experience" },
  { key: "pay_expectation",   label: "Pay expectation" },
  { key: "job_type_pref",     label: "Job type preference" },
  { key: "education",         label: "Education level" },
  { key: "languages",         label: "Languages spoken" },
  { key: "own_tools",         label: "I own my tools / equipment" },
  { key: "willing_to_travel", label: "Willing to travel for work" },
  { key: "bio",               label: "Short bio (max 100 characters)" },
];

export default function WorkerForm() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [enabledOptionals, setEnabledOptionals] = useState<string[]>([]);
  const [profileId, setProfileId] = useState("");

  const [form, setForm] = useState({
    name: "", skill_primary: "", district: "", town: "",
    contact_whatsapp: "", contact_phone: "",
    skills_extra: [] as string[], experience_years: "",
    pay_expectation: "", pay_period: "", job_type_pref: [] as string[],
    education: "", languages: [] as string[],
    own_tools: false, willing_to_travel: false, bio: "",
  });

  function toggle(field: string) {
    setEnabledOptionals(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  }

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.contact_whatsapp && !form.contact_phone) {
      setError("Please provide at least one contact method.");
      return;
    }
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      name: form.name, skill_primary: form.skill_primary,
      district: form.district, town: form.town || undefined,
      contact_whatsapp: form.contact_whatsapp || undefined,
      contact_phone: form.contact_phone || undefined,
    };
    if (enabledOptionals.includes("skills_extra") && form.skills_extra.length)
      payload.skills_extra = form.skills_extra;
    if (enabledOptionals.includes("experience_years") && form.experience_years)
      payload.experience_years = form.experience_years;
    if (enabledOptionals.includes("pay_expectation") && form.pay_expectation) {
      payload.pay_expectation = form.pay_expectation;
      payload.pay_period = form.pay_period;
    }
    if (enabledOptionals.includes("job_type_pref") && form.job_type_pref.length)
      payload.job_type_pref = form.job_type_pref;
    if (enabledOptionals.includes("education") && form.education)
      payload.education = form.education;
    if (enabledOptionals.includes("languages") && form.languages.length)
      payload.languages = form.languages;
    if (enabledOptionals.includes("own_tools"))
      payload.own_tools = form.own_tools;
    if (enabledOptionals.includes("willing_to_travel"))
      payload.willing_to_travel = form.willing_to_travel;
    if (enabledOptionals.includes("bio") && form.bio)
      payload.bio = form.bio;

    const res = await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    const data = await res.json();
    setProfileId(data.id);
    setStep("success");
  }

  if (step === "success") {
    const profileUrl = `${window.location.origin}/jobs/worker/${profileId}`;
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Profile created!</h1>
        <p className="text-slate-500 mb-6">Employers can now find you on the Jobs page.</p>
        <div className="rounded-2xl bg-violet-50 border border-violet-200 p-5 text-left mb-6">
          <p className="text-sm font-semibold text-violet-900 mb-2">📲 Share your profile</p>
          <p className="text-sm text-violet-700 break-all mb-3">{profileUrl}</p>
          <a
            href={`https://wa.me/?text=Find%20me%20on%20Uganda%20Business%20Hub%3A%20${encodeURIComponent(profileUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
          >
            Share on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-black text-slate-900 mb-1">Create Worker Profile</h1>
      <p className="text-sm text-slate-500 mb-8">Free. Employers will contact you directly via WhatsApp or phone.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input required value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="e.g. Okello James" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Primary Skill *</label>
          <select required value={form.skill_primary} onChange={e => set("skill_primary", e.target.value)} className={inputCls}>
            <option value="">Select your main skill...</option>
            {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>District *</label>
            <select required value={form.district} onChange={e => set("district", e.target.value)} className={inputCls}>
              <option value="">Select district...</option>
              {UGANDA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Town / Area</label>
            <input value={form.town} onChange={e => set("town", e.target.value)}
              placeholder="e.g. Bwaise" className={inputCls} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-3">Contact * (at least one)</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>WhatsApp Number</label>
              <input type="tel" value={form.contact_whatsapp} onChange={e => set("contact_whatsapp", e.target.value)}
                placeholder="256700000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)}
                placeholder="0700000000" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-xs font-semibold text-violet-800 mb-3">Add optional details (tick what you want to show)</p>
          <div className="flex flex-col gap-2">
            {OPTIONAL_FIELDS.map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={enabledOptionals.includes(f.key)}
                  onChange={() => toggle(f.key)}
                  className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                <span className="text-sm text-slate-700">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {enabledOptionals.includes("skills_extra") && (
          <div>
            <label className={labelCls}>Additional Skills (pick up to 2)</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SKILLS.filter(s => s !== form.skill_primary).map(s => (
                <label key={s} className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox"
                    checked={form.skills_extra.includes(s)}
                    disabled={!form.skills_extra.includes(s) && form.skills_extra.length >= 2}
                    onChange={() => set("skills_extra", form.skills_extra.includes(s)
                      ? form.skills_extra.filter(x => x !== s)
                      : [...form.skills_extra, s]
                    )}
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-violet-600" />
                  <span className="text-xs text-slate-700">{s}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {enabledOptionals.includes("experience_years") && (
          <div>
            <label className={labelCls}>Years of Experience</label>
            <input type="number" min="0" max="50" value={form.experience_years}
              onChange={e => set("experience_years", e.target.value)}
              placeholder="e.g. 4" className={inputCls} />
          </div>
        )}
        {enabledOptionals.includes("pay_expectation") && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Pay Expectation (UGX)</label>
              <input type="number" value={form.pay_expectation}
                onChange={e => set("pay_expectation", e.target.value)}
                placeholder="e.g. 70000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Per</label>
              <select value={form.pay_period} onChange={e => set("pay_period", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {PAY_PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
        )}
        {enabledOptionals.includes("job_type_pref") && (
          <div>
            <label className={labelCls}>Job Type Preference</label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map(j => (
                <label key={j.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox"
                    checked={form.job_type_pref.includes(j.value)}
                    onChange={() => set("job_type_pref", form.job_type_pref.includes(j.value)
                      ? form.job_type_pref.filter(x => x !== j.value)
                      : [...form.job_type_pref, j.value]
                    )}
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                  <span className="text-sm text-slate-700">{j.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {enabledOptionals.includes("education") && (
          <div>
            <label className={labelCls}>Education Level</label>
            <select value={form.education} onChange={e => set("education", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              {EDUCATION_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
        )}
        {enabledOptionals.includes("languages") && (
          <div>
            <label className={labelCls}>Languages Spoken</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <label key={lang} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox"
                    checked={form.languages.includes(lang)}
                    onChange={() => set("languages", form.languages.includes(lang)
                      ? form.languages.filter(l => l !== lang)
                      : [...form.languages, lang]
                    )}
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                  <span className="text-sm text-slate-700">{lang}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {enabledOptionals.includes("own_tools") && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.own_tools}
              onChange={e => set("own_tools", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
            <span className="text-sm text-slate-700">I own my own tools / equipment</span>
          </label>
        )}
        {enabledOptionals.includes("willing_to_travel") && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.willing_to_travel}
              onChange={e => set("willing_to_travel", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
            <span className="text-sm text-slate-700">I am willing to travel for work</span>
          </label>
        )}
        {enabledOptionals.includes("bio") && (
          <div>
            <label className={labelCls}>Short Bio</label>
            <input maxLength={100} value={form.bio} onChange={e => set("bio", e.target.value)}
              placeholder="e.g. 4 years experience, own tools, reliable" className={inputCls} />
            <p className="text-xs text-slate-400 mt-1">{form.bio.length}/100</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 active:scale-95 disabled:opacity-60">
          {submitting ? "Creating profile..." : "Create Profile →"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/jobs/worker/new/page.tsx`**

```typescript
// app/jobs/worker/new/page.tsx
import type { Metadata } from "next";
import WorkerForm from "./WorkerForm";

export const metadata: Metadata = {
  title: "Register as a Worker | Uganda Business Hub",
  description: "Create a free worker profile and let Uganda employers find you by skill and location.",
};

export default function WorkerNewPage() {
  return <WorkerForm />;
}
```

- [ ] **Step 3: Test in browser**

Navigate to `http://localhost:3000/jobs/worker/new`. Fill required fields, submit. Expect success screen with profile link. Verify row in Supabase `worker_profiles` with `status = 'active'`.

- [ ] **Step 4: Commit**

```bash
git add app/jobs/worker/new/WorkerForm.tsx app/jobs/worker/new/page.tsx
git commit -m "feat: worker profile registration form at /jobs/worker/new"
```

---

## Task 6: Public worker profile page (`/jobs/worker/[id]`)

**Files:**
- Create: `app/jobs/worker/[id]/page.tsx`

- [ ] **Step 1: Create `app/jobs/worker/[id]/page.tsx`**

```typescript
// app/jobs/worker/[id]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Worker = {
  id: string; name: string; skill_primary: string; skills_extra: string[] | null;
  district: string; town: string | null; contact_whatsapp: string | null;
  contact_phone: string | null; experience_years: number | null;
  pay_expectation: number | null; pay_period: string | null;
  job_type_pref: string[] | null; education: string | null;
  languages: string[] | null; own_tools: boolean | null;
  willing_to_travel: boolean | null; bio: string | null;
  available: boolean; created_at: string;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from("worker_profiles").select("name,skill_primary,district").eq("id", id).single();
  if (!data) return { title: "Worker Profile | Uganda Business Hub" };
  return {
    title: `${data.name} — ${data.skill_primary} in ${data.district} | Uganda Business Hub`,
    description: `Hire ${data.name}, a ${data.skill_primary} based in ${data.district}, Uganda.`,
  };
}

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: worker } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single<Worker>();

  if (!worker) notFound();

  const displayName = worker.name.split(" ").map((w, i) => i === 0 ? w : w[0] + ".").join(" ");
  const initial = worker.name[0].toUpperCase();

  const allSkills = [worker.skill_primary, ...(worker.skills_extra ?? [])];

  function whatsappHref(phone: string) {
    const clean = phone.replace(/\D/g, "");
    const num = clean.startsWith("0") ? "256" + clean.slice(1) : clean;
    return `https://wa.me/${num}?text=Hi%20${encodeURIComponent(worker.name)}%2C%20I%20found%20your%20profile%20on%20Uganda%20Business%20Hub`;
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="h-14 w-14 shrink-0 rounded-full bg-violet-600 flex items-center justify-center text-2xl font-black text-white">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-black text-slate-900">{displayName}</h1>
              <p className="text-sm font-semibold text-violet-700 mt-0.5">{allSkills.join(" · ")}</p>
              <p className="text-xs text-slate-500 mt-1">📍 {[worker.town, worker.district].filter(Boolean).join(", ")}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${worker.available ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {worker.available ? "Available" : "Not available"}
            </span>
          </div>

          {/* Optional details grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {worker.experience_years != null && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{worker.experience_years} yr{worker.experience_years !== 1 ? "s" : ""}</p>
              </div>
            )}
            {worker.pay_expectation != null && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pay Expectation</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  UGX {worker.pay_expectation.toLocaleString()}{worker.pay_period ? `/${worker.pay_period}` : ""}
                </p>
              </div>
            )}
            {worker.job_type_pref?.length && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Job Type</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{worker.job_type_pref.join(", ")}</p>
              </div>
            )}
            {worker.education && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Education</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5 uppercase">{worker.education}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {(worker.languages?.length || worker.own_tools || worker.willing_to_travel) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {worker.languages?.map(l => (
                <span key={l} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{l}</span>
              ))}
              {worker.own_tools && (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Own tools</span>
              )}
              {worker.willing_to_travel && (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Can travel</span>
              )}
            </div>
          )}

          {worker.bio && (
            <p className="text-sm text-slate-600 italic mb-6">"{worker.bio}"</p>
          )}

          {/* Contact buttons */}
          <div className="flex gap-3">
            {worker.contact_whatsapp && (
              <a href={whatsappHref(worker.contact_whatsapp)} target="_blank" rel="noopener noreferrer"
                className="flex-1 rounded-2xl bg-green-600 py-3 text-center text-sm font-bold text-white hover:bg-green-700">
                📲 WhatsApp
              </a>
            )}
            {worker.contact_phone && (
              <a href={`tel:${worker.contact_phone}`}
                className="flex-1 rounded-2xl bg-slate-100 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-200">
                📞 Call
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test in browser**

After creating a worker profile in Task 5, visit `http://localhost:3000/jobs/worker/<uuid>`. Expect the profile card with name, skills, location, contact buttons.

- [ ] **Step 3: Commit**

```bash
git add "app/jobs/worker/[id]/page.tsx"
git commit -m "feat: public worker profile page at /jobs/worker/[id]"
```

---

## Task 7: Jobs page — Browse Jobs + Worker Profiles tabs (`/jobs`)

**Files:**
- Create: `app/jobs/JobsClient.tsx`
- Create: `app/jobs/page.tsx`

- [ ] **Step 1: Create `app/jobs/JobsClient.tsx`**

```typescript
// app/jobs/JobsClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { UGANDA_DISTRICTS } from "@/lib/constants/skills";

type Job = {
  id: string; title: string; skill_category: string; district: string; town: string | null;
  employer_name: string; contact_whatsapp: string | null; contact_phone: string | null;
  contact_walkin: string | null; pay_amount: number | null; pay_period: string | null;
  job_type: string | null; gender_pref: string | null; min_education: string | null;
  accommodation: string | null; food_provided: string | null; languages: string[] | null;
  description: string | null; featured: boolean; created_at: string;
};

type Worker = {
  id: string; name: string; skill_primary: string; skills_extra: string[] | null;
  district: string; town: string | null; contact_whatsapp: string | null;
  contact_phone: string | null; experience_years: number | null;
  pay_expectation: number | null; pay_period: string | null;
  job_type_pref: string[] | null; education: string | null;
  languages: string[] | null; own_tools: boolean | null;
  willing_to_travel: boolean | null; bio: string | null; available: boolean;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

function whatsappHref(phone: string, context: string) {
  const clean = phone.replace(/\D/g, "");
  const num = clean.startsWith("0") ? "256" + clean.slice(1) : clean;
  return `https://wa.me/${num}?text=${encodeURIComponent(context)}`;
}

export default function JobsClient({ jobs, workers }: { jobs: Job[]; workers: Worker[] }) {
  const [tab, setTab] = useState<"jobs" | "workers">("jobs");
  const [skillSearch, setSkillSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filteredJobs = jobs.filter(j => {
    const matchSkill = !skillSearch || j.skill_category.toLowerCase().includes(skillSearch.toLowerCase()) || j.title.toLowerCase().includes(skillSearch.toLowerCase());
    const matchDistrict = !district || j.district === district;
    return matchSkill && matchDistrict;
  });

  const filteredWorkers = workers.filter(w => {
    const matchSkill = !skillSearch || w.skill_primary.toLowerCase().includes(skillSearch.toLowerCase()) || (w.skills_extra ?? []).some(s => s.toLowerCase().includes(skillSearch.toLowerCase()));
    const matchDistrict = !district || w.district === district;
    const matchAvail = !availableOnly || w.available;
    return matchSkill && matchDistrict && matchAvail;
  });

  const tabActive = "border-b-2 border-violet-600 text-violet-700 font-bold";
  const tabIdle = "text-slate-500 hover:text-slate-700";

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#3b0764] to-[#4c1d95] px-4 py-10 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Find Work in Uganda</p>
        <h1 className="text-2xl font-black mb-1">Jobs Near You</h1>
        <p className="text-sm opacity-75 mb-5">Browse by skill and district. Apply on WhatsApp.</p>
        <div className="flex gap-2">
          <input
            value={skillSearch} onChange={e => setSkillSearch(e.target.value)}
            placeholder="🔍 Skill (carpenter, nurse...)"
            className="flex-1 rounded-xl border-0 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <select value={district} onChange={e => setDistrict(e.target.value)}
            className="rounded-xl border-0 bg-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30">
            <option value="">All Districts</option>
            {UGANDA_DISTRICTS.map(d => <option key={d} value={d} className="text-slate-900">{d}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4">
        <button onClick={() => setTab("jobs")} className={`flex-1 py-3 text-sm transition-colors ${tab === "jobs" ? tabActive : tabIdle}`}>
          💼 Browse Jobs {filteredJobs.length > 0 && <span className="ml-1 rounded-full bg-violet-100 px-1.5 text-xs text-violet-700">{filteredJobs.length}</span>}
        </button>
        <button onClick={() => setTab("workers")} className={`flex-1 py-3 text-sm transition-colors ${tab === "workers" ? tabActive : tabIdle}`}>
          👤 Worker Profiles {filteredWorkers.length > 0 && <span className="ml-1 rounded-full bg-violet-100 px-1.5 text-xs text-violet-700">{filteredWorkers.length}</span>}
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Jobs tab */}
        {tab === "jobs" && (
          <div className="flex flex-col gap-3">
            {filteredJobs.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-slate-500 text-sm">No jobs found. Try a different skill or district.</p>
                <Link href="/jobs/post" className="mt-3 inline-block text-sm font-semibold text-violet-600 underline">Post a job</Link>
              </div>
            )}
            {filteredJobs.map(job => {
              const applyHref = job.contact_whatsapp
                ? whatsappHref(job.contact_whatsapp, `Hi, I am interested in the ${job.title} job listed on Uganda Business Hub.`)
                : job.contact_phone ? `tel:${job.contact_phone}` : "#";
              return (
                <div key={job.id} className={`rounded-2xl border bg-white p-4 ${job.featured ? "border-violet-400 shadow-md shadow-violet-100" : "border-slate-200"}`}>
                  {job.featured && (
                    <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
                      ⭐ Featured
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[14px] font-black text-slate-900">{job.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {[job.town, job.district].filter(Boolean).join(", ")} &nbsp;·&nbsp; 🏢 {job.employer_name}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">{job.skill_category}</span>
                  </div>

                  {/* Optional fields */}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {job.pay_amount != null && <span>💰 UGX {job.pay_amount.toLocaleString()}/{job.pay_period}</span>}
                    {job.job_type && <span className="capitalize">🗂 {job.job_type}</span>}
                    {job.min_education && <span className="uppercase">🎓 {job.min_education}</span>}
                    {job.accommodation && job.accommodation !== "no" && <span>🏠 Accommodation: {job.accommodation}</span>}
                    {job.food_provided && job.food_provided !== "no" && <span>🍽 Food: {job.food_provided}</span>}
                    {job.gender_pref && job.gender_pref !== "any" && <span className="capitalize">👤 {job.gender_pref} preferred</span>}
                    {job.languages?.length ? <span>🗣 {job.languages.join(", ")}</span> : null}
                  </div>

                  {job.description && <p className="mt-2 text-xs text-slate-600">{job.description}</p>}

                  {job.contact_walkin && (
                    <p className="mt-2 text-xs text-slate-500">🚶 Walk in: {job.contact_walkin}</p>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <a href={applyHref} target="_blank" rel="noopener noreferrer"
                      className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 active:scale-95">
                      📲 Apply
                    </a>
                    <span className="text-[11px] text-slate-400">{timeAgo(job.created_at)}</span>
                  </div>
                </div>
              );
            })}

            <Link href="/jobs/post"
              className="mt-2 block rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 p-4 text-center text-sm font-semibold text-violet-700 hover:border-violet-400 hover:bg-violet-100">
              + Post a Job (Free)
            </Link>
          </div>
        )}

        {/* Workers tab */}
        {tab === "workers" && (
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
              Available now only
            </label>

            {filteredWorkers.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-slate-500 text-sm">No workers found. Try a different skill or district.</p>
                <Link href="/jobs/worker/new" className="mt-3 inline-block text-sm font-semibold text-violet-600 underline">Register as a worker</Link>
              </div>
            )}

            {filteredWorkers.map(worker => {
              const displayName = worker.name.split(" ").map((w, i) => i === 0 ? w : w[0] + ".").join(" ");
              const initial = worker.name[0].toUpperCase();
              const allSkills = [worker.skill_primary, ...(worker.skills_extra ?? [])];
              const waHref = worker.contact_whatsapp
                ? whatsappHref(worker.contact_whatsapp, `Hi ${worker.name}, I found your profile on Uganda Business Hub and I am interested in hiring you.`)
                : null;
              return (
                <div key={worker.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-violet-600 flex items-center justify-center text-lg font-black text-white">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[14px] font-black text-slate-900">{displayName}</h3>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${worker.available ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {worker.available ? "Available" : "Not available"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-violet-700 mt-0.5">{allSkills.join(" · ")}</p>
                      <p className="text-xs text-slate-500 mt-0.5">📍 {[worker.town, worker.district].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {worker.experience_years != null && <span>⏱ {worker.experience_years} yrs exp</span>}
                    {worker.pay_expectation != null && <span>💰 UGX {worker.pay_expectation.toLocaleString()}/{worker.pay_period}</span>}
                    {worker.education && <span className="uppercase">🎓 {worker.education}</span>}
                    {worker.own_tools && <span>🔧 Own tools</span>}
                    {worker.willing_to_travel && <span>✈ Can travel</span>}
                    {worker.languages?.length ? <span>🗣 {worker.languages.join(", ")}</span> : null}
                  </div>

                  {worker.bio && <p className="mt-2 text-xs italic text-slate-600">"{worker.bio}"</p>}

                  <div className="mt-3 flex gap-2">
                    {waHref && (
                      <a href={waHref} target="_blank" rel="noopener noreferrer"
                        className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700">
                        📲 WhatsApp
                      </a>
                    )}
                    {worker.contact_phone && (
                      <a href={`tel:${worker.contact_phone}`}
                        className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">
                        📞 Call
                      </a>
                    )}
                    <Link href={`/jobs/worker/${worker.id}`}
                      className="ml-auto text-xs text-violet-600 underline self-center">
                      Full profile
                    </Link>
                  </div>
                </div>
              );
            })}

            <Link href="/jobs/worker/new"
              className="mt-2 block rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 p-4 text-center text-sm font-semibold text-violet-700 hover:border-violet-400 hover:bg-violet-100">
              + Register as a Worker (Free)
            </Link>
          </div>
        )}
      </div>

      {/* Post a job banner */}
      <div className="mx-4 mb-8 rounded-2xl bg-[#3b0764] p-5 text-white text-center">
        <p className="text-sm font-bold mb-1">📢 Need to hire someone?</p>
        <p className="text-xs opacity-75 mb-3">Post a job for free. Get featured for UGX 20,000.</p>
        <Link href="/jobs/post"
          className="inline-block rounded-xl bg-violet-400 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-300">
          Post a Job →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/jobs/page.tsx`**

```typescript
// app/jobs/page.tsx
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import JobsClient from "./JobsClient";

export const metadata: Metadata = {
  title: "Jobs in Uganda | Uganda Business Hub",
  description: "Find jobs near you in Uganda. Browse by skill and district. Apply on WhatsApp.",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function JobsPage() {
  const [{ data: jobs }, { data: workers }] = await Promise.all([
    supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("worker_profiles")
      .select("*")
      .eq("status", "active")
      .order("available", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  return <JobsClient jobs={jobs ?? []} workers={workers ?? []} />;
}
```

- [ ] **Step 3: Seed a test job**

In Supabase SQL Editor, run:
```sql
INSERT INTO public.jobs (title, skill_category, district, town, employer_name, contact_whatsapp, status, featured)
VALUES ('Carpenter Needed', 'Carpenter', 'Kampala', 'Nakawa', 'Mukalazi Hardware', '256700000000', 'active', false);

INSERT INTO public.jobs (title, skill_category, district, town, employer_name, contact_whatsapp, pay_amount, pay_period, job_type, status, featured)
VALUES ('Security Guard', 'Security guard', 'Wakiso', 'Nansana', 'SafeGuard Ltd', '256701111111', 500000, 'monthly', 'permanent', 'active', true);
```

- [ ] **Step 4: Test in browser**

Navigate to `http://localhost:3000/jobs`. Expect two job cards — Security Guard with ⭐ Featured badge first. Switch to Worker Profiles tab and confirm worker profile registered in Task 5 appears.

- [ ] **Step 5: Commit**

```bash
git add app/jobs/JobsClient.tsx app/jobs/page.tsx
git commit -m "feat: /jobs page with Browse Jobs + Worker Profiles tabs"
```

---

## Task 8: Homepage redesign — three-pillar hero + jobs teaser

**Files:**
- Modify: `app/HomeClient.tsx`

- [ ] **Step 1: Read current hero section**

Open [app/HomeClient.tsx](app/HomeClient.tsx) and locate the `{/* ── HERO ── */}` comment (around line 185). You will replace the entire hero block and update the nav.

- [ ] **Step 2: Replace the nav links**

Find the desktop nav (around line 143–153) and replace its inner links:

```tsx
{/* Desktop nav — replace existing links with: */}
<a href="#ideas"      className="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">Ideas</a>
<a href="#ideas"      className="rounded-lg px-3 py-1.5 transition-colors hover:bg-blue-50 hover:text-blue-700">Businesses</a>
<Link href="/jobs"    className="rounded-lg px-3 py-1.5 transition-colors hover:bg-violet-50 hover:text-violet-700">Jobs</Link>
<Link href="/blog"    className="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">Blog</Link>
<Link href="/guides"  className="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">Guides</Link>
<Link href="/advertise" className="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">Advertise</Link>
<Link href="/start"   className="ml-2 rounded-xl bg-green-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-green-200 transition-all hover:bg-green-700 hover:shadow-md active:scale-95">
  Start
</Link>
```

Also update the mobile nav (around line 172–180):
```tsx
<a href="#ideas"   onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-slate-50">💡 Business Ideas</a>
<a href="#ideas"   onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-blue-50">📍 Find Businesses</a>
<Link href="/jobs" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-violet-50">💼 Find Jobs</Link>
<Link href="/blog"      onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-slate-50">📝 Blog</Link>
<Link href="/guides"    onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-slate-50">📋 Guides</Link>
<Link href="/advertise" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-slate-50">📣 Advertise</Link>
<Link href="/start"     onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-slate-50">✅ Start</Link>
```

- [ ] **Step 3: Replace the hero section**

Find `{/* ── HERO ── */}` and replace the entire hero block (until the next section comment) with:

```tsx
{/* ── THREE-PILLAR HERO ─────────────────────────────────────────────── */}
<section className="bg-gradient-to-br from-[#0f4c25] to-[#166534] px-4 py-10 text-white text-center">
  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">UGANDA&apos;S BUSINESS PLATFORM</p>
  <h1 className="text-3xl font-black leading-tight mb-2">Find Ideas. Find Businesses.<br className="hidden sm:block" /> Find Jobs.</h1>
  <p className="text-sm opacity-75 mb-8">Everything you need to work and earn in Uganda.</p>

  <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
    {/* Pillar 1 — Ideas */}
    <a href="#ideas" className="group flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-4 transition hover:bg-white/20 active:scale-95">
      <span className="text-3xl">💡</span>
      <span className="text-xs font-black leading-tight">Business<br/>Ideas</span>
      <span className="rounded-full bg-green-500 px-3 py-1 text-[10px] font-bold text-white group-hover:bg-green-400">Browse →</span>
    </a>

    {/* Pillar 2 — Businesses (links to LocateUG) */}
    <a href="http://localhost:3000/map" target="_blank" rel="noopener noreferrer"
      className="group flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-4 transition hover:bg-white/20 active:scale-95">
      <span className="text-3xl">📍</span>
      <span className="text-xs font-black leading-tight">Find<br/>Businesses</span>
      <span className="rounded-full bg-blue-500 px-3 py-1 text-[10px] font-bold text-white group-hover:bg-blue-400">Open Map →</span>
    </a>

    {/* Pillar 3 — Jobs */}
    <Link href="/jobs" className="group flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-4 transition hover:bg-white/20 active:scale-95">
      <span className="text-3xl">💼</span>
      <span className="text-xs font-black leading-tight">Find<br/>Jobs</span>
      <span className="rounded-full bg-violet-500 px-3 py-1 text-[10px] font-bold text-white group-hover:bg-violet-400">Browse Jobs →</span>
    </Link>
  </div>
</section>
```

- [ ] **Step 4: Add jobs teaser strip**

Find the WhatsApp CTA section near the bottom of the return block (search for `WhatsAppCTA` or the green CTA banner). Add the jobs teaser strip just before it:

```tsx
{/* ── JOBS TEASER STRIP ─────────────────────────────────────────────── */}
<section className="bg-gradient-to-br from-[#3b0764]/5 to-violet-50 px-4 py-8 sm:px-6 md:px-10">
  <div className="mx-auto max-w-7xl">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className={eyebrow}>💼 Latest Jobs</p>
        <h2 className="mt-1 text-xl font-black text-slate-900">Work Near You</h2>
      </div>
      <Link href="/jobs" className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100">
        View all →
      </Link>
    </div>
    <div className="rounded-2xl border border-violet-200 bg-white p-4 text-center text-sm text-slate-500">
      <p className="mb-3">No jobs posted yet — be the first!</p>
      <Link href="/jobs/post" className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700">
        Post a Job (Free)
      </Link>
    </div>
  </div>
</section>
```

> Note: Once real jobs exist, this teaser will be replaced in Task 9 with a live-fetched 3-job preview. For now, the empty state placeholder is correct.

- [ ] **Step 5: Test in browser**

Navigate to `http://localhost:3000`. Expect:
- Three-pillar hero with Ideas / Businesses / Jobs columns
- Existing ideas grid below it (unchanged)
- Jobs teaser strip with "Post a Job" CTA
- Nav has Businesses + Jobs links

- [ ] **Step 6: Commit**

```bash
git add app/HomeClient.tsx
git commit -m "feat: three-pillar hero + jobs teaser strip on homepage"
```

---

## Task 9: Live jobs teaser on homepage (fetch 3 most recent active jobs)

**Files:**
- Create: `app/HomeJobsTeaser.tsx`
- Modify: `app/HomeClient.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `app/HomeJobsTeaser.tsx`** (server component)

```typescript
// app/HomeJobsTeaser.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Job = {
  id: string; title: string; skill_category: string;
  district: string; town: string | null; employer_name: string;
  contact_whatsapp: string | null; contact_phone: string | null;
  pay_amount: number | null; pay_period: string | null;
  featured: boolean; created_at: string;
};

function whatsappHref(phone: string, title: string) {
  const clean = phone.replace(/\D/g, "");
  const num = clean.startsWith("0") ? "256" + clean.slice(1) : clean;
  return `https://wa.me/${num}?text=${encodeURIComponent(`Hi, I am interested in the ${title} job listed on Uganda Business Hub.`)}`;
}

export default async function HomeJobsTeaser() {
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id,title,skill_category,district,town,employer_name,contact_whatsapp,contact_phone,pay_amount,pay_period,featured,created_at")
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const eyebrow = "text-[10.5px] font-bold uppercase tracking-[0.14em] text-violet-600";

  return (
    <section className="bg-gradient-to-br from-[#3b0764]/5 to-violet-50 px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={eyebrow}>💼 Latest Jobs</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Work Near You</h2>
          </div>
          <Link href="/jobs" className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100">
            View all →
          </Link>
        </div>

        {(!jobs || jobs.length === 0) ? (
          <div className="rounded-2xl border border-violet-200 bg-white p-4 text-center text-sm text-slate-500">
            <p className="mb-3">No jobs posted yet — be the first!</p>
            <Link href="/jobs/post" className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700">
              Post a Job (Free)
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(jobs as Job[]).map(job => {
              const applyHref = job.contact_whatsapp
                ? whatsappHref(job.contact_whatsapp, job.title)
                : job.contact_phone ? `tel:${job.contact_phone}` : "/jobs";
              return (
                <div key={job.id} className={`flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 ${job.featured ? "border-violet-400" : "border-slate-200"}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {job.featured && <span className="text-[10px] font-bold text-violet-600">⭐</span>}
                      <p className="truncate text-sm font-black text-slate-900">{job.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {[job.town, job.district].filter(Boolean).join(", ")}
                      {job.pay_amount ? ` · UGX ${job.pay_amount.toLocaleString()}/${job.pay_period}` : ""}
                    </p>
                  </div>
                  <a href={applyHref} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700">
                    Apply
                  </a>
                </div>
              );
            })}
            <Link href="/jobs/post"
              className="block rounded-2xl border-2 border-dashed border-violet-200 bg-white p-3 text-center text-xs font-semibold text-violet-600 hover:bg-violet-50">
              + Post a Job (Free)
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update `app/page.tsx` to render HomeJobsTeaser**

In `app/page.tsx`, import and add `HomeJobsTeaser` alongside `HomeClient`:

```typescript
// app/page.tsx
import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import HomeJobsTeaser from "./HomeJobsTeaser";

export const metadata: Metadata = { /* keep existing metadata unchanged */ };

export default function Page() {
  return (
    <>
      <HomeClient />
      <HomeJobsTeaser />
    </>
  );
}
```

- [ ] **Step 3: Remove the static teaser from HomeClient**

In `app/HomeClient.tsx`, delete the static `{/* ── JOBS TEASER STRIP ── */}` section added in Task 8 Step 4 (it is now rendered by the server component above).

- [ ] **Step 4: Test in browser**

With the 2 seeded jobs from Task 7, reload `http://localhost:3000`. Expect the jobs teaser to show the Security Guard and Carpenter cards. The Security Guard (featured) should appear first.

- [ ] **Step 5: Commit**

```bash
git add app/HomeJobsTeaser.tsx app/page.tsx app/HomeClient.tsx
git commit -m "feat: live jobs teaser on homepage via server component"
```

---

## Task 10: Update LocateUG link once deployed

**Files:**
- Modify: `app/HomeClient.tsx`

- [ ] **Step 1: Deploy LocateUG to Vercel**

Follow the deploy instructions in `d:/projects/uganda-map/HANDOFF_MAY2026.md` → Step 3. Once deployed, copy the production URL (e.g. `https://locateug.vercel.app/map`).

- [ ] **Step 2: Update the Businesses pillar href**

In `app/HomeClient.tsx`, find the Pillar 2 anchor tag and replace the `href`:

```tsx
{/* Before: */}
<a href="http://localhost:3000/map" target="_blank" rel="noopener noreferrer" ...>

{/* After — use the real Vercel URL: */}
<a href="https://locateug.vercel.app/map" target="_blank" rel="noopener noreferrer" ...>
```

- [ ] **Step 3: Commit**

```bash
git add app/HomeClient.tsx
git commit -m "fix: update LocateUG link to production URL"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ §3 Homepage redesign — Tasks 8 + 9
- ✅ §4 Jobs page with two tabs — Task 7
- ✅ §5 Post-a-job form — Task 4
- ✅ §6 Worker profile form — Task 5
- ✅ §6 Public worker profile page — Task 6
- ✅ §7 Database schema — Task 1
- ✅ §8 Skills list + districts — Task 2
- ✅ §9 Featured badge (paid) + confirmation screen — Tasks 4, 7
- ✅ §10 LocateUG link — Tasks 8, 10
- ✅ §2 API routes — Task 3

**Type consistency:** `Job` and `Worker` types defined once in `JobsClient.tsx` and `HomeJobsTeaser.tsx` independently (no shared import needed — each is scoped to its file).

**No placeholders:** All form fields, SQL, API routes, and UI components have complete code.
