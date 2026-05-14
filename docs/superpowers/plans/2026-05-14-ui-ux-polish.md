# UI/UX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the homepage, ideas page, and jobs page of Uganda Business Hub — improving layout, typography, spacing, and components without changing the existing color palette.

**Architecture:** Each task targets one file or one concern. No new pages, no API changes. The existing Tailwind + Next.js App Router setup is used throughout. Colors are preserved exactly — only layout, typography, and component structure change.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS v4, TypeScript, Supabase (data already fetched in server components)

**Spec:** `docs/superpowers/specs/2026-05-14-ui-ux-polish-design.md`

---

## File Map

| File | What changes |
|------|-------------|
| `app/HomeClient.tsx` | Full rewrite — new nav (hamburger), hero, pillars, ideas teaser, jobs teaser, footer |
| `app/page.tsx` | Add ideas count to data fetch for social proof badge |
| `app/ideas/IdeasDiscoveryClient.tsx` | Magazine grid layout — featured first card, chip filters replace selects on mobile |
| `app/jobs/JobsClient.tsx` | Horizontal card style polish, empty state improvement |
| `app/jobs/post/PostJobForm.tsx` | Add progress indicator (Step 1/2/2), success screen share button |
| `app/jobs/worker/new/WorkerForm.tsx` | Add progress indicator, success screen share button |
| `app/jobs/worker/[id]/page.tsx` | Add breadcrumb, WhatsApp button prominence, contact fallback |
| `app/globals.css` | Add Georgia serif font stack CSS variable |

---

## Task 1: Add Georgia serif and fix global CSS

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Open `app/globals.css` and replace its contents with:**

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --font-serif: Georgia, 'Times New Roman', serif;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 2: Run the dev server to confirm no CSS errors**

```bash
cd d:/projects/uganda-business-ideas
npm run dev
```

Expected: server starts on `http://localhost:3000` with no errors in terminal.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add serif font CSS variable"
```

---

## Task 2: Update homepage data fetch to include ideas count

**Files:**
- Modify: `app/page.tsx`

The social proof badge in the hero needs a live ideas count. The ideas data comes from a local JSON file (not Supabase), so we import it directly.

- [ ] **Step 1: Check where ideas data comes from**

```bash
grep -r "ideas" app/page.tsx app/ideas/page.tsx --include="*.tsx" -l
```

Then read `app/ideas/page.tsx` to confirm how ideas are loaded.

- [ ] **Step 2: Replace `app/page.tsx` with this (adds `ideasCount` prop):**

```tsx
import { createClient } from "@supabase/supabase-js";
import { ideas } from "./data/ideas";
import HomeClient from "./HomeClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 60;

export default async function HomePage() {
  const [{ data: jobs }, { data: workers }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id,title,skill_category,district,town,employer_name,pay_amount,pay_period,created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("worker_profiles")
      .select("id,name,skill_primary,district,available")
      .eq("status", "active")
      .eq("available", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <HomeClient
      jobs={jobs ?? []}
      workers={workers ?? []}
      ideasCount={ideas.length}
    />
  );
}
```

> **Note:** If `app/data/ideas` does not export a named `ideas` array, run `grep -r "export" app/data/ideas.ts` to find the correct export name and adjust the import accordingly.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If you get "Module not found" for `./data/ideas`, check the actual path with `ls app/data/`.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: pass ideasCount to HomeClient for social proof badge"
```

---

## Task 3: Rewrite HomeClient — Nav + Hero

**Files:**
- Modify: `app/HomeClient.tsx`

This task replaces the nav and hero sections only. The rest of HomeClient will be replaced in Task 4.

- [ ] **Step 1: Replace `app/HomeClient.tsx` entirely with this version (nav + hero + placeholder for remaining sections):**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  skill_category: string;
  district: string;
  town: string | null;
  employer_name: string;
  pay_amount: number | null;
  pay_period: string | null;
  created_at: string;
};

type Worker = {
  id: string;
  name: string;
  skill_primary: string;
  district: string;
  available: boolean;
};

