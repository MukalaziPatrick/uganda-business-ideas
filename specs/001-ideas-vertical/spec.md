# Feature Specification: Ideas Vertical

**Feature Branch**: `try/spec-kit`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "build the Ideas vertical for Business Yoo — a browsable list + detail pages of vetted business ideas for Uganda, mirroring how /land works, under /apps"

## Clarifications

### Session 2026-06-17

- Q: When Supabase is temporarily unavailable, what should visitors see on the browse and detail pages? → A: Serve the last cached version silently; show a generic error only if no cached version exists. Showing an empty state (zero ideas) is explicitly forbidden — it destroys trust and SEO.
- Q: Is the audience dimension (beginners, youth, women, diaspora, farmers, students) a v1 browse filter? → A: No. Store audience data and show it as visible tags on cards and detail pages, but do not expose it as a browse filter in v1. Audience filtering deferred to v2.
- Q: Should the `/apps` idea count be a live per-request DB query or cached? → A: Cached with the same ~60-second ISR revalidation as everything else. No live DB query per page load.
- Q: Should the detail page include a Related Ideas section, and how should it be populated? → A: Yes. Auto-derive related ideas as other published ideas in the same category. No manual `relatedIdeaSlugs` curation needed in v1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse and Filter Business Ideas (Priority: P1)

A visitor arrives at the Ideas section wanting to find a business idea that fits their budget, region, and situation. They use category chips, budget filters, and a search box to narrow the list. The results update without a full page reload. They can share or bookmark their filtered view via the URL.

**Why this priority**: The browsable list is the entry point for every other interaction. Without it, no user reaches a detail page or takes any action. It also drives the SEO value of the vertical.

**Independent Test**: Can be fully tested by navigating to the Ideas list, applying any combination of filters (category, budget, region, keyword), verifying the result count updates and the URL reflects the active filters, then copying the URL and confirming the same results appear in a fresh tab.

**Acceptance Scenarios**:

1. **Given** a visitor opens the Ideas list with no filters, **When** they select "Agriculture" and "200k–500k", **Then** only Agriculture ideas within that budget band appear and the URL contains the active filter values.
2. **Given** a visitor has active filters set, **When** they type a keyword that matches zero ideas, **Then** an empty-state message appears with a "Clear filters" action.
3. **Given** a visitor copies a filtered URL and opens it in a new browser tab, **When** the page loads, **Then** the same category, budget, region, and keyword filters are active and the results match.
4. **Given** 50+ ideas are stored, **When** the page loads, **Then** the first paint shows at minimum the filter controls and a loading state; ideas appear within 2 seconds on a standard mobile connection.

---

### User Story 2 — Read a Business Idea in Detail (Priority: P1)

A visitor selects an idea from the list and reads its full detail page — covering startup cost breakdown, step-by-step launch guide, best locations in Uganda, supplier tips, risks, profit outlook, and real success stories. They can share the idea link or jump to a specific section via in-page navigation.

**Why this priority**: The detail page is where visitors commit to interest and where monetisation (lead capture, supplier CTAs, WhatsApp) occurs. Quality detail content differentiates Business Yoo from generic search results.

**Independent Test**: Navigate directly to any idea's permalink (e.g. `/ideas/liquid-soap-business`). Verify all seven content sections render with real data, in-page anchor links work, the page title is unique and descriptive, and sharing the URL returns the correct page.

**Acceptance Scenarios**:

1. **Given** a visitor opens an idea detail page, **When** the page renders, **Then** they see: title, category badge, capital range, "Best For" description, skills list, cost breakdown (starter/recommended/scale tiers), step-by-step guide, best locations, supplier recommendations, risk list, profit outlook, and tips — all with data specific to that idea.
2. **Given** the idea has at least one success story, **When** the page loads, **Then** the Stories section appears with the story person's name, business, result, and quote.
3. **Given** a visitor on mobile taps "How to Start" in the sticky nav, **When** the anchor scroll completes, **Then** the How-to-Start section is fully visible.
4. **Given** a visitor opens an invalid slug (e.g. `/ideas/does-not-exist`), **When** the page loads, **Then** a 404 page is shown.

---

### User Story 3 — Discover Ideas via the /apps Hub (Priority: P2)

A visitor arrives at `/apps` and sees the Ideas entry in the vertical list. They can navigate to the Ideas list in one tap and understand the value proposition from the hub card.

**Why this priority**: The `/apps` hub is the cross-vertical navigation layer. The Ideas card must link correctly and reflect the current idea count so the hub stays accurate.

