# Job Scraper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically scrape Uganda job listings from BrighterMonday Uganda and PSC Uganda daily, store them in the existing `jobs` table, display them on `/jobs` with source badges, and auto-expire/delete stale listings.

**Architecture:** Two TypeScript scrapers (`lib/scrapers/`) fetch and parse HTML from BrighterMonday and PSC Uganda. Two Vercel Cron endpoints (`/api/cron/scrape-jobs` and `/api/cron/expire-jobs`) run daily at 6 AM and 6:30 AM EAT. The existing `jobs` table gets 4 new columns; the existing `JobsClient.tsx` gets source badges and expiry labels.

**Tech Stack:** Next.js 16 App Router, Supabase (postgres), Vercel Cron, `node-html-parser` (lightweight HTML parser, no browser required), TypeScript

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `lib/scrapers/types.ts` | `ScrapedJob` shared type |
| Create | `lib/scrapers/brightermonday.ts` | BrighterMonday Uganda scraper |
| Create | `lib/scrapers/psc.ts` | PSC Uganda scraper |
| Create | `app/api/cron/scrape-jobs/route.ts` | Daily scrape cron endpoint |
| Create | `app/api/cron/expire-jobs/route.ts` | Daily expiry cron endpoint |
| Create | `vercel.json` | Register cron schedules |
| Modify | `app/jobs/JobsClient.tsx` | Add source badge, posted-ago, expiry countdown |
| Supabase | SQL migration via Supabase dashboard | 4 new columns + unique constraint on `jobs` |

---

## Task 1: Install `node-html-parser`

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install the package**

Run in `d:\projects\uganda-business-ideas`:
```bash
npm install node-html-parser
```
Expected output: `added 1 package` (or similar). No peer dependency warnings expected.

- [ ] **Step 2: Verify it installed**

```bash
cat package.json | grep node-html-parser
```
Expected: `"node-html-parser": "^x.x.x"` in dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install node-html-parser for job scraping"
```

---

## Task 2: Supabase — Add columns to `jobs` table

**Files:**
- Supabase dashboard SQL editor (no local file — run directly against the live DB)

The `jobs` table needs 4 new nullable columns and a unique constraint to prevent duplicate scrape inserts.

- [ ] **Step 1: Open Supabase SQL editor**

Go to your Supabase project dashboard → SQL Editor → New query.

Your Supabase project URL is in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`. The project is `cdjaqdxvvdiiivjjiqbr` (from memory).

- [ ] **Step 2: Run the migration SQL**

```sql
-- Add scraping columns to jobs table
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_job_id text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Unique constraint to prevent duplicate scrape inserts
ALTER TABLE jobs
  ADD CONSTRAINT jobs_source_source_job_id_key
  UNIQUE (source, source_job_id);
```

Expected: "Success. No rows returned."

- [ ] **Step 3: Verify columns exist**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'jobs'
  AND column_name IN ('source', 'source_url', 'source_job_id', 'expires_at')
ORDER BY column_name;
```

Expected: 4 rows, all `is_nullable = YES`.

- [ ] **Step 4: Commit a note**

```bash
git commit --allow-empty -m "chore: jobs table migration — added source, source_url, source_job_id, expires_at columns (applied in Supabase dashboard)"
```

---

## Task 3: Create `ScrapedJob` type

**Files:**
- Create: `lib/scrapers/types.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/scrapers/types.ts
export type ScrapedJob = {
  title: string;
  employer_name: string;
  district: string;
  skill_category: string;
  job_type: string | null;
  description: string | null;
  source: "brightermonday" | "psc";
  source_url: string;
  source_job_id: string;
  expires_at: string | null; // ISO 8601 timestamp — null means use default 30-day expiry
};
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/scrapers/types.ts
git commit -m "feat: add ScrapedJob type for job scrapers"
```

---

## Task 4: Build BrighterMonday scraper

**Files:**
- Create: `lib/scrapers/brightermonday.ts`

BrighterMonday Uganda lists jobs at `https://www.brightermonday.co.ug/jobs`. Each listing card has a title, employer, location, category, and a link to the detail page. We scrape 3 pages (page=1,2,3).

