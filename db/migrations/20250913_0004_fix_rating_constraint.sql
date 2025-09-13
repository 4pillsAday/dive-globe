-- Fix rating constraint to allow 0 for replies (no rating)
-- Drop the existing constraint
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_rating_check;

-- Add new constraint that allows 0 (for replies) or 1-5 (for top-level reviews)
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_rating_check 
CHECK (rating >= 0 AND rating <= 5);

-- Add a constraint to ensure only replies can have rating = 0
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_rating_parent_check
CHECK (
  (rating = 0 AND parent_review_id IS NOT NULL) OR 
  (rating BETWEEN 1 AND 5 AND parent_review_id IS NULL) OR
  (rating BETWEEN 1 AND 5 AND parent_review_id IS NOT NULL)
);