**Independent Test**: Open `/apps`, find the Business Ideas card, verify the link navigates to the Ideas list and the tagline/count shown reflects the actual number of published ideas in the database.

**Acceptance Scenarios**:

1. **Given** a visitor is on `/apps`, **When** they tap the Business Ideas card, **Then** they land on the Ideas browse page.
2. **Given** the database contains 52 published ideas, **When** the `/apps` page renders, **Then** the Ideas card tagline reads "52 curated ideas" (or equivalent accurate count).

---

### User Story 4 — Ideas Backed by Supabase, Not Static Files (Priority: P2)

An operator (Mukalazi) adds or edits an idea directly in the Supabase dashboard. Within one minute, the change is visible to visitors on the live site without a code deployment.

**Why this priority**: Static TypeScript data requires a full code change and redeploy for every edit. Supabase-backed content lets content evolve independently of code. This unlocks future admin tooling and keeps the 50+ ideas current.

**Independent Test**: In the Supabase dashboard, edit the `desc` field of one published idea. Wait up to 60 seconds. Open that idea's detail page and verify the updated description appears without triggering a new build.

**Acceptance Scenarios**:

1. **Given** an idea is updated in Supabase, **When** up to 60 seconds pass, **Then** the updated content appears on the browse list and detail page without a code deployment.
2. **Given** an idea's `published` flag is set to false in Supabase, **When** a visitor navigates to that idea's URL, **Then** a 404 page is shown and the idea does not appear in the browse list.
3. **Given** all 48+ existing ideas are seeded into Supabase, **When** the Ideas list loads, **Then** all seeded ideas appear with the same titles, categories, and budget bands as the current static data.

---

### Edge Cases

- What happens when the database has zero published ideas? → Show the empty-state message with a "check back soon" message; never show a broken grid.
- How does the detail page handle an idea that has no success stories? → The Stories section is hidden; no placeholder or empty state is shown.
- What happens when a filter combination returns exactly one result? → The single result renders correctly in the featured card position.
- How does the browse page behave when a URL contains an unrecognised filter value (e.g. `?category=Unknown`)? → Unknown values are ignored and treated as "All".
- What happens on slow connections where the idea list takes over 5 seconds to load? → A skeleton/loading state is shown so the page does not appear broken.
- What happens when Supabase is temporarily unavailable during a page request? → The last successfully cached version of the page is served silently. A generic error screen is shown only if no cached version exists (i.e., the page has never been successfully rendered before). Showing an empty state is explicitly NOT acceptable — zero visible ideas destroys user trust and SEO standing.
- What happens when a detail page has no Related Ideas in the same category? → The Related Ideas section is hidden; no empty state or placeholder is shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST serve the Ideas browse page from Supabase data, not from hardcoded TypeScript files.
- **FR-002**: The browse page MUST support filtering by category (Agriculture, Food, Retail, Services, Digital), budget band (under 200k, 200k–500k, 500k–2M, above 2M), and Uganda region (Central, Eastern, Northern, Western). Budget bands are non-overlapping: "under 200k" means below 200,000 UGX; "200k–500k" means 200,000–499,999 UGX; "500k–2M" means 500,000–1,999,999 UGX; "above 2M" means 2,000,000 UGX and above. Audience segments (beginners, youth, women, diaspora, farmers, students) are stored in the database and displayed as visible tags on cards and detail pages, but are NOT exposed as a browse filter in v1; audience filtering is deferred to v2.
- **FR-003**: The browse page MUST support keyword search across idea title and description.
- **FR-004**: Filter state MUST be reflected in the page URL so filtered views are shareable and bookmarkable.
- **FR-005**: The browse page MUST allow sorting by demand score, startup ease score, and alphabetical order.
- **FR-006**: Each idea MUST have a unique, human-readable permalink (e.g. `/ideas/[slug]`).
- **FR-007**: The detail page MUST display: title, category, capital range, best-for description, required skills, three-tier cost breakdown, step-by-step launch guide, best locations in Uganda, supplier recommendations, risks, profit potential, and insider tips. The page MUST also display a Related Ideas section showing other published ideas in the same category; this section is auto-derived from the database (no manual curation or `relatedIdeaSlugs` field required). The section is hidden when no other ideas exist in the same category.
- **FR-008**: The detail page MUST display an in-page navigation bar linking to each major section.
- **FR-009**: The detail page MUST show success stories when one or more are linked to that idea.
- **FR-010**: An idea with `published = false` MUST NOT appear in the browse list or return any content on its detail URL (return 404).
- **FR-011**: The system MUST seed all existing 48+ ideas from the current static data into Supabase as part of the migration.
- **FR-012**: Page content MUST refresh within 60 seconds of a Supabase update without requiring a code deployment or manual rebuild. The caching strategy must be set at the page level so that stale content is never served for longer than 60 seconds; the approach chosen must work in the production hosting environment without manual cache purges. When the data source is temporarily unavailable during a cache revalidation attempt, the existing cached page MUST continue to be served rather than returning an error; a generic error is displayed only if no prior cached version exists.
- **FR-012a**: The static TypeScript data files (`app/data/ideas.ts`, `app/data/stories.ts`, `app/data/resources.ts`, `app/data/suppliers.ts`) MUST NOT be deleted until: (a) all idea content has been seeded into Supabase, (b) the live production site has been verified to serve correct data from Supabase for a sample of at least 5 ideas across different categories, and (c) FR-012 (60-second refresh) has been confirmed working on the live URL. File deletion is the final task, gated on all three conditions.
- **FR-013**: The `/apps` hub page MUST link to the Ideas browse page; the tagline on the Ideas card MUST reflect the current published idea count. The count is served from a cached Supabase query subject to the same ~60-second revalidation interval as the rest of the vertical — it is NOT queried live on every page request.
- **FR-014**: Row-level security MUST be enabled on all four ideas tables. Because the app uses a service-role admin client that bypasses RLS, the `published = true` filter applied inside each query function is the actual enforcement gate for public pages — RLS protects the anon-key path only. Both layers must be present: RLS policies on the tables AND explicit `published = true` filters in `getPublishedIdeas()`, `getIdeaBySlug()`, `getRelatedIdeas()`, and `getPublishedIdeasCount()`. A Vitest test must verify that an idea with `published = false` is excluded from both list and by-slug query results.
- **FR-015**: Raw contact details (phone numbers, personal addresses) belonging to operators or editors MUST NOT be exposed in any public page or API response.

