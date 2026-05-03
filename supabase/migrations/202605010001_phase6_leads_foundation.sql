create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'ops', 'editor', 'viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  location text,
  budget text,
  business_interest text,
  timeline text,
  notes text,
  source text not null default 'start_page',
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'not_fit', 'closed')),
  assigned_tag text,
  assigned_admin_id uuid references auth.users(id),
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_business_interest_idx on public.leads(business_interest);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.has_admin_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and is_active = true
      and role = any(required_roles)
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Admins can read own profile" on public.admin_profiles;
create policy "Admins can read own profile"
on public.admin_profiles
for select
to authenticated
using (id = auth.uid() and is_active = true);

drop policy if exists "Owners can manage admin profiles" on public.admin_profiles;
create policy "Owners can manage admin profiles"
on public.admin_profiles
for all
to authenticated
using (public.has_admin_role(array['owner']))
with check (public.has_admin_role(array['owner']));

drop policy if exists "Owners and ops can read leads" on public.leads;
create policy "Owners and ops can read leads"
on public.leads
for select
to authenticated
using (public.has_admin_role(array['owner', 'ops']));

drop policy if exists "Owners and ops can insert leads" on public.leads;
create policy "Owners and ops can insert leads"
on public.leads
for insert
to authenticated
with check (public.has_admin_role(array['owner', 'ops']));

drop policy if exists "Owners and ops can update leads" on public.leads;
create policy "Owners and ops can update leads"
on public.leads
for update
to authenticated
using (public.has_admin_role(array['owner', 'ops']))
with check (public.has_admin_role(array['owner', 'ops']));

drop policy if exists "Owners can delete leads" on public.leads;
create policy "Owners can delete leads"
on public.leads
for delete
to authenticated
using (public.has_admin_role(array['owner']));