The category mapping below converts BrighterMonday's category names to your existing `skill_category` values used in the `jobs` table.

- [ ] **Step 1: Create the scraper file**

```typescript
// lib/scrapers/brightermonday.ts
import { parse } from "node-html-parser";
import type { ScrapedJob } from "./types";

const BASE_URL = "https://www.brightermonday.co.ug";
const PAGES = 3;

// Maps BrighterMonday category names → your skill_category values
const CATEGORY_MAP: Record<string, string> = {
  "accounting": "Accounting / Finance",
  "finance": "Accounting / Finance",
  "administration": "Administration",
  "customer service": "Customer Service",
  "education": "Education / Teaching",
  "teaching": "Education / Teaching",
  "engineering": "Engineering",
  "health": "Healthcare",
  "healthcare": "Healthcare",
  "human resources": "Human Resources",
  "ict": "ICT / Technology",
  "information technology": "ICT / Technology",
  "technology": "ICT / Technology",
  "logistics": "Logistics / Transport",
  "transport": "Logistics / Transport",
  "marketing": "Marketing / Sales",
  "sales": "Marketing / Sales",
  "procurement": "Procurement / Supply Chain",
  "supply chain": "Procurement / Supply Chain",
  "legal": "Legal",
  "media": "Media / Communications",
  "communications": "Media / Communications",
  "ngo": "NGO / Non-Profit",
  "construction": "Construction / Building",
  "building": "Construction / Building",
  "agriculture": "Agriculture / Farming",
  "farming": "Agriculture / Farming",
  "security": "Security / Guard",
  "hospitality": "Hospitality / Tourism",
  "tourism": "Hospitality / Tourism",
  "government": "Government / Public Service",
  "public service": "Government / Public Service",
};

function mapCategory(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return value;
  }
  return raw.trim() || "Other";
}

function extractJobId(url: string): string {
  // BrighterMonday job URLs look like: /jobs/some-job-title-12345
  const match = url.match(/\/jobs\/([^/?#]+)/);
  return match ? match[1] : url;
}

async function fetchPage(page: number): Promise<ScrapedJob[]> {
  const url = `${BASE_URL}/jobs?page=${page}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BusinessYooBot/1.0)" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];

  const html = await res.text();
  const root = parse(html);
  const jobs: ScrapedJob[] = [];

  // Job cards are <article> or <div> elements with job listing data
  // Try multiple selectors to be resilient to markup changes
  const cards = root.querySelectorAll("article.job, div.job-listing, [data-job-id], .job-card, article[class*='job']");

  for (const card of cards) {
    try {
      const titleEl = card.querySelector("h2 a, h3 a, .job-title a, a[class*='title']");
      const title = titleEl?.text?.trim() ?? "";
      if (!title) continue;

      const href = titleEl?.getAttribute("href") ?? "";
      const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      const sourceJobId = extractJobId(href);

      const employerEl = card.querySelector(".company-name, .employer, [class*='company'], [class*='employer']");
      const employerName = employerEl?.text?.trim() ?? "Unknown Employer";

      const locationEl = card.querySelector(".location, [class*='location'], [class*='district']");
      const locationRaw = locationEl?.text?.trim() ?? "Kampala";
      // Extract district: "Kampala, Uganda" → "Kampala"
      const district = locationRaw.split(",")[0].trim() || "Kampala";

      const categoryEl = card.querySelector(".category, [class*='category'], [class*='sector']");
      const categoryRaw = categoryEl?.text?.trim() ?? "";
      const skillCategory = mapCategory(categoryRaw);

      const jobTypeEl = card.querySelector(".job-type, [class*='type'], [class*='contract']");
      const jobType = jobTypeEl?.text?.trim() ?? null;

      const descEl = card.querySelector(".description, .summary, [class*='desc'], [class*='summary']");
      const description = descEl?.text?.trim().slice(0, 500) ?? null;

      jobs.push({
        title,
        employer_name: employerName,
        district,
        skill_category: skillCategory,
        job_type: jobType,
        description,
        source: "brightermonday",
        source_url: sourceUrl,
        source_job_id: sourceJobId,
        expires_at: null,
      });
    } catch {
      // Skip malformed cards — never crash the full run
    }
  }

  return jobs;
}

