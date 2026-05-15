# Uganda Business Hub — Handoff (2026-05-15)

## Session Summary

This session executed the Uganda Business Hub implementation plan
(`docs/superpowers/plans/2026-05-12-uganda-business-hub.md`) using
subagent-driven development, deployed LocateUG to Vercel, and fixed
two navigation bugs discovered during testing.

---

## What Was Completed This Session

### Tasks from the Business Hub plan

| Task | Description | Status |
|------|-------------|--------|
| 1 | Supabase migration — `jobs` + `worker_profiles` tables | ✅ Already done (prior session) |
| 2 | `lib/supabase.ts` + `lib/constants/skills.ts` | ✅ Already done |
| 3 | `POST /api/jobs` and `POST /api/workers` routes | ✅ Already done |
| 4 | Post-a-job form at `/jobs/post` | ✅ Already done |
| 5 | Worker registration form at `/jobs/worker/new` | ✅ Already done |
| 6 | Public worker profile page at `/jobs/worker/[id]` | ✅ Already done |
| 7 | `/jobs` page — Browse Jobs + Worker Profiles tabs | ✅ Already done |
| 8 | Three-pillar hero on homepage (Ideas / Businesses / Jobs) | ✅ Done this session |
| 9 | `HomeJobsTeaser` server component + wired into `app/page.tsx` | ✅ Done this session |
| 10 | LocateUG production URL in Businesses pillar | ✅ Done this session |

### Bug fixes this session

| Bug | Fix | Commit |
|-----|-----|--------|
| `locateug.vercel.app/map` returned 404 (no deployment) | Deployed LocateUG from `d:/projects/uganda-map` via `vercel --prod` | — |
| Businesses pillar pointed to wrong URL after deploy | Updated href to `https://uganda-map-topaz.vercel.app/map` | `3d7eb8a` |
| Business Ideas pillar used `#ideas` anchor (broken) | Changed to `<Link href="/ideas">` | `6ff5f09` |

### Commits this session

```
6ff5f09 fix: Business Ideas pillar links to /ideas page instead of broken #ideas anchor
3d7eb8a fix: update Businesses pillar link to deployed LocateUG URL
48c9edf feat: live jobs teaser via HomeJobsTeaser server component
a17fb89 feat: three-pillar hero section — Ideas / Businesses / Jobs
```

---

## Current State of the App

### URLs (local dev — `npm run dev` in `d:/projects/uganda-business-ideas`)

| Page | URL | Status |
|------|-----|--------|
| Homepage | `http://localhost:3000` | ✅ Three-pillar hero + live jobs teaser |
| Business Ideas | `http://localhost:3000/ideas` | ✅ Search + filter + sort |
| Jobs browse | `http://localhost:3000/jobs` | ✅ Two tabs, skill/district filters |
| Post a job | `http://localhost:3000/jobs/post` | ✅ Form → Supabase `jobs` (status=pending) |
| Worker registration | `http://localhost:3000/jobs/worker/new` | ✅ Form → Supabase `worker_profiles` |
| Worker profile | `http://localhost:3000/jobs/worker/[id]` | ✅ Public card + contact buttons |
| Admin leads | `http://localhost:3000/admin/leads` | ✅ Read-only, unauthenticated |
| LocateUG map | `https://uganda-map-topaz.vercel.app/map` | ✅ Deployed on Vercel |

### Supabase project

- Project: `uganda-business-ideas`
- ID: `cdjaqdxvvdiiivjjiqbr`
- Region: `eu-central-1`
- Tables: `jobs`, `worker_profiles`, `leads`, `admin_profiles`

### LocateUG project

- Repo: `d:/projects/uganda-map`
- Live URL: `https://uganda-map-topaz.vercel.app`
- Map page: `https://uganda-map-topaz.vercel.app/map`
- Deploy command: `cd d:/projects/uganda-map && vercel --prod`

---

## Seeding Test Data

To see real content in the jobs teaser and `/jobs` page, run this in
Supabase SQL Editor:

