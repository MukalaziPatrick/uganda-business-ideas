# Tasks: Ideas Vertical

**Input**: Design documents from `specs/001-ideas-vertical/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/pages.md ✅ · quickstart.md ✅

**Tests**: Vitest tests included for the security-critical published filter (required by spec FR-014 and plan Step 3). No other test tasks — validate via quickstart.md scenarios instead.

**User Stories**:
- **US1** (P1) — Browse and Filter Business Ideas
- **US2** (P1) — Read a Business Idea in Detail
- **US3** (P2) — Discover Ideas via the /apps Hub
- **US4** (P2) — Ideas Backed by Supabase, Not Static Files

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared state)
- **[Story]**: User story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Directory structure and prerequisite verification

- [x] T001 Verify git remote is `MukalaziPatrick/uganda-business-ideas` (`git remote -v`) and current branch is correct
- [x] T002 Create `scripts/seed-data/` directory (will receive static data files in T027)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, types, query layer, and seed data — MUST complete before any user story page work

**⚠️ CRITICAL**: No page work (US1–US4) can begin until T003–T011 are all done

- [x] T003 Create `supabase/migrations/20260617000001_business_ideas.sql` — 4 tables (`business_ideas`, `idea_stories`, `idea_resources`, `idea_suppliers`) with all columns, CHECK constraints, and indexes per `data-model.md`
- [x] T004 [P] Create `supabase/migrations/20260617000002_ideas_rls.sql` — RLS enabled on all 4 tables; `business_ideas` public read policy is `published = true`; story/resource/supplier tables allow public read; all tables allow admin write via `is_admin()` (pattern from `supabase/migrations/20260613000001_land_rls.sql`)
- [x] T005 Apply both migrations: `npm run supabase:push` — confirm no errors and tables appear in Supabase dashboard
- [x] T006 [P] Create `lib/supabase/ideas-types.ts` — `BusinessIdea`, `IdeaStory`, `IdeaResource`, `IdeaSupplier` types per `data-model.md` TypeScript section; export `IdeaCategory`, `IdeaBudgetBand`, `IdeaRegion`, `IdeaAudience` union types
- [x] T007 Create `lib/ideas/queries.ts` — implement all 7 functions (`getPublishedIdeas`, `getIdeaBySlug`, `getRelatedIdeas`, `getIdeaStories`, `getIdeaResources`, `getIdeaSuppliers`, `getPublishedIdeasCount`); mirror pattern from `lib/land/queries.ts`; every function that returns idea rows MUST include `.eq('published', true)`; all functions return safe empty fallback (`[]`, `null`, or `0`) on error — never throw
- [x] T008 [P] Create `lib/ideas/queries.test.ts` — two Vitest tests per `contracts/pages.md` security contract: (1) mock admin client returning a row with `published: false`, assert `getPublishedIdeas()` returns `[]`; (2) same mock, assert `getIdeaBySlug('test-slug')` returns `null`
- [x] T009 Run tests: `npx vitest run lib/ideas/queries.test.ts` — both tests MUST pass before proceeding
- [x] T010 Create `scripts/seed-ideas.ts` — import static arrays from `app/data/ideas.ts`, `stories.ts`, `resources.ts`, `suppliers.ts`; map `budgetBand: 'under_500k'` → `budget_band: '200k_500k'`; map field names to DB columns per `data-model.md` (e.g. `desc` → `description`, `bestFor` → `best_for`); upsert on `slug`/`id` conflict key; log success/failure row counts
- [x] T011 Run seed script and verify: `npx tsx scripts/seed-ideas.ts` — confirm `SELECT count(*) FROM business_ideas WHERE published = true` ≥ 48 in Supabase dashboard

**Checkpoint**: Database populated, query layer tested, types defined — user story page work can begin

---

## Phase 3: US1 — Browse and Filter Business Ideas (Priority: P1) 🎯 MVP

**Goal**: `/ideas` browse page serves data from Supabase with URL-reflected filter state, ISR 60 s cache

**Independent Test** (quickstart Scenarios 1, 2, 3): Navigate to `/ideas`, apply filters, verify URL updates, copy URL to new tab and confirm same results appear

- [x] T012 [US1] Update `app/ideas/page.tsx`: add `export const revalidate = 60`; replace `import { ideas } from "../data/ideas"` with `import { getPublishedIdeas } from "@/lib/ideas/queries"`; call `getPublishedIdeas()` server-side and pass result as `ideas` prop to `IdeasDiscoveryClient`
- [x] T013 [US1] Update `app/ideas/IdeasDiscoveryClient.tsx`: add `'use client'` import for `useSearchParams` and `useRouter`; on mount, read `category`, `budget`, `region`, `q`, `sort` from URL search params and set as initial filter state; on each filter change, call `router.replace(newUrl, { scroll: false })` to sync state to URL without full navigation; keep all existing filter logic intact
- [x] T014 [US1] Update budget band label in `app/ideas/IdeasDiscoveryClient.tsx`: rename `under_500k` label from `"Under 500k"` to `"200k–500k"` in `budgetLabels` map and budget filter chip; update `BudgetBand` type reference to use `200k_500k` (the DB value)
- [x] T015 [US1] Manual verification: open `/ideas` on dev server, apply Agriculture + 200k–500k filter, confirm URL contains `?category=Agriculture&budget=200k_500k`; copy URL, open in new incognito tab, confirm same results; verify empty-state appears with "Clear filters" when no ideas match

**Checkpoint**: US1 fully functional — browse page loads from Supabase, filters work, URL is shareable

---

## Phase 4: US2 — Read a Business Idea in Detail (Priority: P1)

**Goal**: `/ideas/[slug]` serves all 11 sections from Supabase with ISR, dynamicParams, and Related Ideas

**Independent Test** (quickstart Scenarios 4, 5, 6): Navigate to `/ideas/liquid-soap-business`, verify all sections present; set one idea unpublished and confirm 404; verify Related Ideas shows same-category ideas

- [x] T016 [US2] Update `app/ideas/[slug]/page.tsx` page-level exports: add `export const revalidate = 60` and `export const dynamicParams = true`; update `generateStaticParams()` to call `getPublishedIdeas()` and return `ideas.map(i => ({ slug: i.slug }))` (replaces static `ideas.map(...)` import)
- [x] T017 [US2] Update `app/ideas/[slug]/page.tsx` data fetching: replace `getIdeaBySlug(slug)` static import with `import { getIdeaBySlug } from "@/lib/ideas/queries"` call; if result is `null`, call `notFound()`; replace `stories.filter(...)` with `getIdeaStories(slug, idea.category)`; replace `resources.filter(...)` with `getIdeaResources(idea.category)`; replace `supplierListings.filter(...)` with `getIdeaSuppliers(slug, idea.category)`; remove all `import … from "../../data/…"` lines
- [x] T018 [US2] Update `app/ideas/[slug]/page.tsx` field name mapping: the DB uses `description` (not `desc`), `best_for` (not `bestFor`), etc. — update all references in the page to use the `BusinessIdea` type fields from `lib/supabase/ideas-types.ts`; update `generateMetadata` to use `idea.description`
- [x] T019 [US2] Add Related Ideas section to `app/ideas/[slug]/page.tsx`: call `getRelatedIdeas(slug, idea.category, 4)` alongside other data fetches; render a section with `id="related"` below the FAQ section; show up to 4 idea cards (title, category, capital); hide section when `relatedIdeas.length === 0`; add "Related" anchor to the in-page nav bar
- [ ] T020 [US2] Manual verification: open `/ideas/liquid-soap-business` — confirm all 11 section anchors exist; check Related Ideas shows Agriculture ideas excluding the current one; set `published = false` on one idea in Supabase, wait 60 s, confirm its URL returns 404 and it disappears from browse list

**Checkpoint**: US2 fully functional — detail pages serve Supabase data, new slugs render on-demand, related ideas shown

---

## Phase 5: US3 — Discover Ideas via the /apps Hub (Priority: P2)

**Goal**: `/apps` page shows a live-ish idea count from Supabase, cached at 60 s

**Independent Test** (quickstart Scenario 7): Note the count shown on the Ideas card; add one row in Supabase with `published = true`; wait ≤ 60 s; hard-refresh `/apps` and confirm count incremented

- [x] T021 [US3] Update `app/apps/page.tsx`: add `export const revalidate = 60`; add `import { getPublishedIdeasCount } from "@/lib/ideas/queries"` at the top; call `const ideaCount = await getPublishedIdeasCount()` in the server component body
- [x] T022 [US3] Update the Business Ideas card tagline in `app/apps/page.tsx`: replace the hardcoded string `'48 curated ideas to start your business'` with the dynamic value (e.g. `` `${ideaCount} curated ideas to start your business` ``)
- [ ] T023 [US3] Manual verification: open `/apps`, note the count; insert a test idea row in Supabase with `published = true`; wait ≤ 60 s; hard-refresh `/apps` and confirm count went up by 1; then delete the test row

**Checkpoint**: US3 functional — /apps hub shows an accurate, auto-refreshing idea count

---

## Phase 6: US4 — Ideas Backed by Supabase, Not Static Files (Priority: P2)

**Goal**: End-to-end verification that content edits in Supabase appear on the live site within 60 s without a deploy

**Independent Test** (quickstart Scenarios 1, 8): Edit an idea in Supabase dashboard; wait 60 s; confirm the change is visible on `/ideas` without any deployment

- [ ] T024 [US4] Run quickstart Scenario 1 on the production URL (`https://ugandabiz.lugandastudio.com/ideas`): edit `description` of one idea in Supabase, wait 60 s, hard-refresh, confirm updated text appears — document result
- [ ] T025 [US4] Confirm FR-012a gates: (a) `SELECT count(*) FROM business_ideas WHERE published = true` ≥ 48; (b) run quickstart Scenarios 4 and 6 on production URL; (c) Scenario 1 (60 s refresh) confirmed in T024 — all three gates must be met before proceeding to T026
- [ ] T026 [US4] Run quickstart Scenario 8 in a Vercel preview deployment: set `NEXT_PUBLIC_SUPABASE_URL` to an invalid value in the preview env vars, trigger a page load, confirm the previously-cached HTML is served (not an error screen) — restore the env var after confirming

