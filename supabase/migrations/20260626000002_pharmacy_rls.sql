-- Enable RLS on pharmacy_businesses. App admin writes go through the
-- service-role client (bypasses RLS); these policies govern direct anon access.

alter table public.pharmacy_businesses enable row level security;

-- Public can read only active/featured pharmacies with a valid (non-lapsed) licence.
-- A null licence_expiry is treated as valid (licence date unknown but pharmacy approved).
drop policy if exists "Public can read active pharmacies" on public.pharmacy_businesses;
create policy "Public can read active pharmacies"
  on public.pharmacy_businesses for select
  using (
    status in ('active', 'featured')
    and (licence_expiry is null or licence_expiry >= current_date)
  );

-- Admins manage all rows.
drop policy if exists "Admins can manage pharmacies" on public.pharmacy_businesses;
create policy "Admins can manage pharmacies"
  on public.pharmacy_businesses for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
