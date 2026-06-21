-- Enable RLS on land_ tables. All app reads/writes go through the
-- service-role admin client (lib/supabase/server.ts), which bypasses RLS,
-- so these policies only affect direct anon-key access.

alter table public.land_listings enable row level security;
alter table public.land_agents enable row level security;
alter table public.land_insights enable row level security;
alter table public.land_payments enable row level security;
alter table public.land_saved_searches enable row level security;
alter table public.land_content enable row level security;

-- land_listings: public can read verified listings, admins manage all
drop policy if exists "Public can read verified listings" on public.land_listings;
create policy "Public can read verified listings"
  on public.land_listings for select
  using (verification_stage = 'verified');

drop policy if exists "Admins can manage listings" on public.land_listings;
create policy "Admins can manage listings"
  on public.land_listings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- land_agents: public can read, admins manage
drop policy if exists "Public can read agents" on public.land_agents;
create policy "Public can read agents"
  on public.land_agents for select
  using (true);

drop policy if exists "Admins can manage agents" on public.land_agents;
create policy "Admins can manage agents"
  on public.land_agents for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- land_insights: public can read only for verified listings (enforced at the
-- RLS layer, not just in app queries — land_insights has no own verification
-- column, so it must check back through land_listings)
drop policy if exists "Public can read insights" on public.land_insights;
drop policy if exists "Public can read insights for verified listings" on public.land_insights;
create policy "Public can read insights for verified listings"
  on public.land_insights for select
  using (
    exists (
      select 1 from public.land_listings l
      where l.id = land_insights.listing_id
        and l.verification_stage = 'verified'
    )
  );

drop policy if exists "Admins can manage insights" on public.land_insights;
create policy "Admins can manage insights"
  on public.land_insights for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- land_payments: contains buyer phone numbers — admins only, no public access
drop policy if exists "Admins can manage payments" on public.land_payments;
create policy "Admins can manage payments"
  on public.land_payments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- land_saved_searches: contains user phone numbers — admins only, no public access
drop policy if exists "Admins can manage saved searches" on public.land_saved_searches;
create policy "Admins can manage saved searches"
  on public.land_saved_searches for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- land_content: public can read published content, admins manage
drop policy if exists "Public can read content" on public.land_content;
create policy "Public can read content"
  on public.land_content for select
  using (true);

drop policy if exists "Admins can manage content" on public.land_content;
create policy "Admins can manage content"
  on public.land_content for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
