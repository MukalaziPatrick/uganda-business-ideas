# Implementation Plan: Ideas Vertical

**Branch**: `try/spec-kit` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-ideas-vertical/spec.md`

## Summary

Migrate the existing `/ideas` vertical from static TypeScript data files (`app/data/ideas.ts` and friends) to a Supabase-backed implementation. The browse page gains URL-based filter state (shareable filtered views) and ISR caching (60-second freshness without deploys). The detail page gains a Related Ideas section (auto-derived, same category). All four supporting data types (ideas, stories, resources, suppliers) move to dedicated Supabase tables. Static files are deleted only after live production verification.

## Technical Context

**Language/Version**: TypeScript · Next.js 16.1.7 (App Router) · React 19.2.3

**Primary Dependencies**: `@supabase/supabase-js ^2.105.1`, Tailwind CSS 4, Vitest

**Storage**: Supabase PostgreSQL (`uganda-business-ideas` project). Service-role admin client (`createSupabaseAdminClient`) used for all server-side data fetches.

**Testing**: Vitest (unit); live URL verification per `quickstart.md` (integration/acceptance).

**Target Platform**: Vercel (production: `ugandabiz.lugandastudio.com`). ISR (`revalidate = 60`) is the caching mechanism — supported natively on Vercel.

**Project Type**: Web application — Next.js App Router with server components + client components.

**Performance Goals**: Browse page first contentful paint ≤ 2 s on 3G. Cache freshness ≤ 60 s.

**Constraints**: Service-role key bypasses RLS; anon-key path unused for data reads. **Because the admin client bypasses RLS, the `published = true` filter in every query function is the only security gate preventing unpublished ideas from reaching the browser.** Secrets in Vercel env vars only. No new infrastructure (Supabase + Vercel already in place).

**Scale/Scope**: 48–100 ideas, no pagination in v1. Single-digit writes per week (operator via Supabase dashboard).

## Constitution Check

*GATE: Must pass before proceeding to implementation.*

| Principle | Status | Notes |
|---|---|---|
| I. Stack Lock (Next.js App Router) | ✅ PASS | All new pages use App Router server components |
| I. Stack Lock (Supabase) | ✅ PASS | All data in Supabase; admin client pattern used |
| I. Stack Lock (Vercel) | ✅ PASS | ISR caching is a Vercel-native feature |
| II. AI Calls via OpenRouter | ✅ PASS | No AI calls in this feature |
| III. Payments = Pesapal | ✅ PASS | No payment flows in this feature |
| IV. Hub + Satellites Architecture | ✅ PASS | Ideas is the Ideas vertical; URL stays at `/ideas` as per confirmed decision |
| V. Homepage Freeze | ✅ PASS | Homepage (`app/page.tsx`) is not modified |
| RLS on new tables | ✅ PASS | RLS enabled on all 4 new tables (migration included) |
| No raw phone numbers in public pages | ✅ PASS | No contact data stored in ideas tables |
| Secrets in Vercel env vars | ✅ PASS | Uses existing `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-ideas-vertical/
├── plan.md              ← this file
├── research.md          ← Phase 0: decisions + rationale
├── data-model.md        ← Phase 1: schema + TypeScript types
├── quickstart.md        ← Phase 1: validation scenarios
├── contracts/
│   └── pages.md         ← Phase 1: page contracts + query function signatures
└── tasks.md             ← Phase 2 output (/speckit-tasks command)
```

### Source Code

```text
supabase/migrations/
├── 20260617000001_business_ideas.sql   ← create 4 tables + indexes
├── 20260617000002_ideas_rls.sql        ← RLS policies for all 4 tables
└── 20260617000003_seed_ideas.sql       ← (optional) placeholder; seed via TS script

scripts/
├── seed-ideas.ts                       ← reads seed-data/, upserts into Supabase
└── seed-data/                          ← static data files moved here from app/data/
    ├── ideas.ts
    ├── stories.ts
    ├── resources.ts
    └── suppliers.ts

lib/
├── supabase/
│   └── ideas-types.ts                  ← BusinessIdea, IdeaStory, IdeaResource, IdeaSupplier types
└── ideas/
    └── queries.ts                      ← getPublishedIdeas, getIdeaBySlug, getRelatedIdeas,
                                           getIdeaStories, getIdeaResources, getIdeaSuppliers,
                                           getPublishedIdeasCount

app/
├── ideas/
│   ├── page.tsx                        ← UPDATED: add revalidate=60, fetch from Supabase
│   ├── [slug]/
│   │   └── page.tsx                    ← UPDATED: add revalidate=60, fetch from Supabase + related ideas
│   └── IdeasDiscoveryClient.tsx        ← UPDATED: URL filter state via useSearchParams + router.replace
└── apps/
    └── page.tsx                        ← UPDATED: add revalidate=60, fetch idea count from Supabase
