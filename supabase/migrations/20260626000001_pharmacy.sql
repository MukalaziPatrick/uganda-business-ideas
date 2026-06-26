-- Pharmacy Locator vertical: facility-level directory only.
-- Compliance: NO drug names, prices, stock, or ordering fields by design.
-- See docs/superpowers/specs/2026-06-26-pharmacy-locator-design.md

create table if not exists public.pharmacy_businesses (
  id                     uuid        primary key default gen_random_uuid(),
  slug                   text        not null unique,
  name                   text        not null,

  -- Location
  region                 text,
  district               text,
  service_area           text,
  address                text,

  -- Contact (the only action — off-platform)
  whatsapp               text        not null,
  phone                  text,

  -- Facility info (no drug names / prices / stock)
  hours                  text,
  is_24_hour             boolean     not null default false,
  has_delivery           boolean     not null default false,
  supervising_pharmacist text,

  -- Compliance / verification
  nda_licence_no         text,
  licence_expiry         date,

  -- Lifecycle
  status                 text        not null default 'pending'
                                     check (status in ('pending', 'active', 'featured')),
  created_at             timestamptz not null default now()
);

create index if not exists pharmacy_businesses_status_idx
  on public.pharmacy_businesses (status);
create index if not exists pharmacy_businesses_slug_idx
  on public.pharmacy_businesses (slug);
create index if not exists pharmacy_businesses_licence_expiry_idx
  on public.pharmacy_businesses (licence_expiry);