export async function scrapeBrighterMonday(): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = [];

  for (let page = 1; page <= PAGES; page++) {
    const jobs = await fetchPage(page);
    results.push(...jobs);
    if (page < PAGES) {
      // 1-second delay between pages to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return results;
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/scrapers/brightermonday.ts
git commit -m "feat: add BrighterMonday Uganda job scraper"
```

---

## Task 5: Build PSC Uganda scraper

**Files:**
- Create: `lib/scrapers/psc.ts`

PSC Uganda lists vacancies at `https://www.psc.go.ug/vacancies`. Each entry has a job title, ministry, application deadline, and a link to the detail page. PSC jobs use the application deadline as `expires_at`.

- [ ] **Step 1: Create the scraper file**

```typescript
// lib/scrapers/psc.ts
import { parse } from "node-html-parser";
import type { ScrapedJob } from "./types";

const PSC_URL = "https://www.psc.go.ug/vacancies";

function parseDeadline(raw: string): string | null {
  // PSC deadlines appear as "31st May 2026", "30 June 2026", "31/05/2026"
  if (!raw) return null;
  try {
    // Remove ordinal suffixes: "31st" → "31", "22nd" → "22"
    const cleaned = raw.replace(/(\d+)(st|nd|rd|th)/gi, "$1").trim();
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

function extractJobId(url: string): string {
  // PSC URLs: /vacancies/some-title or /node/123
  const match = url.match(/\/(vacancies|node)\/([^/?#]+)/);
  return match ? match[2] : url.replace(/[^a-z0-9]/gi, "-").slice(0, 80);
}

export async function scrapePSC(): Promise<ScrapedJob[]> {
  const BASE_URL = "https://www.psc.go.ug";
  let html: string;

  try {
    const res = await fetch(PSC_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BusinessYooBot/1.0)" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    html = await res.text();
  } catch {
    return [];
  }

  const root = parse(html);
  const jobs: ScrapedJob[] = [];

  // PSC uses a table or list of vacancy entries
  const rows = root.querySelectorAll(
    "table tr, .view-content .views-row, article, .vacancy-item, li[class*='vacancy']"
  );

  for (const row of rows) {
    try {
      const titleEl = row.querySelector("a, h2, h3, td:first-child, .views-field-title a");
      const title = titleEl?.text?.trim() ?? "";
      if (!title || title.length < 5) continue;

      const href = titleEl?.getAttribute("href") ?? "";
      const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      const sourceJobId = extractJobId(href || title);

      // Ministry / employer — look for a second column or specific field
      const ministryEl = row.querySelector(
        "td:nth-child(2), .views-field-field-ministry, [class*='ministry'], [class*='employer']"
      );
      const employerName = ministryEl?.text?.trim() || "Public Service Commission Uganda";

      // Deadline — look for date fields
      const deadlineEl = row.querySelector(
        "td:last-child, .views-field-field-deadline, [class*='deadline'], [class*='closing'], time"
      );
      const deadlineRaw = deadlineEl?.text?.trim() ?? "";
      const expiresAt = parseDeadline(deadlineRaw);

      jobs.push({
        title,
        employer_name: employerName,
        district: "Kampala",
        skill_category: "Government / Public Service",
        job_type: "full_time",
        description: null,
        source: "psc",
        source_url: sourceUrl,
        source_job_id: sourceJobId,
        expires_at: expiresAt,
      });
    } catch {
      // Skip malformed rows — never crash the full run
    }
  }

  // Remove duplicates by source_job_id (table rows can repeat header)
  const seen = new Set<string>();
  return jobs.filter(j => {
    if (seen.has(j.source_job_id)) return false;
    seen.add(j.source_job_id);
    return true;
  });
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/scrapers/psc.ts
git commit -m "feat: add PSC Uganda government job scraper"
```

---

## Task 6: Build `/api/cron/scrape-jobs` route

**Files:**
- Create: `app/api/cron/scrape-jobs/route.ts`

This endpoint is called by Vercel Cron at 3:00 AM UTC daily. It runs both scrapers in parallel and upserts results into the `jobs` table.

- [ ] **Step 1: Create the route file**

```typescript
// app/api/cron/scrape-jobs/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeBrighterMonday } from "@/lib/scrapers/brightermonday";
import { scrapePSC } from "@/lib/scrapers/psc";
import type { ScrapedJob } from "@/lib/scrapers/types";

export const maxDuration = 60; // Vercel max for hobby plan cron

function defaultExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

export async function GET(req: Request) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Run both scrapers in parallel
  const [bmJobs, pscJobs] = await Promise.all([
    scrapeBrighterMonday().catch(() => [] as ScrapedJob[]),
    scrapePSC().catch(() => [] as ScrapedJob[]),
  ]);

  const allJobs = [...bmJobs, ...pscJobs];

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const job of allJobs) {
    try {
      const row = {
        title: job.title,
        employer_name: job.employer_name,
        district: job.district,
        skill_category: job.skill_category,
        job_type: job.job_type,
        description: job.description,
        source: job.source,
        source_url: job.source_url,
        source_job_id: job.source_job_id,
        expires_at: job.expires_at ?? defaultExpiresAt(),
        status: "active",
        featured: false,
        // Required fields with safe defaults for scraped jobs
        contact_whatsapp: null,
        contact_phone: null,
        contact_walkin: null,
        town: null,
        pay_amount: null,
        pay_period: null,
        gender_pref: null,
        min_education: null,
        accommodation: null,
        food_provided: null,
        languages: null,
      };

      const { error, data } = await supabase
        .from("jobs")
        .upsert(row, { onConflict: "source,source_job_id", ignoreDuplicates: false })
        .select("id")
        .single();

      if (error) {
        errors++;
      } else if (data) {
        inserted++;
      } else {
        updated++;
      }
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    brightermonday: bmJobs.length,
    psc: pscJobs.length,
    inserted,
    updated,
    errors,
  });
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/scrape-jobs/route.ts
git commit -m "feat: add /api/cron/scrape-jobs Vercel cron endpoint"
```

---

## Task 7: Build `/api/cron/expire-jobs` route

**Files:**
- Create: `app/api/cron/expire-jobs/route.ts`

This endpoint is called by Vercel Cron at 3:30 AM UTC daily. It expires overdue jobs, deletes 7-day-old expired jobs, and also re-checks BrighterMonday to immediately expire any job that has vanished from the live site.

- [ ] **Step 1: Create the route file**

```typescript
// app/api/cron/expire-jobs/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeBrighterMonday } from "@/lib/scrapers/brightermonday";

export const maxDuration = 60;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Expire jobs where expires_at has passed
  const { count: expiredCount } = await supabase
    .from("jobs")
    .update({ status: "expired" })
    .eq("status", "active")
    .not("expires_at", "is", null)
    .lt("expires_at", new Date().toISOString())
    .select("id", { count: "exact", head: true });

  // 2. Delete expired jobs older than 7 days (audit window)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: deletedCount } = await supabase
    .from("jobs")
    .delete()
    .eq("status", "expired")
    .not("expires_at", "is", null)
    .lt("expires_at", sevenDaysAgo.toISOString())
    .select("id", { count: "exact", head: true });

  // 3. Re-check BrighterMonday: expire jobs that no longer appear on the live site
  let vanishedCount = 0;
  try {
    const liveJobs = await scrapeBrighterMonday();
    const liveIds = new Set(liveJobs.map(j => j.source_job_id));

    // Get all active BrighterMonday jobs from our DB
    const { data: dbJobs } = await supabase
      .from("jobs")
      .select("id, source_job_id")
      .eq("source", "brightermonday")
      .eq("status", "active");

    const vanishedIds = (dbJobs ?? [])
      .filter(j => !liveIds.has(j.source_job_id))
      .map(j => j.id);

    if (vanishedIds.length > 0) {
      await supabase
        .from("jobs")
        .update({ status: "expired" })
        .in("id", vanishedIds);
      vanishedCount = vanishedIds.length;
    }
  } catch {
    // Don't fail the whole cron if re-check fails
  }

  return NextResponse.json({
    expired: (expiredCount ?? 0) + vanishedCount,
    deleted: deletedCount ?? 0,
    vanished: vanishedCount,
  });
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/expire-jobs/route.ts
git commit -m "feat: add /api/cron/expire-jobs Vercel cron endpoint"
```

---

## Task 8: Register cron schedules in `vercel.json`

**Files:**
- Create: `vercel.json`

`vercel.json` does not exist yet — create it at the project root.

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape-jobs",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/expire-jobs",
      "schedule": "30 3 * * *"
    }
  ]
}
```

Both run daily: scrape at 3:00 AM UTC (6:00 AM EAT), expire at 3:30 AM UTC (6:30 AM EAT).

- [ ] **Step 2: Verify the JSON is valid**

```bash
node -e "require('./vercel.json'); console.log('valid')"
```
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: register job scraper cron jobs in vercel.json"
```

