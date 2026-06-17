# Research: Ideas Vertical

## Decision 1 — Supabase query pattern
**Decision**: Use `createSupabaseAdminClient()` (service-role key) for all server-side data fetches, mirroring `lib/land/queries.ts`.
**Rationale**: The admin client bypasses RLS and returns `null` on missing env vars — the same graceful null-guard pattern already established in the project. All app queries are server-side; the anon-key path is never used for data reads.
**Alternatives considered**: Supabase anon-key client — rejected because it requires Row-Level Security policies to be correct for every query, adding complexity; the admin client is the project standard.

## Decision 2 — ISR caching at 60 s
**Decision**: Set `export const revalidate = 60` at the top of `app/ideas/page.tsx`, `app/ideas/[slug]/page.tsx`, and `app/apps/page.tsx`.
**Rationale**: Next.js 16 (App Router) ISR on Vercel: after 60 seconds the background revalidation fires; if Supabase is unavailable during revalidation, the previously-cached HTML is served rather than an error — satisfying both FR-012 (60 s freshness) and the Q1 clarification (stale-cache over error). This is identical to the `export const revalidate = 60` already used in `app/land/browse/page.tsx`.
**Alternatives considered**: `fetch()` with `{ next: { revalidate: 60 } }` tags — more granular but unnecessary given page-level revalidation is sufficient and simpler to verify.

## Decision 3 — Server-fetches all ideas; client filters in browser
**Decision**: `app/ideas/page.tsx` (server component) fetches ALL published ideas and passes them as props to `IdeasDiscoveryClient` (client component). Filtering, sorting, and search happen in the browser; filter state is synced to the URL via `useSearchParams` + `router.replace()`.
**Rationale**: With ≤100 ideas, fetching all at once is negligible payload (~30–50 KB). Browser-side filtering means zero additional server round-trips on every filter click — keeping the UX instant. URL sync satisfies FR-004 (shareable filtered URLs). This mirrors the existing `IdeasDiscoveryClient` architecture but adds URL state.
**Alternatives considered**: SSR filter-per-request (like `/land/browse`) — would require full-page navigation on every filter change, which is worse UX on slow Uganda connections; rejected.

## Decision 4 — Budget band values in the database
**Decision**: DB stores four non-overlapping bands: `under_200k`, `200k_500k`, `500k_2m`, `above_2m`. The seed script maps existing `under_500k` values → `200k_500k`.
**Rationale**: The previous `under_500k` label was ambiguous (overlapped with `under_200k`). The DB enforces the canonical non-overlapping set via a CHECK constraint. Seed mapping is a one-time operation; the static `BudgetBand` type in `app/data/ideas.ts` is only needed until those files are deleted.
**Alternatives considered**: Keeping `under_500k` in the DB and renaming in the UI — rejected; creates a permanent inconsistency in the data model.

## Decision 5 — Table layout: 4 dedicated tables
**Decision**: Four separate tables: `business_ideas`, `idea_stories`, `idea_resources`, `idea_suppliers`.
**Rationale**: Stories, resources, and suppliers all have their own query paths (by idea slug, by category). Keeping them as separate tables makes each queryable independently and keeps the main `business_ideas` row slim. JSONB columns were considered but rejected — they're harder to query for the category-join patterns needed by resources and suppliers.
**Alternatives considered**: JSONB columns inside `business_ideas` for related data — rejected for query complexity; single-table with all data — rejected (row too wide, update anomalies for shared resources).

## Decision 6 — Related Ideas: auto-derived, same category
**Decision**: `getRelatedIdeas(slug, category, limit = 4)` queries `business_ideas` WHERE `category = $1 AND slug != $2 AND published = true LIMIT $3`. No `related_idea_slugs` column.
**Rationale**: Zero manual curation needed; any new idea in the same category is automatically surfaced. If the same-category pool is empty, the section is simply hidden — no code change required.
**Alternatives considered**: Manual `related_idea_slugs` array column — rejected; requires updating 48 rows manually.

## Decision 7 — Seed strategy: TypeScript migration script
**Decision**: `scripts/seed-ideas.ts` reads the existing static arrays, transforms them to the new schema, and upserts via the admin client using slug as the conflict key.
**Rationale**: TypeScript script lets us apply the `under_500k` → `200k_500k` remapping logic programmatically and re-run safely (upsert is idempotent). A raw SQL seed file would need to encode all 48+ ideas as INSERT statements — harder to review and maintain.
**Alternatives considered**: SQL seed file — rejected for readability; Supabase dashboard manual entry — rejected for scale (48+ ideas).

## Decision 10 — published filter in query layer is the security gate
**Decision**: Every query function that can return a `business_ideas` row MUST include `.eq('published', true)` explicitly. RLS is still enabled on all tables (protects anon-key access), but the admin client bypasses it — so the filter is the only thing standing between an unpublished idea and a public page.
**Rationale**: The existing land pattern (admin client, no anon-key reads) means RLS alone is insufficient for the app. The filter is cheap, testable, and must be verified by a Vitest unit test for both `getPublishedIdeas()` and `getIdeaBySlug()`.
**Alternatives considered**: Switching to the anon-key client so RLS applies automatically — rejected; the anon-key client requires a public API key in the browser bundle and is not how the rest of this project works.

## Decision 11 — dynamicParams = true on the detail page
**Decision**: Export `export const dynamicParams = true` from `app/ideas/[slug]/page.tsx` (Next.js default, but made explicit).
**Rationale**: `generateStaticParams()` pre-renders slugs known at build time. Any idea added to Supabase after a build would 404 on the detail page if `dynamicParams` were `false`. With `true`, the ISR fallback kicks in: first visitor to an unknown slug triggers a server render, the page is cached, and subsequent visitors get the cached page. This is essential for the 60-second freshness guarantee to extend to newly added ideas, not just edited ones.
**Alternatives considered**: Not exporting `dynamicParams` (relies on Next.js default) — works today but is fragile; an engineer could accidentally flip it without realising the impact. Making it explicit documents the intent.

## Decision 8 — Audience segments: stored as `text[]`, displayed as tags
**Decision**: `audience text[]` column on `business_ideas`. Values: `beginners`, `youth`, `women`, `diaspora`, `farmers`, `students`. No browse filter in v1; rendered as badge tags on list cards and the detail hero.
**Rationale**: Confirmed in clarification Q2. Keeping the data in the DB costs nothing and enables v2 audience filtering without a schema migration.

## Decision 9 — `/apps` idea count
**Decision**: `getPublishedIdeasCount()` called in `app/apps/page.tsx` (server component); same `revalidate = 60`. Count is cached with page; not a per-request live query.
**Rationale**: Confirmed in clarification Q3. The count changes at most weekly. ISR handles freshness without per-request DB overhead.
