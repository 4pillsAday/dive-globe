-- Fix site_stats calculation to exclude replies (rating=0) from average calculation
-- but include all reviews in the count
create or replace function public.refresh_site_stats(p_site_id uuid)
returns void language sql as $$
  insert into public.site_stats(site_id, avg_rating, review_count, last_review_at)
  select 
    r.site_id,
    coalesce(round(avg(CASE WHEN r.rating > 0 THEN r.rating ELSE NULL END)::numeric, 2), 0),
    count(*)::int,
    max(r.created_at)
  from public.reviews r
  where r.site_id = p_site_id 
    and r.status = 'published'
    and r.parent_review_id IS NULL  -- Only count top-level reviews
  group by r.site_id
  on conflict (site_id) do update
    set avg_rating = excluded.avg_rating,
        review_count = excluded.review_count,
        last_review_at = excluded.last_review_at;
$$;

-- Recalculate all existing site stats
UPDATE public.reviews SET updated_at = updated_at WHERE id IS NOT NULL;