---

## Task 9: Set `CRON_SECRET` environment variable

**No code changes — configuration only.**

- [ ] **Step 1: Generate a secret**

Run in terminal to generate a random 32-char secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output.

- [ ] **Step 2: Add to `.env.local`**

Open `d:\projects\uganda-business-ideas\.env.local` and add:
```
CRON_SECRET=<paste-your-generated-secret-here>
```

- [ ] **Step 3: Add to Vercel**

Go to Vercel dashboard → your project → Settings → Environment Variables.
Add:
- Key: `CRON_SECRET`
- Value: (same secret from Step 1)
- Environment: Production + Preview

- [ ] **Step 4: Commit `.env.local` note (NOT the secret itself)**

`.env.local` is in `.gitignore` and must never be committed. Just confirm it's ignored:
```bash
git check-ignore .env.local
```
Expected: `.env.local` (meaning it IS ignored — good).

---

## Task 10: Update `JobsClient.tsx` — source badge, posted-ago, expiry countdown

**Files:**
- Modify: `app/jobs/JobsClient.tsx`

Three display additions to each job card:
1. Source badge: `Via BrighterMonday ↗` or `Via PSC Uganda ↗` linking to `source_url`
2. "Posted X ago" label using `created_at`
3. "Closes in X days" warning badge when `expires_at` is within 5 days

