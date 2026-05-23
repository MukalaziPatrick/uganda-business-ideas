-- supabase/migrations/202605230001_travel.sql

-- ─── Enum types ──────────────────────────────────────────────────────────────
create type public.stay_status as enum ('pending', 'active', 'featured');
create type public.stay_type   as enum ('hotel', 'guesthouse', 'lodge', 'airbnb', 'camping');

-- ─── travel_destinations ─────────────────────────────────────────────────────
create table public.travel_destinations (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  slug            text        not null unique,
  region          text        not null,
  description     text        not null,
  activities      text[]      not null default '{}',
  cover_photo_url text,
  sort_order      integer     not null default 0,
  is_featured     boolean     not null default false
);

create index travel_destinations_sort_idx on public.travel_destinations(sort_order);

alter table public.travel_destinations enable row level security;

create policy "Public can read destinations"
  on public.travel_destinations for select using (true);

create policy "Service role can manage destinations"
  on public.travel_destinations for all using (auth.role() = 'service_role');

-- ─── travel_stays ─────────────────────────────────────────────────────────────
create table public.travel_stays (
  id              uuid            primary key default gen_random_uuid(),
  name            text            not null,
  slug            text            not null unique,
  destination_id  uuid            not null references public.travel_destinations(id) on delete cascade,
  type            public.stay_type not null,
  district        text            not null,
  town            text            not null,
  description     text            not null check (char_length(description) <= 500),
  price_from      integer         not null default 0,
  checkin_time    text            not null,
  checkout_time   text            not null,
  capacity        integer         not null,
  whatsapp        text            not null,
  phone           text,
  booking_com_url text,
  amenities       text[]          not null default '{}',
  cover_photo_url text,
  status          public.stay_status not null default 'pending',
  created_at      timestamptz     not null default now()
);

create index travel_stays_destination_idx on public.travel_stays(destination_id);
create index travel_stays_status_idx      on public.travel_stays(status);
create index travel_stays_type_idx        on public.travel_stays(type);
create index travel_stays_price_idx       on public.travel_stays(price_from);

alter table public.travel_stays enable row level security;

create policy "Public can read active stays"
  on public.travel_stays for select
  using (status in ('active', 'featured'));

create policy "Public can insert stays"
  on public.travel_stays for insert
  with check (true);

create policy "Service role can manage stays"
  on public.travel_stays for all using (auth.role() = 'service_role');

-- ─── travel_stay_rooms ────────────────────────────────────────────────────────
create table public.travel_stay_rooms (
  id             uuid    primary key default gen_random_uuid(),
  stay_id        uuid    not null references public.travel_stays(id) on delete cascade,
  name           text    not null,
  price_per_night integer not null,
  capacity       integer not null,
  sort_order     integer not null default 0
);

create index travel_stay_rooms_stay_idx on public.travel_stay_rooms(stay_id);

alter table public.travel_stay_rooms enable row level security;

create policy "Public can read rooms"
  on public.travel_stay_rooms for select using (true);

create policy "Public can insert rooms"
  on public.travel_stay_rooms for insert
  with check (true);

create policy "Service role can manage rooms"
  on public.travel_stay_rooms for all using (auth.role() = 'service_role');

-- ─── travel_stay_photos ───────────────────────────────────────────────────────
create table public.travel_stay_photos (
  id         uuid  primary key default gen_random_uuid(),
  stay_id    uuid  not null references public.travel_stays(id) on delete cascade,
  photo_url  text  not null,
  caption    text,
  sort_order integer not null default 0
);

create index travel_stay_photos_stay_idx on public.travel_stay_photos(stay_id);

alter table public.travel_stay_photos enable row level security;

create policy "Public can read photos"
  on public.travel_stay_photos for select using (true);

create policy "Public can insert photos"
  on public.travel_stay_photos for insert
  with check (true);

create policy "Service role can manage photos"
  on public.travel_stay_photos for all using (auth.role() = 'service_role');
