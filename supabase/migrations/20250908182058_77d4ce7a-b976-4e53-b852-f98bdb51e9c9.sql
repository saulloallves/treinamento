-- Fix automated_lesson_dispatches constraint to allow new values
BEGIN;

-- 1) Remove old constraint completely
ALTER TABLE public.automated_lesson_dispatches
DROP CONSTRAINT IF EXISTS automated_lesson_dispatches_dispatch_type_check;

-- 2) Update any existing invalid values to valid ones
UPDATE public.automated_lesson_dispatches
SET dispatch_type = CASE 
  WHEN dispatch_type NOT IN ('2_hours_before', '30_minutes_before') THEN '2_hours_before'
  ELSE dispatch_type
END;

-- 3) Create new constraint with only the accepted values
ALTER TABLE public.automated_lesson_dispatches
ADD CONSTRAINT automated_lesson_dispatches_dispatch_type_check
CHECK (dispatch_type IN ('2_hours_before', '30_minutes_before'));

COMMIT;