create table public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, course_id)
);

alter table public.wishlists enable row level security;

create policy "Users can view own wishlist"
  on public.wishlists for select
  using (auth.uid() = user_id);

create policy "Users can insert own wishlist"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own wishlist"
  on public.wishlists for delete
  using (auth.uid() = user_id);
