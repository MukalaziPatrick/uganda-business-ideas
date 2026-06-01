create table if not exists whatsapp_reports (
  id                  uuid primary key default gen_random_uuid(),
  conversation_id     uuid references whatsapp_conversations(id) on delete cascade,
  report_text         text,
  generated_at        timestamptz,
  approved_at         timestamptz,
  delivered_at        timestamptz,
  telegram_message_id text
);
