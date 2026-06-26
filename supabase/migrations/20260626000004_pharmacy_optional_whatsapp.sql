-- Allow phone-only pharmacies to appear while WhatsApp is still being confirmed.
-- Guardrail: every row must still have at least one contact method.

alter table public.pharmacy_businesses
  alter column whatsapp drop not null;

alter table public.pharmacy_businesses
  drop constraint if exists pharmacy_businesses_requires_contact;

alter table public.pharmacy_businesses
  add constraint pharmacy_businesses_requires_contact
  check (
    nullif(btrim(coalesce(whatsapp, '')), '') is not null
    or nullif(btrim(coalesce(phone, '')), '') is not null
  );
