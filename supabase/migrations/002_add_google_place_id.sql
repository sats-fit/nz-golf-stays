alter table public.courses
  add column if not exists google_place_id text;
