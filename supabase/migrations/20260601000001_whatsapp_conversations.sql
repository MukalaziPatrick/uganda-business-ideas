create table if not exists whatsapp_conversations (
  id              uuid primary key default gen_random_uuid(),
  phone_number    text not null unique,
  state           text not null default 'NEW',
  business_type   text,
  budget          text,
  location        text,
  concern         text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists whatsapp_conversations_phone_idx
  on whatsapp_conversations (phone_number);
