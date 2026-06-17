-- Create 4 tables for the Ideas vertical
-- Tables: business_ideas, idea_stories, idea_resources, idea_suppliers

create table if not exists public.business_ideas (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        not null unique,
  title           text        not null,
  category        text        not null check (category in ('Agriculture', 'Food', 'Retail', 'Services', 'Digital')),
  capital         text        not null,
  description     text        not null,
  skills          text[]      not null default '{}',
  best_for        text        not null,
  location        text        not null,
  steps           text[]      not null default '{}',
  risks           text[]      not null default '{}',
  profit          text        not null,
  tips            text[]      not null default '{}',
  budget_band     text        check (budget_band in ('under_200k', '200k_500k', '500k_2m', 'above_2m')),
  audience        text[]      default '{}',
  regions         text[]      not null default '{}',
  scoring_demand  integer     check (scoring_demand between 0 and 10),
  scoring_ease    integer     check (scoring_ease between 0 and 10),
  scoring_risk    integer     check (scoring_risk between 0 and 10),
  scoring_supplier integer    check (scoring_supplier between 0 and 10),
  published       boolean     not null default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists business_ideas_category_idx    on public.business_ideas (category);
create index if not exists business_ideas_budget_band_idx on public.business_ideas (budget_band);
create index if not exists business_ideas_published_idx   on public.business_ideas (published);
create index if not exists business_ideas_slug_idx        on public.business_ideas (slug);

create table if not exists public.idea_stories (
  id           text        primary key,
  idea_slugs   text[]      not null default '{}',
  categories   text[]      not null default '{}',
  name         text        not null,
  business     text        not null,
  location     text        not null,
  timeframe    text        not null,
  result       text        not null,
  quote        text        not null,
  avatar_emoji text        not null default '👤',
  youtube_id   text,
  created_at   timestamptz default now()
);

create table if not exists public.idea_resources (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  url         text        not null,
  description text        not null,
  type        text        not null check (type in ('Government', 'Training', 'Finance', 'Market', 'Community')),
  categories  text[]      not null default '{}',
  free        boolean     default true,
  created_at  timestamptz default now()
);

create table if not exists public.idea_suppliers (
  id         text        primary key,
  idea_slugs text[]      not null default '{}',
  category   text,
  name       text        not null,
  type       text        not null,
  tip        text        not null,
  created_at timestamptz default now()
);