### Key Entities

- **Idea**: A vetted business concept with slug, title, category, capital range, description, skills, best-for, location, steps, risks, profit, tips, scoring metadata (demand, ease, risk, supplier scores), budget band, audience segments (stored for display as tags; not a browse filter in v1), Uganda regions, published flag, and timestamps. No manual `relatedIdeaSlugs` field — related ideas are derived at query time from matching category.
- **IdeaStory**: A success story linked to one or more ideas — contains person name, business name, location, result, quote, and optional video reference.
- **IdeaResource**: A curated external link (government, training, finance, market, community) associated with one or more idea categories.
- **IdeaSupplier**: A specific supplier listing associated with one or more ideas and a category; includes name, supplier type, and buying tip.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Ideas browse page loads and displays results in under 2 seconds on a standard mobile connection in Uganda (3G equivalent).
- **SC-002**: 100% of the 48+ existing ideas appear on the browse page after migration, with no ideas missing titles, categories, or capital ranges.
- **SC-003**: Any change to an idea made in the Supabase dashboard is reflected on the live site within 60 seconds, with zero code deployments required.
- **SC-004**: A filtered URL shared between two users produces identical result sets for both (zero filter drift).
- **SC-005**: The detail page for every published idea returns HTTP 200 and displays all seven content sections populated with idea-specific data.
- **SC-006**: An unpublished idea's detail URL returns HTTP 404; the idea does not appear in any browse result set.
- **SC-007**: The Ideas card on `/apps` accurately displays the current published idea count within 60 seconds of any count change.

## Assumptions

- The URL path stays at `/ideas` and `/ideas/[slug]` (not moved to `/apps/ideas`). The `/apps` page already links there; moving would break existing backlinks and SEO.
- An admin UI for managing ideas (adding new ones, editing via a form) is out of scope for this vertical build. Operators use the Supabase dashboard directly.
- New idea submissions from the public are out of scope for v1.
- Success stories, resources, and supplier listings will also be migrated to Supabase as part of this work (they are currently in separate static files and closely linked to ideas).
- The 48+ ideas in `app/data/ideas.ts` represent the full seed dataset; no additional content is expected before launch.
- The existing detail page design (hero, section cards, in-page nav, FAQ accordion) is preserved — this spec governs data layer and browse behaviour, not a visual redesign.
- Pagination is not required for v1 (fewer than 100 ideas); all published ideas load on the browse page.
- The static TypeScript data files (`app/data/ideas.ts`, `app/data/stories.ts`, `app/data/resources.ts`, `app/data/suppliers.ts`) are removed only after Supabase seeding is confirmed correct AND the live site has been verified end-to-end (see FR-012a). This is explicitly the last implementation task.