```

**Static files — moved, not deleted (last task, gated on FR-012a):**
```text
app/data/ideas.ts       ← moved to scripts/seed-data/ideas.ts
app/data/stories.ts     ← moved to scripts/seed-data/stories.ts
app/data/resources.ts   ← moved to scripts/seed-data/resources.ts
app/data/suppliers.ts   ← moved to scripts/seed-data/suppliers.ts
```
Files stay alive for re-seeding; the `app/` directory stops importing from `app/data/`.

## Implementation Sequence

### Step 1 — Database: create tables and RLS
Create `supabase/migrations/20260617000001_business_ideas.sql` — 4 tables with indexes.
Create `supabase/migrations/20260617000002_ideas_rls.sql` — RLS policies.
Apply migrations via `npm run supabase:push`.

### Step 2 — TypeScript types
Create `lib/supabase/ideas-types.ts` with all 4 entity types (exact definitions in `data-model.md`).

### Step 3 — Query layer
Create `lib/ideas/queries.ts` with all 7 query functions (signatures in `contracts/pages.md`).
Pattern: mirror `lib/land/queries.ts`. Each function returns safe empty fallback on error.

**Security requirement (critical)**: The service-role admin client bypasses RLS, so the query is the only enforcement layer.
- `getPublishedIdeas()` MUST include `.eq('published', true)`
- `getIdeaBySlug(slug)` MUST include `.eq('published', true)` — returns `null` (→ 404) for unpublished slugs
- `getRelatedIdeas()` and `getPublishedIdeasCount()` MUST include `.eq('published', true)`

**Vitest test** (`lib/ideas/queries.test.ts`): mock `createSupabaseAdminClient` and assert:
1. `getPublishedIdeas()` only ever calls `.eq('published', true)` before executing the query
2. `getIdeaBySlug('some-slug')` with a mocked row where `published = false` returns `null`

### Step 4 — Seed script
Create `scripts/seed-ideas.ts`:
- Import static arrays from `scripts/seed-data/ideas.ts`, `stories.ts`, `resources.ts`, `suppliers.ts`
- Map `budgetBand: 'under_500k'` → `budget_band: '200k_500k'`
- Upsert into Supabase using slug/id as conflict key (idempotent)
- Log success/failure counts
Run once: `npx tsx scripts/seed-ideas.ts`

### Step 5 — Browse page: Supabase + ISR
Update `app/ideas/page.tsx`:
- Add `export const revalidate = 60`
- Replace `import { ideas } from "../data/ideas"` with `getPublishedIdeas()` call
- Pass result to `IdeasDiscoveryClient`

### Step 6 — Browser filter: URL state
Update `app/ideas/IdeasDiscoveryClient.tsx`:
- Add `useSearchParams()` to read initial filter state from URL on mount
- On any filter change, call `router.replace()` to update URL without navigation
- Budget band labels updated: "200k–500k" replaces "Under 500k"

### Step 7 — Detail page: Supabase + ISR + dynamicParams + Related Ideas
Update `app/ideas/[slug]/page.tsx`:
- Add `export const revalidate = 60`
- Add `export const dynamicParams = true` — allows slugs added to Supabase after build to render on-demand via ISR without a redeploy (Next.js default is `true`, but make it explicit to document the intent)
- Replace static `getIdeaBySlug(slug)` with Supabase version (returns `null` → `notFound()` for unpublished or missing slugs)
- Replace static stories/resources/suppliers with Supabase query versions
- Add Related Ideas section at bottom (query: `getRelatedIdeas(slug, idea.category, 4)`)
- Update `generateStaticParams()` to pull slugs from Supabase (pre-renders known slugs at build; new slugs render on first request via dynamicParams)

### Step 8 — /apps page: cached count
Update `app/apps/page.tsx`:
- Add `export const revalidate = 60`
- Fetch `getPublishedIdeasCount()` and replace hardcoded count in Ideas card tagline

### Step 9 — Verification (FR-012a gates)
Run all scenarios in `quickstart.md` on the live production URL.
Confirm all three FR-012a gates are met.

### Step 10 — Move static files out of app/ (last, gated)
Move `app/data/ideas.ts`, `stories.ts`, `resources.ts`, `suppliers.ts` → `scripts/seed-data/`.
Update `scripts/seed-ideas.ts` imports to point to the new location.
Remove all `import … from "…/data/ideas"` (and related) from `app/` — only the seed script may reference these files.
Fix any TypeScript errors caused by removed imports (should be none if Steps 5–8 were completed correctly).

## Complexity Tracking

No constitution violations. No complexity tracking required.
