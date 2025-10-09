-- Migrate dispatch_type values and fix check constraint for automated_lesson_dispatches
BEGIN;

-- 1) Update existing rows from old values to new ones
UPDATE public.automated_lesson_dispatches
SET dispatch_type = '2_hours_before'
WHERE dispatch_type IN ('1_hour_before', 'one_hour_before', '1h_before', '1_hour');

UPDATE public.automated_lesson_dispatches
SET dispatch_type = '30_minutes_before'
WHERE dispatch_type IN ('10_minutes_before', 'ten_minutes_before', '10m_before', '10_min_before', '10_minutes');

-- 2) Drop old check constraint if exists
ALTER TABLE public.automated_lesson_dispatches
DROP CONSTRAINT IF EXISTS automated_lesson_dispatches_dispatch_type_check;

-- 3) Add new check constraint to allow only the new accepted values
ALTER TABLE public.automated_lesson_dispatches
ADD CONSTRAINT automated_lesson_dispatches_dispatch_type_check
CHECK (dispatch_type IN ('2_hours_before', '30_minutes_before'));

COMMIT;