```sql
INSERT INTO public.jobs (title, skill_category, district, town, employer_name, contact_whatsapp, status, featured)
VALUES ('Carpenter Needed', 'Carpenter', 'Kampala', 'Nakawa', 'Mukalazi Hardware', '256700000000', 'active', false);

INSERT INTO public.jobs (title, skill_category, district, town, employer_name, contact_whatsapp, pay_amount, pay_period, job_type, status, featured)
VALUES ('Security Guard', 'Security guard', 'Wakiso', 'Nansana', 'SafeGuard Ltd', '256701111111', 500000, 'monthly', 'permanent', 'active', true);
```

---

## Open Items (Next Session)

These are the highest-priority items not yet done, in recommended order:

### 1. Auth gate for `/admin/leads` — HIGH
The admin leads page is currently public and unauthenticated. Anyone
who knows the URL can see all leads.

**Approach:** Add a simple server-side auth check using Supabase Auth
(email + password). No UI redesign needed — just a redirect to a login
page if not signed in.

**Files to touch:**
- `app/admin/leads/page.tsx` — add session check, redirect if no session
- `app/auth/login/page.tsx` — simple email/password login form (new)
- `app/api/auth/route.ts` — sign-in handler (new)

### 2. Jobs moderation — MEDIUM
Submitted jobs land with `status = 'pending'`. There is no admin UI to
approve them to `status = 'active'`. Currently you must approve manually
in the Supabase SQL Editor.

**Approach:** Add a simple `/admin/jobs` page (server-rendered, same
pattern as `/admin/leads`) that lists pending jobs with Approve / Reject
buttons.

**Files to touch:**
- `app/admin/jobs/page.tsx` — new server component listing pending jobs
- `app/api/admin/jobs/[id]/route.ts` — PATCH to update status

### 3. Deploy `uganda-business-ideas` to Vercel — MEDIUM
The main app (`d:/projects/uganda-business-ideas`) is only running
locally. It has never been deployed.

**Steps:**
```powershell
cd d:/projects/uganda-business-ideas
vercel --prod
```
Then set env vars in the Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### 4. Workers moderation — LOW
Workers register with `status = 'active'` immediately (no review).
This is intentional for now but may need a moderation step later.

### 5. Featured job payment flow — LOW
The post-job success screen shows a WhatsApp upsell to pay UGX 20,000
for a featured badge. The actual payment is manual (WhatsApp message).
A proper payment flow (MTN MoMo or Airtel Money API) is a future batch.

---

## Environment Variables Required

For `d:/projects/uganda-business-ideas`:
```
NEXT_PUBLIC_SUPABASE_URL=https://cdjaqdxvvdiiivjjiqbr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase project settings>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase project settings>
```

For `d:/projects/uganda-map`:
```
NEXT_PUBLIC_SUPABASE_URL=<locateug supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<locateug anon key>
SUPABASE_SERVICE_ROLE_KEY=<locateug service role key>
NEXT_PUBLIC_APP_URL=https://uganda-map-topaz.vercel.app
```

---

## Key Architecture Notes

- **No user auth in the jobs/workers flow** — all contact is via
  WhatsApp/phone. This is intentional. Auth is only needed for admin.
- **Jobs submitted as `pending`** — they don't appear on `/jobs` until
  manually (or admin-UI) set to `active` in Supabase.
- **Workers submit as `active`** — they appear immediately on the workers
  tab.
- **HomeJobsTeaser is a server component** — it fetches live from
  Supabase on each request (revalidate: 60s). It renders outside
  `HomeClient` in `app/page.tsx`.
- **`lib/supabase.ts`** — browser client (used in client components and
  server routes).
- **`lib/supabase/server.ts`** — server-only client using service role
  key (used in `/admin/leads`).

---

## Recommended First Task Next Session

Start with **auth gate for `/admin/leads`**. It is the highest risk
open item (public exposure of lead data). Use the
`superpowers:brainstorming` skill first, then `superpowers:writing-plans`
to spec it out before touching code.
