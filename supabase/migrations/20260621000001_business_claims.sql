-- Business claim + token-based edit flow.
-- NOTE: these objects were already applied directly to the live project before
-- this migration was written (schema drift) — every statement is idempotent so
-- re-running it here, or on a fresh environment, is safe either way.

create table if not exists public.business_claims (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  claimant_name text not null,
  claimant_phone text,
  claimant_whatsapp text,
  role text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.businesses add column if not exists claimed_by text;
alter table public.businesses add column if not exists owner_contact text;
alter table public.businesses add column if not exists edit_token text unique;
alter table public.businesses add column if not exists claimed_at timestamptz;

alter table public.business_claims enable row level security;

drop policy if exists "Public can submit a claim" on public.business_claims;
create policy "Public can submit a claim"
  on public.business_claims for insert
  to public
  with check (true);

-- No public select policy on business_claims: claimant phone/whatsapp numbers
-- are only readable via the service-role admin client (app/admin/claims).

-- Prevent two pending claims piling up unnoticed for the same business.
create unique index if not exists business_claims_one_pending_per_business
  on public.business_claims(business_id)
  where status = 'pending';
