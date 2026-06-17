# Quickstart Validation Guide: Ideas Vertical

Use this guide to verify the feature works end-to-end after implementation. Each scenario maps to a spec acceptance criterion.

---

## Prerequisites

- Live production URL accessible: `https://ugandabiz.lugandastudio.com`
- Supabase dashboard access to `uganda-business-ideas` project
- At minimum: `business_ideas`, `idea_stories`, `idea_resources`, `idea_suppliers` tables populated (seed script run)
- FR-012a gates: all conditions verified before deleting static files

---

## Scenario 1 — Browse page loads from Supabase (FR-001, SC-002)

1. Open `https://ugandabiz.lugandastudio.com/ideas`
2. Confirm the page loads and displays ideas (not the empty-state)
3. Count the idea cards — must match the row count in `SELECT count(*) FROM business_ideas WHERE published = true`
4. Open the Supabase dashboard → `business_ideas` table → change one idea's `title` to "TEST TITLE"
5. Wait up to 60 seconds, then hard-refresh `/ideas`
6. Confirm the updated title appears in the grid

**Pass**: counts match; title update visible within 60 s without a deploy.

---

## Scenario 2 — Filters and URL state (FR-002, FR-003, FR-004, SC-004)

1. Open `/ideas`
2. Select category "Agriculture" → confirm URL updates to `?category=Agriculture`
3. Select budget "under 200k" → confirm URL updates to `?category=Agriculture&budget=under_200k`
4. Type "poultry" in the search box → confirm URL includes `?q=poultry`
5. Copy the full URL, open in a new incognito tab → confirm same ideas shown, same filters active
6. Select region "Eastern" → confirm URL includes `&region=Eastern`
7. Clear all filters via "Clear filters" → confirm URL returns to `/ideas` with no params

**Pass**: URL reflects every active filter; copied URL reproduces identical results.

---

## Scenario 3 — Empty state (edge case)

1. Apply filters that produce zero results (e.g. category "Digital" + budget "under_200k" + region "Northern" + search "xyznotexist")
2. Confirm empty-state message appears with a "Clear filters" action
3. Confirm zero idea cards are rendered (no broken grid)

**Pass**: empty-state shown; grid not broken.

---

## Scenario 4 — Detail page content (FR-007, SC-005)

1. Navigate to `/ideas/liquid-soap-business`
2. Verify HTTP 200 (no redirect/error)
3. Confirm all required sections exist with anchor IDs: `#best-for`, `#costs`, `#how-to-start`, `#locations`, `#suppliers`, `#risks`, `#profit`, `#tips`, `#resources`, `#faq`, `#related`
4. Confirm the in-page navigation bar is visible and each anchor link scrolls to the correct section
5. Verify the `<title>` tag is `"Liquid Soap Business in Uganda | Cost, Steps & Profit"`
6. View page source → confirm `FAQPage` JSON-LD block is present

**Pass**: all sections present; nav works; SEO tags correct; JSON-LD present.

---

## Scenario 5 — Unpublished idea returns 404 (FR-010, SC-006)

1. In the Supabase dashboard, set one idea's `published = false` (note its slug)
2. Wait up to 60 seconds
3. Navigate to `/ideas/{slug}` for that idea
4. Confirm the response is a 404 page
5. Open `/ideas` → confirm that idea does not appear in the grid

**Pass**: 404 on detail; absent from browse list.

---

## Scenario 6 — Related Ideas section (FR-007 — Related Ideas, clarification Q4)

1. Navigate to any detail page (e.g. `/ideas/poultry-farming` — category: Agriculture)
2. Scroll to the Related Ideas section
3. Confirm up to 4 idea cards appear, all in the "Agriculture" category
4. Confirm the current idea (`poultry-farming`) does not appear in the Related Ideas list

**Pass**: related ideas shown from same category; current idea excluded.

---

## Scenario 7 — /apps idea count updates (FR-013, SC-007)

1. Open `https://ugandabiz.lugandastudio.com/apps`
2. Note the idea count in the Business Ideas card tagline
3. In Supabase, add one new idea row with `published = true`
4. Wait up to 60 seconds, hard-refresh `/apps`
5. Confirm the count in the tagline has incremented by 1

**Pass**: count updates within 60 s without a deploy.

---

## Scenario 8 — Stale-cache fallback when Supabase is unavailable (FR-012 clarification)

> This scenario requires coordination with the Supabase network (e.g., temporarily blocking the DB env var in a preview deployment).

1. Confirm the browse page has been loaded at least once (cached version exists)
2. Simulate Supabase unavailability (e.g., set `NEXT_PUBLIC_SUPABASE_URL` to an invalid value in a preview environment)
3. Request the `/ideas` page
4. Confirm the previously cached version of the page is served (not an error screen)

**Pass**: stale page content served; no error screen shown.

---

## Scenario 9 — FR-012a gate check (static file deletion readiness)

Before deleting static files, confirm ALL three gates are met:

| Gate | Check |
|---|---|
| (a) All ideas seeded | `SELECT count(*) FROM business_ideas` ≥ 48 |
| (b) Live site verified | Run Scenarios 1, 4, and 6 above on the production URL |
| (c) 60-second refresh confirmed | Run Scenario 1 step 4–6 on the production URL |

Only when all three gates pass should `app/data/ideas.ts`, `stories.ts`, `resources.ts`, `suppliers.ts` be deleted.

---

## Reference

- Data model: [data-model.md](./data-model.md)
- Page contracts: [contracts/pages.md](./contracts/pages.md)
- Spec: [spec.md](./spec.md)
