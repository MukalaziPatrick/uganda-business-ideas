-- Import likely pharmacy rows from the existing businesses dataset.
-- Safety:
-- 1. Keep whatsapp null unless the source row truly has a whatsapp value.
-- 2. Leave nda_licence_no and licence_expiry null until independently verified.
-- 3. Import as pending so rows can be reviewed before public activation.

insert into public.pharmacy_businesses (
  slug,
  name,
  region,
  district,
  service_area,
  address,
  whatsapp,
  phone,
  hours,
  is_24_hour,
  has_delivery,
  supervising_pharmacist,
  nda_licence_no,
  licence_expiry,
  status
)
select
  regexp_replace(lower(b.name), '[^a-z0-9]+', '-', 'g')
    || '-'
    || substr(b.id::text, 1, 8) as slug,
  b.name,
  b.region,
  b.district,
  coalesce(nullif(b.town, ''), b.district) as service_area,
  b.address,
  nullif(btrim(b.whatsapp), '') as whatsapp,
  nullif(btrim(b.phone), '') as phone,
  null as hours,
  false as is_24_hour,
  false as has_delivery,
  null as supervising_pharmacist,
  null as nda_licence_no,
  null as licence_expiry,
  'pending' as status
from public.businesses b
where b.status = 'active'
  and b.category = 'Health & Pharmacy'
  and (
    lower(b.name) like '%pharmacy%'
    or lower(b.name) like '%phamacy%'
    or lower(b.name) like '%pharma%'
    or lower(b.name) like '%pharmaceutical%'
  )
  and lower(b.name) not like '%vet%'
  and lower(b.name) not like '%veterinary%'
  and lower(b.name) not like '%drug shop%'
  and lower(b.name) not like '%dispensary%'
  and (
    nullif(btrim(coalesce(b.whatsapp, '')), '') is not null
    or nullif(btrim(coalesce(b.phone, '')), '') is not null
  )
on conflict (slug) do nothing;