const NAV_LINKS = [
  { href: "/ideas", label: "Ideas" },
  { href: "/jobs", label: "Jobs" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function HomeClient({
  jobs,
  workers,
  ideasCount,
}: {
  jobs: Job[];
  workers: Worker[];
  ideasCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-20 bg-[#1C3A2A] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-black text-[#F5C842] text-base" style={{ fontFamily: "Georgia, serif" }}>
          🇺🇬 UgandaBiz
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex gap-5 text-sm font-semibold text-white/70">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-[#F5C842] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link
          href="/jobs/post"
          className="hidden sm:inline-block rounded-lg bg-[#F5C842] px-4 py-2 text-xs font-bold text-[#1C3A2A] hover:bg-yellow-300 transition-colors"
        >
          Post a Job
        </Link>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-[#F5C842] text-2xl leading-none"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-10 bg-[#1C3A2A] pt-16 px-6 flex flex-col gap-5 sm:hidden">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-xl font-bold text-white hover:text-[#F5C842] transition-colors py-2 border-b border-white/10"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/jobs/post"
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-xl bg-[#F5C842] py-4 text-center text-base font-black text-[#1C3A2A]"
          >
            Post a Job
          </Link>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] px-4 py-14 text-center text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#F5C842] mb-3">
          Uganda's Business Hub
        </p>
        <h1
          className="text-3xl sm:text-4xl font-black leading-tight text-[#F5C842] mb-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Grow Your Business.<br />Find Your Next Job.
        </h1>
        <p className="text-sm text-white/80 mb-8 max-w-xs mx-auto leading-relaxed">
          Hundreds of proven business ideas, job listings, and guides — built for every Ugandan.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-6">
          <Link
            href="/ideas"
            className="rounded-xl bg-[#F5C842] px-6 py-3 text-sm font-black text-[#1C3A2A] hover:bg-yellow-300 transition-colors"
          >
            Browse Ideas
          </Link>
          <Link
            href="/jobs"
            className="rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            Find Work
          </Link>
        </div>
        <span className="inline-block rounded-full bg-white/10 border border-white/20 text-white/70 text-[11px] px-4 py-1.5">
          {ideasCount}+ Ideas · {jobs.length > 0 ? `${jobs.length * 10}+` : "Growing"} Jobs · All Uganda Districts
        </span>
      </div>

      {/* remaining sections — added in Task 4 */}
      <div className="px-4 py-8 text-center text-slate-400 text-sm">More sections coming in Task 4…</div>

      {/* ── Footer ── */}
      <footer className="bg-[#1C3A2A] px-4 py-8 text-center text-white/50 text-xs mt-auto">
        <p className="font-black text-[#F5C842] mb-3" style={{ fontFamily: "Georgia, serif" }}>
          🇺🇬 UgandaBiz
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-3 text-white/60 font-semibold">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-[#F5C842] transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="hover:text-[#F5C842] transition-colors">Contact</Link>
          <Link href="/advertise" className="hover:text-[#F5C842] transition-colors">Advertise</Link>
        </div>
        <p>© {new Date().getFullYear()} Uganda Business Hub</p>
      </footer>

    </div>
  );
}
```

- [ ] **Step 2: Open `http://localhost:3000` in browser**

Check:
- Nav is dark green with gold logo
- Hamburger appears on mobile width (< 640px) — resize browser to test
- Drawer opens and closes
- Desktop shows nav links + "Post a Job" button
- Hero has gold serif headline, two CTA buttons, social proof badge

- [ ] **Step 3: Commit**

```bash
git add app/HomeClient.tsx
git commit -m "feat: new nav (hamburger + desktop) and hero section"
```

---

## Task 4: HomeClient — Pillars + Ideas Teaser + Jobs Teaser

**Files:**
- Modify: `app/HomeClient.tsx`

Replace the `{/* remaining sections */}` placeholder from Task 3 with the full pillar, ideas, and jobs teaser sections.

- [ ] **Step 1: Read `app/data/ideas.ts` to find the Idea type fields needed for the teaser**

```bash
grep -n "title\|slug\|desc\|category\|budgetBand\|capital" app/data/ideas.ts | head -30
```

Note the field names — specifically `title`, `slug`, `desc`, `category`, and either `capital` or `budgetBand`.

- [ ] **Step 2: Replace the `{/* remaining sections — added in Task 4 */}` placeholder and everything before `{/* ── Footer ── */}` with:**

```tsx
      {/* ── Pillars ── */}
      <div className="bg-white px-4 py-6 grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        <Link
          href="/jobs/post"
          className="rounded-2xl bg-[#f5f0e8] border border-[#e0d8cc] p-4 hover:border-[#1C3A2A] transition-colors"
        >
          <div className="text-2xl mb-2">💼</div>
          <p className="font-black text-[#1C3A2A] text-sm mb-1">Post a Job</p>
          <p className="text-xs text-slate-500 leading-relaxed">Hire skilled workers across Uganda quickly.</p>
          <p className="mt-3 text-xs font-bold text-[#1C3A2A]">Post Now →</p>
        </Link>
        <Link
          href="/jobs"
          className="rounded-2xl bg-[#f5f0e8] border border-[#e0d8cc] p-4 hover:border-[#1C3A2A] transition-colors"
        >
          <div className="text-2xl mb-2">🔍</div>
          <p className="font-black text-[#1C3A2A] text-sm mb-1">Find Work</p>
          <p className="text-xs text-slate-500 leading-relaxed">Browse jobs and register your skills.</p>
          <p className="mt-3 text-xs font-bold text-[#1C3A2A]">Browse Jobs →</p>
        </Link>
      </div>

      {/* ── Featured Ideas ── */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-black text-[#1C3A2A]" style={{ fontFamily: "Georgia, serif" }}>
            💡 Featured Business Ideas
          </h2>
          <Link href="/ideas" className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2">
            View all {ideasCount}+ →
          </Link>
        </div>

        {/* Featured card */}
        {featuredIdeas[0] && (
          <Link
            href={`/ideas/${featuredIdeas[0].slug}`}
            className="block rounded-2xl bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] p-5 mb-3 hover:opacity-95 transition-opacity"
          >
            <span className="inline-block rounded-full bg-[#F5C842] text-[#1C3A2A] text-[10px] font-bold px-2 py-0.5 mb-3">
              ⭐ Editor&apos;s Pick
            </span>
            <h3 className="text-base font-black text-[#F5C842] leading-snug mb-2" style={{ fontFamily: "Georgia, serif" }}>
              {featuredIdeas[0].title}
            </h3>
            <p className="text-xs text-white/75 leading-relaxed mb-4 line-clamp-2">
              {featuredIdeas[0].desc}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">{formatCapital(featuredIdeas[0].capital)}</span>
              <span className="rounded-lg bg-[#F5C842] px-3 py-1.5 text-xs font-bold text-[#1C3A2A]">
                Read More
              </span>
            </div>
          </Link>
        )}

        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-3">
          {featuredIdeas.slice(1, 3).map(idea => (
            <Link
              key={idea.slug}
              href={`/ideas/${idea.slug}`}
              className="rounded-2xl bg-white border border-[#e0d8cc] p-4 hover:border-[#1C3A2A] transition-colors"
            >
              <div className="text-xl mb-2">{categoryEmoji(idea.category)}</div>
              <p className="font-black text-[#1C3A2A] text-sm leading-snug mb-1">{idea.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1">{idea.desc}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-bold text-[#1C3A2A]">{formatCapital(idea.capital)}</span>
                <span className="text-[10px] rounded-full bg-[#f5f0e8] px-2 py-0.5 text-slate-500 font-semibold">
                  {idea.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Jobs Teaser ── */}
      {jobs.length > 0 && (
        <div className="bg-white px-4 py-6 max-w-2xl mx-auto w-full">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-black text-[#1C3A2A]" style={{ fontFamily: "Georgia, serif" }}>
              💼 Latest Job Listings
            </h2>
            <Link href="/jobs" className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2">
              See all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {jobs.slice(0, 3).map(job => (
              <Link
                key={job.id}
                href="/jobs"
                className="flex items-center gap-3 rounded-xl border border-[#e0d8cc] bg-[#f5f0e8] px-4 py-3 hover:border-[#1C3A2A] transition-colors"
              >
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] flex items-center justify-center text-base">
                  {skillEmoji(job.skill_category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1C3A2A] truncate">{job.title}</p>
                  <p className="text-xs text-slate-500">{[job.town, job.district].filter(Boolean).join(", ")}</p>
                </div>
                {job.pay_amount && (
                  <span className="text-xs font-black text-[#1C3A2A] shrink-0">
                    UGX {job.pay_amount.toLocaleString()}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
```

- [ ] **Step 3: Add helper functions just above the `export default` line in `HomeClient.tsx`:**

```tsx
function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Agriculture: "🌾", Food: "🍽️", Retail: "🛒",
    Services: "🔧", Digital: "💻",
  };
  return map[category] ?? "💡";
}

function skillEmoji(skill: string): string {
  const s = skill.toLowerCase();
  if (s.includes("driv") || s.includes("transport")) return "🚗";
  if (s.includes("farm") || s.includes("agri")) return "🌾";
  if (s.includes("tailor") || s.includes("sew")) return "✂️";
  if (s.includes("tech") || s.includes("digital")) return "💻";
  if (s.includes("cook") || s.includes("food")) return "🍳";
  if (s.includes("build") || s.includes("construct")) return "🏗️";
  return "💼";
}
```

- [ ] **Step 4: Add the `featuredIdeas` variable and `formatCapital` import. At the top of the file, after the imports block, add:**

```tsx
import { ideas, formatCapital } from "./data/ideas";

// Top 3 ideas by demand score for homepage teaser
const featuredIdeas = [...ideas]
  .sort((a, b) => (b.scoring?.incomeSpeed ?? 0) - (a.scoring?.incomeSpeed ?? 0))
  .slice(0, 3);
```

> **Note:** If `formatCapital` is not exported from `./data/ideas`, check the file with `grep -n "export" app/data/ideas.ts` and use the correct import. If it doesn't exist, add this inline helper instead:
> ```tsx
> function formatCapital(capital?: { min?: number; max?: number }) {
>   if (!capital?.min) return "Budget varies";
>   const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : `${(n/1000).toFixed(0)}k`;
>   return capital.max ? `UGX ${fmt(capital.min)}–${fmt(capital.max)}` : `UGX ${fmt(capital.min)}+`;
> }
> ```

- [ ] **Step 5: Check TypeScript**

```bash
npx tsc --noEmit
```

Fix any type errors before proceeding.

- [ ] **Step 6: Open `http://localhost:3000` and verify**

- Pillars: 2-column grid, "Post a Job" and "Find Work" cards
- Featured ideas: 1 large dark-green card + 2 smaller grid cards below
- Jobs teaser: 3 horizontal rows with icon, title, location, salary
- Footer: dark green, gold logo, all links

- [ ] **Step 7: Commit**

```bash
git add app/HomeClient.tsx app/page.tsx
git commit -m "feat: homepage pillars, ideas teaser, jobs teaser"
```

---

## Task 5: Ideas Page — Magazine Grid Layout

**Files:**
- Modify: `app/ideas/IdeasDiscoveryClient.tsx`

Replace the filter controls (selects) with mobile-friendly chip filters for category, and switch the card grid to a magazine layout where the first result is a featured full-width card.

- [ ] **Step 1: Replace `app/ideas/IdeasDiscoveryClient.tsx` entirely with:**

```tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AudienceSegment, BudgetBand, Category, Idea } from "../data/ideas";
import { formatCapital } from "../data/ideas";

type IdeasDiscoveryClientProps = { ideas: Idea[] };

type SortOption = "demandScore" | "startupEaseScore" | "supplierPotentialScore" | "title";

const categoryOptions: Array<"All" | Category> = ["All", "Agriculture", "Food", "Retail", "Services", "Digital"];

const budgetOptions: Array<"All" | BudgetBand> = ["All", "under_200k", "under_500k", "500k_2m", "above_2m"];

const budgetLabels: Record<BudgetBand, string> = {
  under_200k: "Under 200k",
  under_500k: "Under 500k",
  "500k_2m": "500k–2M",
  above_2m: "Above 2M",
  review: "Review",
};

const sortLabels: Record<SortOption, string> = {
  demandScore: "Demand",
  startupEaseScore: "Ease",
  supplierPotentialScore: "Supplier",
  title: "A–Z",
};

function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Agriculture: "🌾", Food: "🍽️", Retail: "🛒", Services: "🔧", Digital: "💻",
  };
  return map[category] ?? "💡";
}

function getSortScore(idea: Idea, sort: SortOption) {
  if (sort === "demandScore") return idea.scoring?.incomeSpeed ?? 0;
  if (sort === "startupEaseScore") return idea.scoring?.startupEase ?? 0;
  if (sort === "supplierPotentialScore") return idea.scoring?.supplierDemand ?? 0;
  return 0;
}

export default function IdeasDiscoveryClient({ ideas }: IdeasDiscoveryClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [budget, setBudget] = useState<"All" | BudgetBand>("All");
  const [sort, setSort] = useState<SortOption>("demandScore");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ideas
      .filter(idea => {
        const matchSearch = !q || idea.title.toLowerCase().includes(q) || idea.desc.toLowerCase().includes(q);
        const matchCat = category === "All" || idea.category === category;
        const matchBudget = budget === "All" || idea.budgetBand === budget;
        return matchSearch && matchCat && matchBudget;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        return getSortScore(b, sort) - getSortScore(a, sort);
      });
  }, [ideas, search, category, budget, sort]);

  const [featured, ...rest] = filtered;

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search poultry, soap, digital, food..."
          className="w-full rounded-2xl border border-[#e0d8cc] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#1C3A2A] focus:ring-2 focus:ring-[#1C3A2A]/10"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
        {categoryOptions.map(opt => (
          <button
            key={opt}
            onClick={() => setCategory(opt as "All" | Category)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              category === opt
                ? "bg-[#1C3A2A] text-[#F5C842]"
                : "bg-white border border-[#e0d8cc] text-[#1C3A2A] hover:border-[#1C3A2A]"
            }`}
          >
            {opt === "All" ? "All" : `${categoryEmoji(opt)} ${opt}`}
          </button>
        ))}
      </div>

      {/* Budget chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {budgetOptions.map(opt => (
          <button
            key={opt}
            onClick={() => setBudget(opt as "All" | BudgetBand)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              budget === opt
                ? "bg-[#1C3A2A] text-[#F5C842]"
                : "bg-white border border-[#e0d8cc] text-[#1C3A2A] hover:border-[#1C3A2A]"
            }`}
          >
            {opt === "All" ? "All budgets" : budgetLabels[opt as BudgetBand]}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-5 text-xs text-slate-500 font-semibold">
        <span>Showing {filtered.length} of {ideas.length} ideas</span>
        <label className="flex items-center gap-1.5">
          Sort:
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-[#e0d8cc] bg-white px-2 py-1 text-xs outline-none focus:border-[#1C3A2A]"
          >
            {(Object.keys(sortLabels) as SortOption[]).map(s => (
              <option key={s} value={s}>{sortLabels[s]}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#e0d8cc] bg-white p-10 text-center">
          <p className="text-2xl mb-3">🔍</p>
          <p className="font-bold text-[#1C3A2A] mb-1">No ideas match your search</p>
          <p className="text-sm text-slate-500">Try clearing a filter or using a broader term.</p>
          <button
            onClick={() => { setSearch(""); setCategory("All"); setBudget("All"); }}
            className="mt-4 rounded-xl bg-[#1C3A2A] px-5 py-2 text-sm font-bold text-[#F5C842]"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Featured card */}
      {featured && (
        <Link
          href={`/ideas/${featured.slug}`}
          className="block rounded-2xl bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] p-6 mb-4 hover:opacity-95 transition-opacity"
        >
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="rounded-full bg-[#F5C842] text-[#1C3A2A] text-[10px] font-bold px-2 py-0.5">
              ⭐ Top Result
            </span>
            <span className="rounded-full bg-white/15 text-white text-[10px] font-bold px-2 py-0.5">
              {featured.category}
            </span>
          </div>
          <h2 className="text-xl font-black text-[#F5C842] leading-snug mb-2" style={{ fontFamily: "Georgia, serif" }}>
            {featured.title}
          </h2>
          <p className="text-sm text-white/75 leading-relaxed mb-5 line-clamp-3">{featured.desc}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {featured.scoring?.incomeSpeed != null && (
                <div className="text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wide">Demand</p>
                  <p className="text-base font-black text-white">{featured.scoring.incomeSpeed}</p>
                </div>
              )}
              {featured.scoring?.startupEase != null && (
                <div className="text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wide">Ease</p>
                  <p className="text-base font-black text-white">{featured.scoring.startupEase}</p>
                </div>
              )}
            </div>
            <span className="rounded-xl bg-[#F5C842] px-4 py-2 text-sm font-bold text-[#1C3A2A]">
              Read More →
            </span>
          </div>
        </Link>
      )}

      {/* 2-col grid for remaining ideas */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {rest.map(idea => (
            <Link
              key={idea.slug}
              href={`/ideas/${idea.slug}`}
              className="flex flex-col rounded-2xl border border-[#e0d8cc] bg-white p-4 hover:border-[#1C3A2A] transition-colors"
            >
              <div className="text-2xl mb-2">{categoryEmoji(idea.category)}</div>
              <div className="flex gap-1 flex-wrap mb-2">
                <span className="rounded-full bg-[#f5f0e8] text-[#1C3A2A] text-[10px] font-bold px-2 py-0.5">
                  {idea.category}
                </span>
                {idea.budgetBand && idea.budgetBand !== "review" && (
                  <span className="rounded-full bg-[#f5f0e8] text-slate-500 text-[10px] font-semibold px-2 py-0.5">
                    {budgetLabels[idea.budgetBand]}
                  </span>
                )}
              </div>
              <h3 className="font-black text-[#1C3A2A] text-sm leading-snug mb-1 flex-1">{idea.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{idea.desc}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-[#1C3A2A]">{formatCapital(idea.capital)}</span>
                <div className="flex gap-2 text-xs text-center">
                  {idea.scoring?.incomeSpeed != null && (
                    <div className="rounded-lg bg-[#f5f0e8] px-2 py-1">
                      <p className="text-[9px] text-slate-400 uppercase">D</p>
                      <p className="font-black text-[#1C3A2A]">{idea.scoring.incomeSpeed}</p>
                    </div>
                  )}
                  {idea.scoring?.startupEase != null && (
                    <div className="rounded-lg bg-[#f5f0e8] px-2 py-1">
                      <p className="text-[9px] text-slate-400 uppercase">E</p>
                      <p className="font-black text-[#1C3A2A]">{idea.scoring.startupEase}</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Open `http://localhost:3000/ideas` in browser and verify:**

- Search bar at top with magnifier icon
- Category chips (scrollable on mobile): All, 🌾 Agriculture, 🍽️ Food, etc.
- Budget chips: All budgets, Under 200k, etc.
- First result shows as large dark-green featured card with gold headline
- Remaining ideas show as 2-column grid
- Empty state shows when no results match

- [ ] **Step 3: Commit**

```bash
git add app/ideas/IdeasDiscoveryClient.tsx
git commit -m "feat: ideas page magazine grid with chip filters"
```

---

## Task 6: Jobs Page — Card Polish + Empty State

**Files:**
- Modify: `app/jobs/JobsClient.tsx`

Polish the job card layout to match the horizontal list style from the design spec. Improve the empty state message and add the skill emoji helper.

- [ ] **Step 1: In `app/jobs/JobsClient.tsx`, add this helper function just above `export default function JobsClient`:**

```tsx
function skillEmoji(skill: string): string {
  const s = skill.toLowerCase();
  if (s.includes("driv") || s.includes("transport")) return "🚗";
  if (s.includes("farm") || s.includes("agri")) return "🌾";
  if (s.includes("tailor") || s.includes("sew")) return "✂️";
  if (s.includes("tech") || s.includes("digital")) return "💻";
  if (s.includes("cook") || s.includes("food") || s.includes("cater")) return "🍳";
  if (s.includes("build") || s.includes("construct") || s.includes("mason")) return "🏗️";
  if (s.includes("clean") || s.includes("domestic")) return "🧹";
  if (s.includes("security") || s.includes("guard")) return "🛡️";
  return "💼";
}
```

- [ ] **Step 2: Replace the jobs list section (the `{tab === "jobs" && ...}` block, lines 80–124) with:**

```tsx
        {tab === "jobs" && (
          <div className="flex flex-col gap-3">
            {filteredJobs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#e0d8cc] bg-white p-10 text-center">
                <p className="text-3xl mb-3">💼</p>
                <p className="font-bold text-[#1C3A2A] mb-1">No jobs found in this category</p>
                <p className="text-sm text-slate-500 mb-4">Try a different district or skill, or be the first to post.</p>
                <Link href="/jobs/post" className="rounded-xl bg-[#1C3A2A] px-5 py-2 text-sm font-bold text-[#F5C842]">
                  Post a Job →
                </Link>
              </div>
            )}
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${job.featured ? "border-[#F5C842]" : "border-[#e0d8cc]"}`}
              >
                {job.featured && (
                  <span className="mb-2 inline-block rounded-full bg-[#FFF3CD] px-2 py-0.5 text-[10px] font-bold uppercase text-[#856404]">
                    Featured
                  </span>
                )}
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] flex items-center justify-center text-lg">
                    {skillEmoji(job.skill_category)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[#1C3A2A] text-sm">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.employer_name} · {[job.town, job.district].filter(Boolean).join(", ")}
                    </p>
                    {job.pay_amount && (
                      <p className="text-xs font-black text-[#1C3A2A] mt-1">
                        UGX {job.pay_amount.toLocaleString()}{job.pay_period ? `/${job.pay_period}` : ""}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="rounded-full bg-[#f5f0e8] px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {job.skill_category}
                      </span>
                      {job.job_type && (
                        <span className="rounded-full bg-[#f5f0e8] px-2 py-0.5 text-[10px] font-semibold text-slate-600 capitalize">
                          {job.job_type}
                        </span>
                      )}
                      {job.accommodation === "yes" && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                          Accommodation
                        </span>
                      )}
                      {job.food_provided === "yes" && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                          Food
                        </span>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{job.description}</p>
                    )}
                  </div>

                  {/* Contact buttons */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {job.contact_whatsapp && (
                      <a
                        href={whatsappHref(job.contact_whatsapp, job.employer_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-[#1C3A2A] px-3 py-1.5 text-xs font-bold text-[#F5C842] hover:opacity-90"
                      >
                        WhatsApp
                      </a>
                    )}
                    {job.contact_phone && (
                      <a
                        href={`tel:${job.contact_phone}`}
                        className="rounded-xl bg-[#f5f0e8] px-3 py-1.5 text-xs font-bold text-[#1C3A2A] hover:bg-[#e8e2d6]"
                      >
                        Call
                      </a>
                    )}
                    {job.contact_walkin && (
                      <span className="rounded-xl bg-[#f5f0e8] px-3 py-1.5 text-xs font-semibold text-slate-600">
                        Walk-in
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
```

- [ ] **Step 3: Open `http://localhost:3000/jobs` and verify:**

- Each job card has a dark-green icon square on the left
- WhatsApp button uses dark green + gold text
- Empty state shows emoji, message, and "Post a Job" CTA
- Featured jobs have a gold border

- [ ] **Step 4: Commit**

```bash
git add app/jobs/JobsClient.tsx
git commit -m "feat: jobs page card polish with skill icons and improved empty state"
```

---

## Task 7: PostJobForm — Progress Indicator + Success Share Button

**Files:**
- Modify: `app/jobs/post/PostJobForm.tsx`

- [ ] **Step 1: Read the full PostJobForm to understand the current step state and success screen**

```bash
cat app/jobs/post/PostJobForm.tsx
```

Note: the form uses `step` state with values `"form"` and `"success"`. The form is single-step. We add a visual progress indicator and a WhatsApp share button on success.

- [ ] **Step 2: Add a `ProgressBar` component. Add this just before the `export default function PostJobForm` line:**

```tsx
function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
        <span>{label}</span>
        <span>Step {current} of {total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#e0d8cc] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#1C3A2A] transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Find the opening `<form` tag in PostJobForm and add the ProgressBar just above it:**

Look for the line that starts `<form onSubmit=` and add this line directly above it:

```tsx
        <ProgressBar current={1} total={2} label="Job Details" />
```

Then find where optional fields are toggled (the second logical section of the form) and add:
```tsx
        <ProgressBar current={2} total={2} label="Optional Details" />
```
just above the optional fields section header.

- [ ] **Step 4: Find the success screen (the block rendered when `step === "success"`) and add a WhatsApp share button. Replace the success block with:**

```tsx
      {step === "success" && (
        <div className="rounded-2xl bg-white border border-[#e0d8cc] p-8 text-center shadow-sm">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-black text-[#1C3A2A] mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Job Posted!
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Your job listing is live. Workers across Uganda can now find and contact you.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent("I just posted a job on Uganda Business Hub! Find work here: https://ugandabiz.com/jobs")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white text-center"
            >
              📲 Share on WhatsApp
            </a>
            <button
              onClick={() => router.push("/jobs")}
              className="rounded-xl border border-[#e0d8cc] py-3 text-sm font-bold text-[#1C3A2A]"
            >
              View All Jobs →
            </button>
          </div>
        </div>
      )}
```

- [ ] **Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Open `http://localhost:3000/jobs/post` and verify the progress bar appears at the top of the form. Submit a test job and confirm the success screen shows the WhatsApp share button.**

- [ ] **Step 7: Commit**

```bash
git add app/jobs/post/PostJobForm.tsx
git commit -m "feat: post job form progress indicator and success share button"
```

---

## Task 8: WorkerForm — Progress Indicator + Success Share Button

**Files:**
- Modify: `app/jobs/worker/new/WorkerForm.tsx`

Same pattern as Task 7. Copy the `ProgressBar` component and apply it.

- [ ] **Step 1: Read the current WorkerForm**

```bash
cat app/jobs/worker/new/WorkerForm.tsx
```

Note the step state and success screen structure.

- [ ] **Step 2: Add the same `ProgressBar` component above `export default function WorkerForm`:**

```tsx
function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
        <span>{label}</span>
        <span>Step {current} of {total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#e0d8cc] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#1C3A2A] transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add `<ProgressBar current={1} total={2} label="Your Details" />` above the first section of the form fields, and `<ProgressBar current={2} total={2} label="Skills & Availability" />` above the skills/optional section.**

- [ ] **Step 4: Replace the success screen with:**

```tsx
      {step === "success" && (
        <div className="rounded-2xl bg-white border border-[#e0d8cc] p-8 text-center shadow-sm">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-black text-[#1C3A2A] mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Profile Created!
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Employers across Uganda can now find and contact you directly.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent("I just registered as a worker on Uganda Business Hub! Employers can find me here: https://ugandabiz.com/jobs")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white text-center"
            >
              📲 Share Your Profile on WhatsApp
            </a>
            <button
              onClick={() => router.push("/jobs")}
              className="rounded-xl border border-[#e0d8cc] py-3 text-sm font-bold text-[#1C3A2A]"
            >
              Browse Jobs →
            </button>
          </div>
        </div>
      )}
```

- [ ] **Step 5: Run TypeScript check and verify**

```bash
npx tsc --noEmit
```

Open `http://localhost:3000/jobs/worker/new` — confirm progress bar visible and success screen has share button.

- [ ] **Step 6: Commit**

```bash
git add app/jobs/worker/new/WorkerForm.tsx
git commit -m "feat: worker form progress indicator and success share button"
```

---

## Task 9: Worker Profile Page — Breadcrumb + WhatsApp Button

**Files:**
- Modify: `app/jobs/worker/[id]/page.tsx`

- [ ] **Step 1: Read the current worker profile page**

```bash
cat "app/jobs/worker/[id]/page.tsx"
```

- [ ] **Step 2: Add a `Breadcrumb` component at the top of the file (before the page component):**

```tsx
function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-6">
      <Link href="/" className="hover:text-[#1C3A2A] transition-colors">Home</Link>
      <span className="text-slate-300">›</span>
      <Link href="/jobs" className="hover:text-[#1C3A2A] transition-colors">Jobs</Link>
      <span className="text-slate-300">›</span>
      <span className="text-[#1C3A2A]">Worker Profile</span>
    </nav>
  );
}
```

Make sure `Link` is imported: `import Link from "next/link";`

- [ ] **Step 3: Add `<Breadcrumb />` as the first element inside the page's main container div, just above the worker name/header.**

- [ ] **Step 4: Find the WhatsApp contact button in the page. Make it prominent by replacing its current classes with:**

```tsx
className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#25D366] py-4 text-base font-black text-white shadow-md hover:opacity-90 transition-opacity"
```

And add a fallback below it: if no WhatsApp number but phone exists, show:

```tsx
{!worker.contact_whatsapp && worker.contact_phone && (
  <a
    href={`tel:${worker.contact_phone}`}
    className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-[#1C3A2A] py-4 text-base font-black text-[#1C3A2A] hover:bg-[#f5f0e8] transition-colors"
  >
    📞 Call {worker.name.split(" ")[0]}
  </a>
)}
```

- [ ] **Step 5: TypeScript check and verify**

```bash
npx tsc --noEmit
```

Open any worker profile URL and check breadcrumb appears and WhatsApp button is large and green.

- [ ] **Step 6: Commit**

```bash
git add "app/jobs/worker/[id]/page.tsx"
git commit -m "feat: worker profile breadcrumb, prominent WhatsApp button, phone fallback"
```

---

## Task 10: Final QA Pass

- [ ] **Step 1: Run TypeScript check across the full project**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Open each page and verify at 375px mobile width (use browser DevTools device emulation)**

| Page | Check |
|------|-------|
| `/` | Hamburger nav works, hero CTAs visible, pillars 2-col, ideas teaser shows, jobs teaser shows |
| `/ideas` | Chip filters scroll horizontally, featured card full-width, grid is 2-col |
| `/jobs` | Job cards show icon + title + salary + WhatsApp button |
| `/jobs/post` | Progress bar visible at top |
| `/jobs/worker/new` | Progress bar visible at top |
| `/jobs/worker/[id]` | Breadcrumb at top, WhatsApp button large and green |

- [ ] **Step 3: Open each page at 1280px desktop width and verify**

| Page | Check |
|------|-------|
| `/` | Desktop nav shows links + "Post a Job" button (no hamburger) |
| `/ideas` | Featured card full-width, grid 2-col |
| `/jobs` | Cards readable, no overflow |

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: UI/UX polish complete — homepage, ideas, jobs, forms"
```

---

## Self-Review Checklist

- [x] **Nav + hamburger** — Task 3
- [x] **Hero with dual CTA + social proof badge** — Task 3
- [x] **Pillar cards (Post a Job / Find Work)** — Task 4
- [x] **Ideas teaser on homepage (magazine: 1 featured + 2 grid)** — Task 4
- [x] **Jobs teaser on homepage (3 horizontal rows)** — Task 4
- [x] **Ideas page: chip filters + magazine grid** — Task 5
- [x] **Ideas page: empty state with clear-filters button** — Task 5
- [x] **Jobs page: horizontal card with icon + improved empty state** — Task 6
- [x] **PostJobForm: progress bar + WhatsApp share on success** — Task 7
- [x] **WorkerForm: progress bar + WhatsApp share on success** — Task 8
- [x] **Worker profile: breadcrumb + prominent WhatsApp + phone fallback** — Task 9
- [x] **Georgia serif CSS variable** — Task 1
- [x] **Colors unchanged throughout** — enforced by using existing hex values `#1C3A2A`, `#F5C842` from the app
