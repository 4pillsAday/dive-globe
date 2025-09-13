-- Add support for nested reviews
alter table public.reviews
add column parent_review_id uuid references public.reviews(id) on delete cascade;

create index if not exists ix_reviews_parent_review_id on public.reviews(parent_review_id);
