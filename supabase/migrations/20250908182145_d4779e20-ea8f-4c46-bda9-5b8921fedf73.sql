-- Fix order: drop constraint first, then update values, then recreate constraint
BEGIN;

-- 1) Drop old check constraint so we can change values safely
ALTER TABLE public.automated_lesson_dispatches
DROP CONSTRAINT IF EXISTS automated_lesson_dispatches_dispatch_type_check;

-- 2) Normalize existing values to the new set
UPDATE public.automated_lesson_dispatches
SET dispatch_type = '2_hours_before'
WHERE dispatch_type IN ('1_hour_before', 'one_hour_before', '1h_before', '1_hour');

UPDATE public.automated_lesson_dispatches
SET dispatch_type = '30_minutes_before'
WHERE dispatch_type IN ('10_minutes_before', 'ten_minutes_before', '10m_before', '10_min_before', '10_minutes');

-- 3) Recreate the check constraint allowing the new values
ALTER TABLE public.automated_lesson_dispatches
ADD CONSTRAINT automated_lesson_dispatches_dispatch_type_check
CHECK (dispatch_type IN ('2_hours_before', '30_minutes_before'));

COMMIT;