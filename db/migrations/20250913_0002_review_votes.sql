-- Add support for review votes (likes/dislikes)
create table if not exists public.review_votes(
  review_id  uuid not null references public.reviews(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  vote       smallint not null check (vote in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create index if not exists ix_review_votes_user_id on public.review_votes(user_id);


-- Secure the table with RLS policies
alter table public.review_votes enable row level security;

-- Users can insert their own votes
create policy "review_votes: insert self"
on public.review_votes for insert
with check (auth.uid() = user_id);

-- Users can update their own votes
create policy "review_votes: update self"
on public.review_votes for update
using (auth.uid() = user_id);

-- Users can delete their own votes
create policy "review_votes: delete self"
on public.review_votes for delete
using (auth.uid() = user_id);

-- Allow everyone to read all votes (they are not sensitive)
create policy "review_votes: select all"
on public.review_votes for select
using (true);