**Checkpoint**: All four user stories verified on production. FR-012a gates met. Ready for cleanup

---

## Phase 7: Polish & Cleanup (Gated — run only after T025 gates pass)

**Purpose**: Remove app/ imports of static data files and relocate them to scripts/seed-data/

- [ ] T027 [P] Move `app/data/ideas.ts` → `scripts/seed-data/ideas.ts` (git mv)
- [ ] T028 [P] Move `app/data/stories.ts` → `scripts/seed-data/stories.ts`; move `app/data/resources.ts` → `scripts/seed-data/resources.ts`; move `app/data/suppliers.ts` → `scripts/seed-data/suppliers.ts` (git mv for each)
- [ ] T029 Update `scripts/seed-ideas.ts` import paths from `app/data/…` → `./seed-data/…`; run `npm run build` to confirm zero TypeScript errors and no remaining `app/data` import references in `app/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 — can start as soon as T011 is done
- **Phase 4 (US2)**: Depends on Phase 2 — can run in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 2 — can run in parallel with Phase 3 and 4
- **Phase 6 (US4)**: Depends on Phase 3 + 4 + 5 being complete on production
- **Phase 7 (Cleanup)**: Depends on Phase 6 T025 gates all passing

### Within Phase 2 — Parallel Opportunities

```
T003 (migrations SQL)  ──┐
T004 (RLS SQL)         ──┤ → T005 (apply) → T006 (types) + T007 (queries) → T008 (tests) → T009 (run tests) → T010 (seed script) → T011 (run seed)
T006 (types)           ──┘
```

T003, T004, and T006 can all be written in parallel. T007 depends on T006 (uses the types). T008 depends on T007 (tests the queries). T010 depends on T005 (tables must exist) and T007 (imports query layer). T011 depends on T010.

### Within Phase 4 (US2) — Sequence

T016 → T017 → T018 → T019 (all touch same file; write in order)

---

## Parallel Example: Phase 2 (Foundational)

```
# These three can be written simultaneously (different files):
Task T003: "Create 20260617000001_business_ideas.sql"
Task T004: "Create 20260617000002_ideas_rls.sql"
Task T006: "Create lib/supabase/ideas-types.ts"