- [ ] **Step 1: Update the `Job` type** at the top of `JobsClient.tsx`

Find the existing `Job` type (lines 7–14) and add three new optional fields:

```typescript
type Job = {
  id: string; title: string; skill_category: string; district: string; town: string | null;
  employer_name: string; contact_whatsapp: string | null; contact_phone: string | null;
  contact_walkin: string | null; pay_amount: number | null; pay_period: string | null;
  job_type: string | null; gender_pref: string | null; min_education: string | null;
  accommodation: string | null; food_provided: string | null; languages: string[] | null;
  description: string | null; featured: boolean; created_at: string;
  // Scraped job fields
  source: string | null;
  source_url: string | null;
  expires_at: string | null;
};
```

- [ ] **Step 2: Add helper functions** after the `skillEmoji` function (after line 58):

```typescript
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function expiryLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days <= 0) return "Closes today";
  if (days <= 5) return `Closes in ${days}d`;
  return null;
}

function sourceLabel(source: string | null): string | null {
  if (source === "brightermonday") return "Via BrighterMonday";
  if (source === "psc") return "Via PSC Uganda";
  return null;
}
```

- [ ] **Step 3: Add badges inside the job card** — find the block that renders `{job.description && ...}` (around line 153) and add after it:

```tsx
{/* Posted-ago + source badge row */}
<div className="flex flex-wrap items-center gap-2 mt-2">
  <span className="text-[10px] text-slate-400">{timeAgo(job.created_at)}</span>
  {job.source && job.source_url && (
    <a
      href={job.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] font-semibold text-violet-500 hover:underline"
    >
      {sourceLabel(job.source)} ↗
    </a>
  )}
  {expiryLabel(job.expires_at) && (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
      {expiryLabel(job.expires_at)}
    </span>
  )}
</div>
```

