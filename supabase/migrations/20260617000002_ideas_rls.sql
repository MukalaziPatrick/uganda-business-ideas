-- Enable RLS on ideas tables. All app reads/writes go through the
-- service-role admin client (lib/supabase/server.ts), which bypasses RLS,
-- so these policies only affect direct anon-key access.

alter table public.business_ideas    enable row level security;
alter table public.idea_stories      enable row level security;
alter table public.idea_resources    enable row level security;
alter table public.idea_suppliers    enable row level security;

-- business_ideas: public can read published ideas only, admins manage all
drop policy if exists "Public can read published ideas" on public.business_ideas;
create policy "Public can read published ideas"
  on public.business_ideas for select
  using (published = true);

drop policy if exists "Admins can manage ideas" on public.business_ideas;
create policy "Admins can manage ideas"
  on public.business_ideas for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- idea_stories: public can read all, admins manage
drop policy if exists "Public can read stories" on public.idea_stories;
create policy "Public can read stories"
  on public.idea_stories for select
  using (true);

drop policy if exists "Admins can manage stories" on public.idea_stories;
create policy "Admins can manage stories"
  on public.idea_stories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- idea_resources: public can read all, admins manage
drop policy if exists "Public can read resources" on public.idea_resources;
create policy "Public can read resources"
  on public.idea_resources for select
  using (true);

drop policy if exists "Admins can manage resources" on public.idea_resources;
create policy "Admins can manage resources"
  on public.idea_resources for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- idea_suppliers: public can read all, admins manage
drop policy if exists "Public can read suppliers" on public.idea_suppliers;
create policy "Public can read suppliers"
  on public.idea_suppliers for select
  using (true);

drop policy if exists "Admins can manage suppliers" on public.idea_suppliers;
create policy "Admins can manage suppliers"
  on public.idea_suppliers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
