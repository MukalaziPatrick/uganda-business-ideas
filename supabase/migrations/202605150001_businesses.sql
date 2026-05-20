create table public.businesses (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         text not null,
  region           text not null check (region in ('Central','Eastern','Northern','Western')),
  district         text not null,
  town             text,
  description      text check (char_length(description) <= 300),
  hours            text,
  whatsapp         text,
  phone            text,
  website          text,
  facebook         text,
  instagram        text,
  tiktok           text,
  view_count       integer not null default 0,
  whatsapp_clicks  integer not null default 0,
  contact_clicks   integer not null default 0,
  status           text not null default 'pending'
                   check (status in ('pending','active','rejected')),
  created_at       timestamptz not null default now()
);

create index businesses_status_idx   on public.businesses(status);
create index businesses_region_idx   on public.businesses(region);
create index businesses_category_idx on public.businesses(category);
create index businesses_district_idx on public.businesses(district);
create index businesses_created_idx  on public.businesses(created_at desc);

alter table public.businesses enable row level security;

drop policy if exists "Public can read active businesses" on public.businesses;
create policy "Public can read active businesses"
  on public.businesses for select
  using (status = 'active');

drop policy if exists "Public can insert businesses" on public.businesses;
create policy "Public can insert businesses"
  on public.businesses for insert
  with check (true);

drop policy if exists "Admins can manage businesses" on public.businesses;
create policy "Admins can manage businesses"
  on public.businesses for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.increment_business_signal(
  business_id uuid,
  signal_col  text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if signal_col = 'view_count' then
    update public.businesses set view_count = view_count + 1 where id = business_id;
  elsif signal_col = 'whatsapp_clicks' then
    update public.businesses set whatsapp_clicks = whatsapp_clicks + 1 where id = business_id;
  elsif signal_col = 'contact_clicks' then
    update public.businesses set contact_clicks = contact_clicks + 1 where id = business_id;
  end if;
end;
$$;
