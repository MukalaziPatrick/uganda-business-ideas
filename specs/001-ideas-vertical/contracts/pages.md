# Page Contracts: Ideas Vertical

These contracts describe what each page must expose to the browser and what constitutes a valid response. They are not implementation code — they are the observable behaviour that acceptance tests will verify.

---

## /ideas — Browse Page

**URL**: `/ideas`
**Cache**: ISR, `revalidate = 60` seconds
**HTTP status on success**: 200

### Query parameters (all optional)

| Param | Values | Default | Behaviour |
|---|---|---|---|
| `q` | any string | `""` | Filters ideas whose title or description contains the value (case-insensitive) |
| `category` | `Agriculture`, `Food`, `Retail`, `Services`, `Digital` | `""` (All) | Exact category match |
| `budget` | `under_200k`, `200k_500k`, `500k_2m`, `above_2m` | `""` (All) | Exact budget_band match |
| `region` | `Central`, `Eastern`, `Northern`, `Western` | `""` (All) | idea's regions array must contain the value |
| `sort` | `demand`, `ease`, `az` | `demand` | Sort order applied client-side |

Unrecognised parameter values are ignored and treated as "All".

### Required page elements

- Filter controls visible on initial paint (before ideas load)
- Result count displaying number of ideas matching active filters
- Idea cards in a grid/list — each card shows: title, category badge, audience tags, budget band, demand score
- Empty-state message with "Clear filters" action when result count = 0
- Loading/skeleton state when Supabase fetch is in progress on first paint

### Sharing contract

A URL with any combination of the above query parameters, when opened in a fresh browser tab, MUST produce the same result set and active filter state as the original filtered view.

---

## /ideas/[slug] — Detail Page

**URL**: `/ideas/{slug}` where `{slug}` is a `business_ideas.slug` value
**Cache**: ISR, `revalidate = 60` seconds
**dynamicParams**: `true` — slugs added to Supabase after the last build render on-demand on first request; they do NOT 404 until the next deploy
**HTTP status — published idea**: 200
**HTTP status — unpublished or non-existent slug**: 404

### Required page sections (in order)

| Section id | Content |
|---|---|
| `#best-for` | Who the idea suits (`best_for`) + audience tags + skills list |
| `#costs` | Three-tier cost breakdown (starter / recommended / growth) derived from `budget_band` + `capital` |
| `#how-to-start` | Ordered steps list from `steps[]` |
| `#locations` | Location narrative from `location` |
| `#suppliers` | Supplier recommendations (from `idea_suppliers` table) + named supplier listings |
| `#risks` | Risk bullets from `risks[]` |
| `#profit` | Profit narrative + growth timeline cards |
| `#tips` | Tip bullets from `tips[]` |
| `#stories` | Success stories (only when ≥1 story linked; section hidden otherwise) |
| `#resources` | Curated external links from `idea_resources` matching category |
| `#faq` | Auto-generated FAQ with `FAQPage` JSON-LD schema |
| `#related` | Up to 4 related ideas from same category (hidden when none exist) |

### In-page navigation

A sticky or inline navigation bar linking to each section by anchor hash MUST be present.

### SEO

- `<title>`: `{idea.title} in Uganda | Cost, Steps & Profit`
- `<meta name="description">`: unique per idea
- Canonical URL: `https://ugandabiz.lugandastudio.com/ideas/{slug}`
- `FAQPage` JSON-LD schema block in the document `<head>`

---

## /apps — Hub Page (count update only)

**URL**: `/apps`
**Cache**: ISR, `revalidate = 60` seconds (added as part of this feature)
**HTTP status**: 200

### Contract change (scoped to Ideas card only)

The Business Ideas card tagline MUST display the current count of published ideas from the database. The count is served from the ISR-cached page response, not queried live per request.

Example tagline: `"52 curated ideas to start your business"`

The count in the tagline MUST match `SELECT COUNT(*) FROM business_ideas WHERE published = true` within one revalidation cycle (≤60 seconds of a count change).

---

## Query Functions (lib/ideas/queries.ts)

These are the data-access contracts the page components depend on. Each returns a typed result or a safe empty fallback (never throws).

**Security invariant**: The service-role admin client bypasses RLS. Every query that can return an idea row MUST include `.eq('published', true)` — this is the only enforcement layer preventing unpublished ideas from reaching the public.

| Function | Signature | Returns on error | published filter |
|---|---|---|---|
| `getPublishedIdeas()` | `() => Promise<BusinessIdea[]>` | `[]` | **required** |
| `getIdeaBySlug(slug)` | `(slug: string) => Promise<BusinessIdea \| null>` | `null` | **required** — returns `null` for unpublished slugs |
| `getRelatedIdeas(slug, category, limit?)` | `(slug: string, category: string, limit?: number) => Promise<BusinessIdea[]>` | `[]` | **required** |
| `getIdeaStories(slug, category)` | `(slug: string, category: string) => Promise<IdeaStory[]>` | `[]` | n/a (stories have no published flag) |
| `getIdeaResources(category)` | `(category: string) => Promise<IdeaResource[]>` | `[]` | n/a |
| `getIdeaSuppliers(slug, category)` | `(slug: string, category: string) => Promise<IdeaSupplier[]>` | `[]` | n/a |
| `getPublishedIdeasCount()` | `() => Promise<number>` | `0` | **required** |

### Vitest test contract (lib/ideas/queries.test.ts)

These two tests MUST pass before Step 5 (browse page) is considered done:

1. **Unpublished idea excluded from list**: mock the Supabase client to return one row with `published: false`. Assert `getPublishedIdeas()` returns `[]` (i.e. the `.eq('published', true)` filter was applied).
2. **Unpublished slug returns null**: mock the Supabase client to return one row where `slug = 'test-slug'` and `published = false`. Assert `getIdeaBySlug('test-slug')` returns `null`.
