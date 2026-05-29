-- supabase/migrations/001_land_tables.sql

create extension if not exists "pgcrypto";

-- Agents must exist before listings (FK)
create table if not exists land_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  whatsapp text,
  photo text,
  district text,
  bio text,
  is_verified boolean default false,
  response_time_hrs integer,
  rating numeric(3,2),
  safelands_agent_id text unique,
  created_at timestamptz default now()
);

create table if not exists land_listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  district text not null,
  parish text,
  lat numeric(10,7),
  lng numeric(10,7),
  size_acres numeric(10,4),
  price_ugx bigint,
  land_type text check (land_type in ('mailo','freehold','leasehold','customary')),
  intended_use text check (intended_use in ('farming','residential','commercial','mixed')),
  title_status text check (title_status in ('clean','caution','pending','unknown')) default 'unknown',
  verification_stage text check (verification_stage in ('unverified','submitted','in-review','verified')) default 'unverified',
  trust_score integer check (trust_score between 0 and 100) default 0,
  qr_token text unique,
  agent_id uuid references land_agents(id),
  photos text[] default '{}',
  is_featured boolean default false,
  safelands_id text unique,
  created_at timestamptz default now(),
  verified_at timestamptz,
  updated_at timestamptz default now()
);

create table if not exists land_insights (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references land_listings(id) on delete cascade,
  farming_suitability text,
  access_road_quality text,
  nearby_infrastructure text,
  risk_notes text,
  planting_season_fit text,
  generated_at timestamptz default now(),
  model_used text
);

create table if not exists land_payments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references land_listings(id),
  buyer_phone text not null,
  amount_ugx integer default 10000,
  payment_method text check (payment_method in ('mtn','airtel','whatsapp-manual')),
  status text check (status in ('pending','paid','expired')) default 'pending',
  access_expires_at timestamptz,
  agent_id uuid references land_agents(id),
  flutterwave_ref text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists land_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  body text,
  content_type text check (content_type in ('guide','spotlight','seasonal','explainer')),
  district text,
  published_at timestamptz default now(),
  generated_by text
);

create table if not exists land_saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  district text,
  price_max bigint,
  size_min numeric(10,4),
  land_type text,
  intended_use text,
  notify_whatsapp boolean default true,
  created_at timestamptz default now(),
  last_notified_at timestamptz
);

-- Indexes for common queries
create index if not exists land_listings_district_idx on land_listings(district);
create index if not exists land_listings_verification_idx on land_listings(verification_stage);
create index if not exists land_listings_trust_idx on land_listings(trust_score desc);
create index if not exists land_listings_safelands_idx on land_listings(safelands_id);
create index if not exists land_insights_listing_idx on land_insights(listing_id);
create index if not exists land_payments_status_idx on land_payments(status);
