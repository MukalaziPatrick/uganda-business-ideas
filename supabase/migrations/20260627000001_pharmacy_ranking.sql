-- Admin-only pharmacy ranking inputs.
-- These fields support private curation and must not be shown on the public pharmacy page.

alter table public.pharmacy_businesses
  add column if not exists google_rating numeric(2, 1)
    check (google_rating is null or (google_rating >= 0 and google_rating <= 5)),
  add column if not exists google_review_count integer
    check (google_review_count is null or google_review_count >= 0),
  add column if not exists phone_verified boolean not null default false,
  add column if not exists map_verified boolean not null default false,
  add column if not exists licence_verified boolean not null default false,
  add column if not exists rank_score integer not null default 0
    check (rank_score >= 0),
  add column if not exists ranking_notes text,
  add column if not exists ranking_updated_at timestamptz;

create index if not exists pharmacy_businesses_rank_score_idx
  on public.pharmacy_businesses (rank_score desc);
