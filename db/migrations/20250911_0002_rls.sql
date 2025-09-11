-- Enable RLS
alter table public.reviews   enable row level security;
alter table public.favorites enable row level security;

-- Everyone can read published reviews
create policy "reviews: select published"
  on public.reviews
  for select
  using (status = 'published');

-- Authors can insert their own review
create policy "reviews: insert self"
  on public.reviews
  for insert
  with check (auth.uid() = author_id);

-- Authors can update their own review
create policy "reviews: update self"
  on public.reviews
  for update
  using (auth.uid() = author_id);

-- Users can CRUD their own favorites
create policy "favorites: self"
  on public.favorites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: site_stats & dive_sites are public-read (no PII)
alter table public.dive_sites  enable row level security;
alter table public.site_stats  enable row level security;

create policy "sites: public read"
  on public.dive_sites for select using (true);

create policy "site_stats: public read"
  on public.site_stats for select using (true);
