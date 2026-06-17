# Data Model: Ideas Vertical

All tables live in the `public` schema of the Supabase `uganda-business-ideas` database.
App reads go through `createSupabaseAdminClient()` (service-role key, bypasses RLS).
RLS policies govern direct anon-key access (Supabase dashboard, external clients).

---

## Table: `business_ideas`

The core entity. One row per vetted business idea.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `slug` | `text` | UNIQUE NOT NULL | URL-safe, human-readable (e.g. `liquid-soap-business`) |
| `title` | `text` | NOT NULL | Display title |
| `category` | `text` | NOT NULL, CHECK in set | `Agriculture`, `Food`, `Retail`, `Services`, `Digital` |
| `capital` | `text` | NOT NULL | Human-readable range string e.g. `UGX 100,000 – 500,000` |
| `description` | `text` | NOT NULL | Main description (maps from `desc` in static data) |
| `skills` | `text[]` | NOT NULL, default `'{}'` | Ordered list of required skills |
| `best_for` | `text` | NOT NULL | Who this idea suits |
| `location` | `text` | NOT NULL | Best Uganda locations narrative |
| `steps` | `text[]` | NOT NULL, default `'{}'` | Ordered step-by-step launch guide |
| `risks` | `text[]` | NOT NULL, default `'{}'` | Known risk bullets |
| `profit` | `text` | NOT NULL | Profit potential narrative |
| `tips` | `text[]` | NOT NULL, default `'{}'` | Insider tips bullets |
| `budget_band` | `text` | CHECK in set, nullable | `under_200k` \| `200k_500k` \| `500k_2m` \| `above_2m` |
| `audience` | `text[]` | default `'{}'` | `beginners`, `youth`, `women`, `diaspora`, `farmers`, `students` — stored for tag display; not a v1 filter |
| `regions` | `text[]` | NOT NULL, default `'{}'` | `Central`, `Eastern`, `Northern`, `Western` |
| `scoring_demand` | `integer` | CHECK 0–10, nullable | Maps from `scoring.incomeSpeed` |
| `scoring_ease` | `integer` | CHECK 0–10, nullable | Maps from `scoring.startupEase` |
| `scoring_risk` | `integer` | CHECK 0–10, nullable | Maps from `scoring.riskLevel` |
| `scoring_supplier` | `integer` | CHECK 0–10, nullable | Maps from `scoring.supplierDemand` |
| `published` | `boolean` | NOT NULL, default `true` | `false` = hidden from all public pages (404 on detail URL) |
| `created_at` | `timestamptz` | default `now()` | |
| `updated_at` | `timestamptz` | default `now()` | Updated by trigger or manual edit |

**Budget band semantics** (non-overlapping):
- `under_200k` — capital below UGX 200,000
- `200k_500k` — capital UGX 200,000–499,999 (maps from old `under_500k` in static data)
- `500k_2m` — capital UGX 500,000–1,999,999
- `above_2m` — capital UGX 2,000,000 and above

**Seed mapping rule**: static `budgetBand: 'under_500k'` → DB `budget_band: '200k_500k'`. All other band names carry over unchanged.

**Indexes**:
```sql
create index business_ideas_category_idx on business_ideas(category);
create index business_ideas_budget_band_idx on business_ideas(budget_band);
create index business_ideas_published_idx on business_ideas(published);
create index business_ideas_slug_idx on business_ideas(slug);
```

---

## Table: `idea_stories`

Success stories. One row per story. A story can be linked to multiple ideas (by slug) or matched by category fallback.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `text` | PK | Matches existing static id e.g. `story-001` |
| `idea_slugs` | `text[]` | NOT NULL, default `'{}'` | Direct slug links (e.g. `{liquid-soap-business}`) |
| `categories` | `text[]` | NOT NULL, default `'{}'` | Category fallback (e.g. `{Services}`) |
| `name` | `text` | NOT NULL | Person's name |
| `business` | `text` | NOT NULL | Business name / type |
| `location` | `text` | NOT NULL | Uganda location of the person |
| `timeframe` | `text` | NOT NULL | e.g. `"6 months"` |
| `result` | `text` | NOT NULL | e.g. `"Earning UGX 800,000/month"` |
| `quote` | `text` | NOT NULL | The testimonial quote |
| `avatar_emoji` | `text` | NOT NULL, default `'👤'` | Emoji avatar |
| `youtube_id` | `text` | nullable | YouTube video ID (no full URL) |
| `created_at` | `timestamptz` | default `now()` | |

