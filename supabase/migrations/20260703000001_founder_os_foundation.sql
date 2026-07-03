-- Founder OS foundation: shared-lead vertical column + fos_ module tables.
-- Reuses public.set_updated_at() and public.is_admin() from 202605010001_phase6_leads_foundation.sql.

alter table public.leads
  add column if not exists vertical text not null default 'general';

create index if not exists leads_vertical_idx on public.leads(vertical);

create table if not exists public.fos_intakes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'partial' check (status in ('partial', 'complete')),
  current_step integer not null default 1,
  founder_name text,
  phone text,
  email text,
  business_idea text,
  niche text,
  audience text,
  stage text check (stage in ('idea', 'started', 'selling')),
  budget text,
  goals text,
  help_needed text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fos_launch_plans (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references public.fos_intakes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  offer_statement text not null,
  lead_magnet_idea text not null,
  readiness_summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fos_plan_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.fos_launch_plans(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 30),
  title text not null,
  detail text,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fos_content_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.fos_launch_plans(id) on delete cascade,
  kind text not null check (kind in ('content_idea', 'post_draft', 'headline', 'email_cta')),
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fos_module_clicks (
  id uuid primary key default gen_random_uuid(),
  module text not null check (module in ('registration', 'compliance', 'payments', 'banking')),
  intake_id uuid references public.fos_intakes(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists fos_intakes_status_idx on public.fos_intakes(status);
create index if not exists fos_intakes_lead_id_idx on public.fos_intakes(lead_id);
create index if not exists fos_launch_plans_intake_id_idx on public.fos_launch_plans(intake_id);
create index if not exists fos_plan_tasks_plan_id_idx on public.fos_plan_tasks(plan_id);
create index if not exists fos_content_items_plan_id_idx on public.fos_content_items(plan_id);
create index if not exists fos_module_clicks_module_idx on public.fos_module_clicks(module);

drop trigger if exists set_fos_intakes_updated_at on public.fos_intakes;
create trigger set_fos_intakes_updated_at
before update on public.fos_intakes
for each row execute function public.set_updated_at();

drop trigger if exists set_fos_launch_plans_updated_at on public.fos_launch_plans;
create trigger set_fos_launch_plans_updated_at
before update on public.fos_launch_plans
for each row execute function public.set_updated_at();

drop trigger if exists set_fos_plan_tasks_updated_at on public.fos_plan_tasks;
create trigger set_fos_plan_tasks_updated_at
before update on public.fos_plan_tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_fos_content_items_updated_at on public.fos_content_items;
create trigger set_fos_content_items_updated_at
before update on public.fos_content_items
for each row execute function public.set_updated_at();

alter table public.fos_intakes enable row level security;
alter table public.fos_launch_plans enable row level security;
alter table public.fos_plan_tasks enable row level security;
alter table public.fos_content_items enable row level security;
alter table public.fos_module_clicks enable row level security;

-- Admins manage everything; founders read their own rows; no anon policies
-- (public writes go through API routes using the service-role client, which bypasses RLS).

create policy fos_intakes_admin_all on public.fos_intakes
  for all using (public.is_admin()) with check (public.is_admin());
create policy fos_intakes_owner_select on public.fos_intakes
  for select using (auth.uid() = user_id);

create policy fos_launch_plans_admin_all on public.fos_launch_plans
  for all using (public.is_admin()) with check (public.is_admin());
create policy fos_launch_plans_owner_select on public.fos_launch_plans
  for select using (auth.uid() = user_id);

create policy fos_plan_tasks_admin_all on public.fos_plan_tasks
  for all using (public.is_admin()) with check (public.is_admin());
create policy fos_plan_tasks_owner_select on public.fos_plan_tasks
  for select using (
    exists (
      select 1 from public.fos_launch_plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  );

create policy fos_content_items_admin_all on public.fos_content_items
  for all using (public.is_admin()) with check (public.is_admin());
create policy fos_content_items_owner_select on public.fos_content_items
  for select using (
    exists (
      select 1 from public.fos_launch_plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  );

create policy fos_module_clicks_admin_all on public.fos_module_clicks
  for all using (public.is_admin()) with check (public.is_admin());
