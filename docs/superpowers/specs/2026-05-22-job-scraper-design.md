# Job Scraper — Design Spec
**Date:** 2026-05-22  
**Project:** Business Yoo (Uganda Business Ideas)  
**Status:** Approved, ready for implementation

---

## Overview

Automatically scrape Uganda job listings from BrighterMonday Uganda and PSC Uganda daily. Jobs are stored in the existing `jobs` table, tagged with their source, displayed on `/jobs` alongside manually-posted jobs, and automatically expired/deleted when stale.

---

## Sources

| Source | URL | Type | Volume |
|--------|-----|------|--------|
| BrighterMonday Uganda | `https://www.brightermonday.co.ug/jobs` | Formal private sector | ~90 jobs/run (3 pages) |
| PSC Uganda | `https://www.psc.go.ug/vacancies` | Government / civil service | ~10–20 jobs/run |

---

## 1. Data & Schema

### New columns on `jobs` table

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `source` | text | yes | `"brightermonday"` or `"psc"` — null for manually posted jobs |
| `source_url` | text | yes | Link back to original listing |
| `expires_at` | timestamptz | yes | Set to `now() + 30 days` on scrape; PSC jobs use their posted deadline. NULL for manual jobs |
| `source_job_id` | text | yes | Unique ID from source site — used for upsert deduplication |

### Unique constraint
`UNIQUE(source, source_job_id)` — prevents duplicate rows on re-scrape.

### Status lifecycle for scraped jobs
```
inserted → active → expired → [deleted after 7 days]
```
- Scraped jobs are inserted as `status = "active"` directly (no admin approval queue)
- The `/jobs` page already filters `status = "active"` — no frontend query changes needed
- Expired jobs are hidden immediately; deleted 7 days later for audit purposes

---

## 2. Scraper Logic

### Files
- `lib/scrapers/brightermonday.ts`
- `lib/scrapers/psc.ts`
- `lib/scrapers/types.ts` — shared `ScrapedJob` type

### `ScrapedJob` type
```ts
type ScrapedJob = {
  title: string;
  employer_name: string;
  district: string;
  skill_category: string;
  job_type: string | null;
  description: string | null;
  source: "brightermonday" | "psc";
  source_url: string;
  source_job_id: string;
  expires_at: string | null; // ISO timestamp — null = use default 30 days
};
```

### BrighterMonday scraper (`lib/scrapers/brightermonday.ts`)
- Fetches up to 3 pages of `/jobs` listings
- Parses: title, employer, location (mapped to Uganda district), category, job type, description, canonical URL
- Maps BrighterMonday category names → existing `skill_category` values in the `jobs` table
- `source_job_id` = BrighterMonday's job slug or numeric ID extracted from the listing URL
- `expires_at` = null (default 30-day expiry applied at insert time)
- 1-second delay between page requests

### PSC scraper (`lib/scrapers/psc.ts`)
- Fetches the PSC vacancies page
- Parses: job title, ministry name (used as `employer_name`), application deadline (used as `expires_at`), source URL
- `district` = "Kampala" (all PSC jobs are central government)
- `skill_category` = "Government / Public Service"
- `source_job_id` = PSC reference number or URL slug

### Scraper safety rules
- Every job parse is wrapped in try/catch — one bad listing never crashes the full run
- If a field is missing, use a safe fallback (empty string, null) rather than throwing
- Both scrapers return `ScrapedJob[]` — same shape, easy to add more sources later

---

## 3. Cron Jobs

### Registration — `vercel.json`
```json
{
  "crons": [
    { "path": "/api/cron/scrape-jobs", "schedule": "0 3 * * *" },
    { "path": "/api/cron/expire-jobs", "schedule": "30 3 * * *" }
  ]
}
```
Both run at 3:00 AM and 3:30 AM UTC (6:00 AM and 6:30 AM EAT).

### Auth — `CRON_SECRET` env var
Both endpoints check `Authorization: Bearer <CRON_SECRET>`. Requests without the correct token return 401. Set `CRON_SECRET` in Vercel environment variables.

### `/api/cron/scrape-jobs`
1. Runs both scrapers in parallel (`Promise.all`)
2. For each `ScrapedJob`, upserts into `jobs` using `onConflict("source,source_job_id")`
3. New jobs: inserted with `status = "active"`, `expires_at = job.expires_at ?? now() + 30 days` (PSC jobs use their own deadline; all others default to 30 days)
4. Duplicate jobs: `updated_at` refreshed, all other fields updated in case content changed
5. Returns JSON summary: `{ brightermonday: 45, psc: 12, skipped: 8, errors: 0 }`

### `/api/cron/expire-jobs`
1. Sets `status = "expired"` for all scraped jobs where `expires_at < now()` and `status = "active"`
2. Permanently deletes rows where `expires_at < now() - interval '7 days'` and `status = "expired"`
3. Re-scrapes BrighterMonday job IDs: marks any `source_job_id` no longer in today's results as `status = "expired"` immediately
4. Returns JSON summary: `{ expired: 12, deleted: 5 }`

---

## 4. Job Display Updates (`app/jobs/JobsClient.tsx`)

### Source badge
- Scraped jobs show a small pill below the job title: `Via BrighterMonday ↗` or `Via PSC Uganda ↗`
- The pill links to `source_url`, opens in a new tab
- Manually posted jobs (null `source`) show nothing extra

### "Posted X ago" label
- All jobs show a human-readable relative time: "2 hours ago", "3 days ago", "Today"
- Derived from existing `created_at` field — no new data needed

### Expiry countdown
- Jobs with `expires_at` within 5 days show a warning badge: `Closes in 3 days`
- Jobs expiring today show: `Closes today`
- Only shown on scraped jobs (manual jobs have null `expires_at`)

### No structural changes
- No new tabs, sections, or pages
- Scraped and manual jobs share the same list, sorted: featured first, then `created_at` descending
- The `Job` type in `JobsClient.tsx` gets 3 new optional fields: `source`, `source_url`, `expires_at`

---

## 5. Admin

No changes to the admin approval flow. Scraped jobs bypass the queue (`status = "active"` on insert). Admin can still manually set `status = "expired"` on any job via Supabase dashboard if needed.

---

## 6. Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `CRON_SECRET` | Vercel env vars | Auth token for cron endpoints |
| `NEXT_PUBLIC_SUPABASE_URL` | Already exists | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Already exists | Used for upserts in cron routes |

---

## 7. File Map

```
lib/
  scrapers/
    types.ts           ← ScrapedJob type
    brightermonday.ts  ← BrighterMonday scraper
    psc.ts             ← PSC Uganda scraper

app/
  api/
    cron/
      scrape-jobs/
        route.ts       ← Daily scrape cron
      expire-jobs/
        route.ts       ← Daily expiry cron
  jobs/
    JobsClient.tsx     ← Add source badge, posted-ago, expiry countdown

vercel.json            ← Register cron schedules
```

---

## 8. Success Criteria

- Daily cron runs without errors in Vercel logs
- New jobs from BrighterMonday and PSC appear on `/jobs` within hours of posting
- Jobs older than 30 days (or past their deadline) disappear from the public page automatically
- No duplicate listings after multiple scrape runs
- Source badge is visible on all scraped jobs, linking to the original listing
- Manually posted jobs are unaffected
