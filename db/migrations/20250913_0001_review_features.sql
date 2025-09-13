-- ============================================
-- 1. Enhance reviews table for better threading
-- ============================================

-- Add columns to track thread depth and root review
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS thread_depth integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS root_review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE;

-- Update existing reviews to set root_review_id
UPDATE public.reviews 
SET root_review_id = COALESCE(parent_review_id, id)
WHERE root_review_id IS NULL;

-- Create index for efficient thread queries
CREATE INDEX IF NOT EXISTS idx_reviews_root_thread 
ON public.reviews(root_review_id, created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_parent 
ON public.reviews(parent_review_id);

-- ============================================
-- 2. Create reactions table for likes/dislikes
-- ============================================

-- Create reaction type enum
DO $$ BEGIN
  CREATE TYPE reaction_type AS ENUM ('like', 'dislike');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create reactions table
CREATE TABLE IF NOT EXISTS public.review_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reaction reaction_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Ensure one reaction per user per review
  UNIQUE(review_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reactions_review 
ON public.review_reactions(review_id);

CREATE INDEX IF NOT EXISTS idx_reactions_user 
ON public.review_reactions(user_id);

-- ============================================
-- 3. Add reaction counts to reviews (denormalized for performance)
-- ============================================

ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS dislike_count integer DEFAULT 0;

-- ============================================
-- 4. Create function to update reaction counts
-- ============================================

CREATE OR REPLACE FUNCTION public.update_review_reaction_counts()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update counts based on the action
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction = 'like' THEN
      UPDATE public.reviews 
      SET like_count = like_count + 1 
      WHERE id = NEW.review_id;
    ELSE
      UPDATE public.reviews 
      SET dislike_count = dislike_count + 1 
      WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction = 'like' THEN
      UPDATE public.reviews 
      SET like_count = GREATEST(0, like_count - 1) 
      WHERE id = OLD.review_id;
    ELSE
      UPDATE public.reviews 
      SET dislike_count = GREATEST(0, dislike_count - 1) 
      WHERE id = OLD.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle reaction change (like to dislike or vice versa)
    IF OLD.reaction = 'like' AND NEW.reaction = 'dislike' THEN
      UPDATE public.reviews 
      SET like_count = GREATEST(0, like_count - 1),
          dislike_count = dislike_count + 1
      WHERE id = NEW.review_id;
    ELSIF OLD.reaction = 'dislike' AND NEW.reaction = 'like' THEN
      UPDATE public.reviews 
      SET dislike_count = GREATEST(0, dislike_count - 1),
          like_count = like_count + 1
      WHERE id = NEW.review_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for reaction counts
DROP TRIGGER IF EXISTS trg_update_reaction_counts ON public.review_reactions;
CREATE TRIGGER trg_update_reaction_counts
AFTER INSERT OR UPDATE OR DELETE ON public.review_reactions
FOR EACH ROW EXECUTE FUNCTION public.update_review_reaction_counts();

-- ============================================
-- 5. Create function to calculate thread depth
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_thread_depth()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
  parent_depth integer;
BEGIN
  IF NEW.parent_review_id IS NULL THEN
    NEW.thread_depth := 0;
    NEW.root_review_id := NEW.id;
  ELSE
    -- Get parent's depth
    SELECT thread_depth, COALESCE(root_review_id, id)
    INTO parent_depth, NEW.root_review_id
    FROM public.reviews
    WHERE id = NEW.parent_review_id;
    
    NEW.thread_depth := COALESCE(parent_depth, 0) + 1;
    
    -- Enforce maximum depth (e.g., 3 levels)
    IF NEW.thread_depth > 2 THEN
      RAISE EXCEPTION 'Maximum reply depth exceeded';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for thread depth
DROP TRIGGER IF EXISTS trg_calculate_thread_depth ON public.reviews;
CREATE TRIGGER trg_calculate_thread_depth
BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.calculate_thread_depth();

-- ============================================
-- 6. Enable RLS on reactions table
-- ============================================

ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;

-- Everyone can read reactions
CREATE POLICY "reactions: public read"
ON public.review_reactions
FOR SELECT
USING (true);

-- Users can only insert their own reactions
CREATE POLICY "reactions: insert own"
ON public.review_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own reactions
CREATE POLICY "reactions: update own"
ON public.review_reactions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own reactions
CREATE POLICY "reactions: delete own"
ON public.review_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 7. Update existing reaction counts (one-time migration)
-- ============================================

UPDATE public.reviews r
SET 
  like_count = COALESCE((
    SELECT COUNT(*) 
    FROM public.review_reactions 
    WHERE review_id = r.id AND reaction = 'like'
  ), 0),
  dislike_count = COALESCE((
    SELECT COUNT(*) 
    FROM public.review_reactions 
    WHERE review_id = r.id AND reaction = 'dislike'
  ), 0);
