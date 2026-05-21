create table if not exists public.jobs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  skill_category   text not null,
  district         text not null,
  town             text,
  employer_name    text not null,
  contact_whatsapp text,
  contact_phone    text,
  contact_walkin   text,
  pay_amount       integer,
  pay_period       text check (pay_period in ('daily','weekly','monthly')),
  job_type         text check (job_type in ('permanent','casual','contract')),
  gender_pref      text check (gender_pref in ('male','female','any')),
  min_education    text check (min_education in ('none','ple','uce','uace','certificate','diploma','degree')),
  accommodation    text check (accommodation in ('yes','no','negotiable')),
  food_provided    text check (food_provided in ('yes','no','negotiable')),
  languages        text[],
  description      text,
  status           text not null default 'pending' check (status in ('pending','active','rejected')),
  featured         boolean not null default false,
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default now() + interval '30 days'
);

create index if not exists jobs_status_idx   on public.jobs(status);
create index if not exists jobs_district_idx on public.jobs(district);
create index if not exists jobs_skill_idx    on public.jobs(skill_category);
create index if not exists jobs_featured_idx on public.jobs(featured, created_at desc);

create table if not exists public.worker_profiles (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  skill_primary    text not null,
  skills_extra     text[],
  district         text not null,
  town             text,
  contact_whatsapp text,
  contact_phone    text,
  experience_years integer,
  pay_expectation  integer,
  pay_period       text check (pay_period in ('daily','weekly','monthly')),
  job_type_pref    text[],
  education        text check (education in ('none','ple','uce','uace','certificate','diploma','degree')),
  languages        text[],
  own_tools        boolean,
  willing_to_travel boolean,
  bio              text check (char_length(bio) <= 100),
  available        boolean not null default true,
  status           text not null default 'active' check (status in ('active','hidden')),
  created_at       timestamptz not null default now()
);

create index if not exists workers_district_idx  on public.worker_profiles(district);
create index if not exists workers_skill_idx     on public.worker_profiles(skill_primary);
create index if not exists workers_available_idx on public.worker_profiles(available, status);