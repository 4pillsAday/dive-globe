-- === Safety/context ===
create extension if not exists pgcrypto;  -- for gen_random_uuid()

-- === 1) Types ===
do $$ begin
  create type review_status as enum ('published','pending','rejected');
exception when duplicate_object then null; end $$;

-- === 2) Tables ===
-- Users mirror (app profile; linked to auth.user.id)
create table if not exists public.users(
  id            uuid primary key,              -- equals auth.uid
  email         text unique not null,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Dive sites catalog (mirrors CMS subset)
create table if not exists public.dive_sites(
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  description      text,
  location_country text,
  lat              double precision not null,
  lng              double precision not null,
  depth_m          integer,
  features         text[],
  webflow_item_id  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Reviews (1..5 rating, threaded w/ parent_review_id)
create table if not exists public.reviews(
  id               uuid primary key default gen_random_uuid(),
  site_id          uuid not null references public.dive_sites(id) on delete cascade,
  author_id        uuid not null references public.users(id)      on delete cascade,
  rating           integer not null check (rating between 1 and 5),
  body             text not null check (length(body) between 2 and 2500),
  parent_review_id uuid references public.reviews(id) on delete cascade,
  status           review_status not null default 'published',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  edited_at        timestamptz
);

-- Review photos (metadata, not the binary)
create table if not exists public.review_photos(
  id           uuid primary key default gen_random_uuid(),
  review_id    uuid not null references public.reviews(id) on delete cascade,
  storage_path text not null,   -- e.g. "review-photos/userId/reviewId/file.webp"
  width        integer,
  height       integer,
  bytes        integer,
  content_type text,
  status       text not null default 'visible',
  created_at   timestamptz not null default now()
);

-- Favorites (many-to-many user<->site)
create table if not exists public.favorites(
  user_id    uuid not null references public.users(id) on delete cascade,
  site_id    uuid not null references public.dive_sites(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, site_id)
);

-- Denormalized stats for quick reads
create table if not exists public.site_stats(
  site_id        uuid primary key references public.dive_sites(id) on delete cascade,
  avg_rating     numeric(3,2) not null default 0,
  review_count   integer      not null default 0,
  last_review_at timestamptz
);

-- === 3) Indexes (from your spec + helpful extras) ===
create index if not exists ix_sites_slug     on public.dive_sites(slug);
create index if not exists ix_reviews_site   on public.reviews(site_id);
create index if not exists ix_reviews_author on public.reviews(author_id);
create index if not exists ix_sites_latlng   on public.dive_sites(lat,lng);

-- === 4) Triggers for updated_at ===
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_touch_users on public.users;
create trigger trg_touch_users
before update on public.users
for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_sites on public.dive_sites;
create trigger trg_touch_sites
before update on public.dive_sites
for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_reviews on public.reviews;
create trigger trg_touch_reviews
before update on public.reviews
for each row execute function public.touch_updated_at();
