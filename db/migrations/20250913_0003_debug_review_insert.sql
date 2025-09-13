-- Debug: Update the thread depth calculation trigger to log more information
CREATE OR REPLACE FUNCTION public.calculate_thread_depth()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
  parent_depth integer;
  parent_root uuid;
BEGIN
  IF NEW.parent_review_id IS NULL THEN
    NEW.thread_depth := 0;
    NEW.root_review_id := NEW.id;
  ELSE
    -- Get parent's depth and root
    SELECT thread_depth, COALESCE(root_review_id, id)
    INTO parent_depth, parent_root
    FROM public.reviews
    WHERE id = NEW.parent_review_id;
    
    -- Check if parent was found
    IF parent_depth IS NULL THEN
      RAISE EXCEPTION 'Parent review % not found', NEW.parent_review_id;
    END IF;
    
    NEW.thread_depth := parent_depth + 1;
    NEW.root_review_id := parent_root;
    
    -- Enforce maximum depth (e.g., 3 levels)
    IF NEW.thread_depth > 2 THEN
      RAISE EXCEPTION 'Maximum reply depth exceeded. Current depth: %, Max allowed: 2', NEW.thread_depth;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
