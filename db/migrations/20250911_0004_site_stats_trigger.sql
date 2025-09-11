create or replace function public.refresh_site_stats(p_site_id uuid)
returns void language sql as $$
  insert into public.site_stats(site_id, avg_rating, review_count, last_review_at)
  select r.site_id,
         coalesce(round(avg(r.rating)::numeric,2),0),
         count(*)::int,
         max(r.created_at)
  from public.reviews r
  where r.site_id = p_site_id and r.status='published'
  group by r.site_id
  on conflict (site_id) do update
    set avg_rating   = excluded.avg_rating,
        review_count = excluded.review_count,
        last_review_at = excluded.last_review_at;
$$;

create or replace function public.on_reviews_change()
returns trigger language plpgsql as $$
begin
  perform public.refresh_site_stats(coalesce(new.site_id, old.site_id));
  return null;
end $$;

drop trigger if exists trg_reviews_agg on public.reviews;
create trigger trg_reviews_agg
after insert or update or delete on public.reviews
for each row execute function public.on_reviews_change();