- [ ] **Step 4: Verify the build compiles**

```bash
npm run build
```
Expected: Compiled successfully with no type errors.

- [ ] **Step 5: Commit**

```bash
git add app/jobs/JobsClient.tsx
git commit -m "feat: add source badge, posted-ago, and expiry countdown to jobs cards"
```

---

## Task 11: Manual test — trigger cron locally

Test the scrape endpoint locally before deploying to Vercel.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```
Wait for "Ready on http://localhost:3000".

- [ ] **Step 2: Trigger the scrape cron**

Open a second terminal and run:
```bash
curl -s -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)" http://localhost:3000/api/cron/scrape-jobs | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d)))"
```
Expected: JSON like `{ brightermonday: 45, psc: 12, inserted: 50, updated: 0, errors: 0 }`.

If `brightermonday: 0` — the HTML structure on BrighterMonday may have changed. Open `https://www.brightermonday.co.ug/jobs` in a browser, inspect a job card's class names, and update the selectors in `lib/scrapers/brightermonday.ts` Task 4 Step 1.

- [ ] **Step 3: Trigger the expire cron**

```bash
curl -s -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)" http://localhost:3000/api/cron/expire-jobs
```
Expected: `{ expired: 0, deleted: 0, vanished: 0 }` (nothing to expire yet — just inserted).

- [ ] **Step 4: Check `/jobs` page**

Open `http://localhost:3000/jobs` in browser.
- Scraped jobs should appear in the list
- Source badges (`Via BrighterMonday ↗`, `Via PSC Uganda ↗`) should be visible
- "Posted X ago" should show on all cards
- No expiry warnings yet (jobs just inserted, 30 days away)

- [ ] **Step 5: Commit test confirmation note**

```bash
git commit --allow-empty -m "test: manually verified scrape cron + /jobs display locally"
```

---

## Task 12: Deploy and verify on Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git push
```
Vercel auto-deploys on push. Wait ~2 minutes for deploy to complete.

- [ ] **Step 2: Verify crons appear in Vercel dashboard**

Go to Vercel dashboard → your project → Settings → Crons.
Expected: Two crons listed — `scrape-jobs` (daily 3:00 AM UTC) and `expire-jobs` (daily 3:30 AM UTC).

- [ ] **Step 3: Add `CRON_SECRET` to Vercel if not done in Task 9 Step 3**

Go to Vercel → Settings → Environment Variables. Confirm `CRON_SECRET` is set for Production.

- [ ] **Step 4: Manually trigger the scrape cron on production**

In Vercel dashboard → Settings → Crons, click "Run" next to `scrape-jobs`.
Or trigger via curl against the production URL:
```bash
curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-vercel-url.vercel.app/api/cron/scrape-jobs
```
Expected: `{ brightermonday: N, psc: N, inserted: N, ... }`

- [ ] **Step 5: Check production `/jobs` page**

Open the live site `/jobs`. Scraped jobs should appear with source badges.

- [ ] **Step 6: Final commit**

```bash
git commit --allow-empty -m "chore: job scraper deployed and verified on Vercel"
```

---

## Notes for the Implementer

**If BrighterMonday returns 0 jobs:** BrighterMonday's HTML structure can change. Open the URL in a browser, right-click a job card → Inspect, and find the correct CSS class for job cards, titles, employers, and locations. Update the selectors in `lib/scrapers/brightermonday.ts`.

**If PSC returns 0 jobs:** Same approach — inspect the vacancies page HTML and update selectors in `lib/scrapers/psc.ts`.

**`SUPABASE_SERVICE_ROLE_KEY` required:** The cron routes use the service role key (bypasses RLS). Confirm it is set in `.env.local` and in Vercel environment variables. The key is in your Supabase project → Settings → API → `service_role` key.

**Vercel Hobby plan cron limit:** Free Vercel plan allows 2 cron jobs, each running at most once per day. Both crons fit within this limit.

**Selector resilience:** The scrapers use multiple CSS selector candidates (`querySelector("a, h2, h3, ...")`) to be resilient to minor HTML changes. If a site does a major redesign, update the primary selector.