**Query pattern**: fetch stories WHERE `idea_slugs @> ARRAY[$slug]` OR `categories && ARRAY[$category]`.

---

## Table: `idea_resources`

Curated external links. One row per resource. Linked by category, not by individual idea.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `title` | `text` | NOT NULL | Link title |
| `url` | `text` | NOT NULL | Full URL |
| `description` | `text` | NOT NULL | One-line description |
| `type` | `text` | NOT NULL, CHECK in set | `Government`, `Training`, `Finance`, `Market`, `Community` |
| `categories` | `text[]` | NOT NULL, default `'{}'` | `{All}` applies to every idea; or specific categories |
| `free` | `boolean` | default `true` | Whether the resource is free |
| `created_at` | `timestamptz` | default `now()` | |

**Query pattern**: fetch resources WHERE `categories @> ARRAY['All']` OR `categories && ARRAY[$category]`.

---

## Table: `idea_suppliers`

Supplier listings. One row per supplier. Linked to ideas by slug and/or category.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `text` | PK | Matches existing static id e.g. `supplier-001` |
| `idea_slugs` | `text[]` | NOT NULL, default `'{}'` | Specific idea links |
| `category` | `text` | nullable | Category-level match (`General` for all) |
| `name` | `text` | NOT NULL | Supplier business name |
| `type` | `text` | NOT NULL | Supplier type e.g. `Wholesale Ingredients` |
| `tip` | `text` | NOT NULL | Buying tip for this supplier |
| `created_at` | `timestamptz` | default `now()` | |

**Query pattern**: fetch suppliers WHERE `idea_slugs @> ARRAY[$slug]` OR `category = $category` OR `category = 'General'`.

---

## RLS Policies

All four tables: RLS enabled. App reads bypass RLS via service-role admin client.

| Table | Public read | Admin write |
|---|---|---|
| `business_ideas` | `published = true` | `is_admin()` |
| `idea_stories` | `true` (all rows) | `is_admin()` |
| `idea_resources` | `true` (all rows) | `is_admin()` |
| `idea_suppliers` | `true` (all rows) | `is_admin()` |

Note: `is_admin()` function already exists in the DB (used by land RLS).

---

## TypeScript Types (lib/supabase/ideas-types.ts)

```typescript
export type IdeaCategory = 'Agriculture' | 'Food' | 'Retail' | 'Services' | 'Digital';
export type IdeaBudgetBand = 'under_200k' | '200k_500k' | '500k_2m' | 'above_2m';
export type IdeaRegion = 'Central' | 'Eastern' | 'Northern' | 'Western';
export type IdeaAudience = 'beginners' | 'youth' | 'women' | 'diaspora' | 'farmers' | 'students';

export type BusinessIdea = {
  id: string;
  slug: string;
  title: string;
  category: IdeaCategory;
  capital: string;
  description: string;
  skills: string[];
  best_for: string;
  location: string;
  steps: string[];
  risks: string[];
  profit: string;
  tips: string[];
  budget_band: IdeaBudgetBand | null;
  audience: IdeaAudience[];
  regions: IdeaRegion[];
  scoring_demand: number | null;
  scoring_ease: number | null;
  scoring_risk: number | null;
  scoring_supplier: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type IdeaStory = {
  id: string;
  idea_slugs: string[];
  categories: string[];
  name: string;
  business: string;
  location: string;
  timeframe: string;
  result: string;
  quote: string;
  avatar_emoji: string;
  youtube_id: string | null;
  created_at: string;
};

export type IdeaResource = {
  id: string;
  title: string;
  url: string;
  description: string;
  type: 'Government' | 'Training' | 'Finance' | 'Market' | 'Community';
  categories: string[];
  free: boolean;
  created_at: string;
};

export type IdeaSupplier = {
  id: string;
  idea_slugs: string[];
  category: string | null;
  name: string;
  type: string;
  tip: string;
  created_at: string;
};
```
