create table if not exists land_market (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  raw_text text,
  price_ugx bigint,
  size_acres decimal,
  land_type text,
  district text,
  road_area text,
  has_title boolean,
  contact_phone text,
  trust_score int check (trust_score between 1 and 5),
  trust_flags text[] default '{}',
  status text not null default 'pending'
    check (status in ('pending','published','rejected')),
  source_url text unique not null,
  source_site text not null,
  scraped_at timestamptz not null default now(),
  reviewed_by text,
  reviewed_at timestamptz
);

create index if not exists land_market_status_idx on land_market(status);
create index if not exists land_market_district_idx on land_market(district);
create index if not exists land_market_scraped_idx on land_market(scraped_at desc);
