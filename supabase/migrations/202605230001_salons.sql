-- salons: main listing table
create table public.salons (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  type             text not null check (type in ('salon', 'mobile')),
  gender           text not null check (gender in ('men', 'women', 'unisex')),
  district         text not null,
  town             text,
  region           text not null,
  service_area     text,
  whatsapp         text not null,
  phone            text,
  opening_hours    text not null,
  walkin           boolean not null default true,
  about            text check (char_length(about) <= 300),
  cover_photo_url  text,
  status           text not null default 'pending'
                   check (status in ('pending', 'active', 'featured')),
  created_at       timestamptz not null default now()
);

create index salons_status_idx   on public.salons(status);
create index salons_district_idx on public.salons(district);
create index salons_created_idx  on public.salons(created_at desc);

-- salon_services: services offered by each salon
create table public.salon_services (
  id               uuid primary key default gen_random_uuid(),
  salon_id         uuid not null references public.salons(id) on delete cascade,
  name             text not null,
  gender           text not null check (gender in ('men', 'women', 'unisex')),
  price_from       integer,
  price_to         integer,
  duration_minutes integer,
  photo_url        text,
  sort_order       integer not null default 0
);

create index salon_services_salon_idx on public.salon_services(salon_id);
create index salon_services_name_idx  on public.salon_services(name);

-- salon_portfolio: portfolio photos for each salon
create table public.salon_portfolio (
  id         uuid primary key default gen_random_uuid(),
  salon_id   uuid not null references public.salons(id) on delete cascade,
  photo_url  text not null,
  caption    text,
  sort_order integer not null default 0
);

create index salon_portfolio_salon_idx on public.salon_portfolio(salon_id);

-- RLS for salons
alter table public.salons enable row level security;

drop policy if exists "Public can read active salons" on public.salons;
create policy "Public can read active salons"
  on public.salons for select
  using (status in ('active', 'featured'));

drop policy if exists "Public can insert salons" on public.salons;
create policy "Public can insert salons"
  on public.salons for insert
  with check (true);

-- RLS for salon_services
alter table public.salon_services enable row level security;

drop policy if exists "Public can read salon services" on public.salon_services;
create policy "Public can read salon services"
  on public.salon_services for select
  using (
    exists (
      select 1 from public.salons
      where salons.id = salon_services.salon_id
        and salons.status in ('active', 'featured')
    )
  );

drop policy if exists "Public can insert salon services" on public.salon_services;
create policy "Public can insert salon services"
  on public.salon_services for insert
  with check (true);

-- RLS for salon_portfolio
alter table public.salon_portfolio enable row level security;

drop policy if exists "Public can read salon portfolio" on public.salon_portfolio;
create policy "Public can read salon portfolio"
  on public.salon_portfolio for select
  using (
    exists (
      select 1 from public.salons
      where salons.id = salon_portfolio.salon_id
        and salons.status in ('active', 'featured')
    )
  );

drop policy if exists "Public can insert salon portfolio" on public.salon_portfolio;
create policy "Public can insert salon portfolio"
  on public.salon_portfolio for insert
  with check (true);