# After all three are written:
Task T005: "Apply migrations"
Task T007: "Create lib/ideas/queries.ts" (imports from T006)
Task T008: "Create lib/ideas/queries.test.ts" (imports from T007)
```

---

## Implementation Strategy

### MVP (US1 only — Browse page)

1. Complete Phase 1 (T001–T002)
2. Complete Phase 2 (T003–T011) — foundational
3. Complete Phase 3 (T012–T015) — browse page live from Supabase
4. **VALIDATE**: Run quickstart Scenarios 1, 2, 3 on production
5. Deploy and confirm browse page works end-to-end

### Full Delivery (all stories)

1. Phase 1 → Phase 2 → Phase 3 (US1, browse)
2. Phase 4 (US2, detail) — can overlap with US3
3. Phase 5 (US3, /apps hub)
4. Phase 6 (US4, live verification)
5. Phase 7 (cleanup, last)

---

## Notes

- `[P]` tasks touch different files and have no shared-state dependencies within their phase
- Commit after each phase checkpoint (not after every individual task)
- Step 10 in `plan.md` is split across T027–T029 here and is intentionally the last work
- The Vitest tests (T008–T009) are security-critical: they prove the `published = true` filter is wired up before any page goes live
- `dynamicParams = true` is set in T016 — do not remove it; it enables on-demand ISR for ideas added after a build
- Never delete `scripts/seed-data/` files after moving — they are needed for future re-seeding
