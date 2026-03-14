-- NZ Golf Courses + Motorhome Stays schema

-- Enum types
create type stay_n_play_option as enum ('yes', 'no', 'free_with_gf');
create type dogs_option as enum ('yes', 'no', 'unknown');

-- Main courses table
create table public.courses (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  address             text,
  lat                 double precision,
  lng                 double precision,
  region              text,
  phone               text,
  website             text,
  notes               text,

  -- Overnight stay fields
  overnight_stays     boolean not null default false,
  stay_n_play         stay_n_play_option not null default 'no',
  stay_no_play        boolean not null default false,
  stay_no_play_price  text,
  dogs                dogs_option not null default 'unknown',
  power               boolean not null default false,
  ask_first           boolean not null default false,

  -- Photos: array of Supabase Storage public URLs
  photos              text[] default '{}',

  -- Moderation
  approved            boolean not null default false,
  submitted_by        text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger courses_updated_at
  before update on public.courses
  for each row execute function public.handle_updated_at();

-- Indexes
create index courses_region_idx on public.courses (region);
create index courses_approved_idx on public.courses (approved);
create index courses_name_idx on public.courses (name);

-- Row Level Security
alter table public.courses enable row level security;

-- Public can read approved courses
create policy "Public read approved courses"
  on public.courses for select
  using (approved = true);

-- Anyone can submit (always lands with approved=false enforced by api route)
create policy "Anyone can submit a course"
  on public.courses for insert
  with check (approved = false);

-- Storage bucket for course photos
-- Run these in Supabase dashboard > SQL editor after creating bucket 'course-photos' (public):
--
-- create policy "Anyone can upload course photos"
--   on storage.objects for insert
--   with check (bucket_id = 'course-photos');
--
-- create policy "Public read course photos"
--   on storage.objects for select
--   using (bucket_id = 'course-photos');
