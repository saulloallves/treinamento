-- Add Zoom integration columns to lessons
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS zoom_meeting_id text,
  ADD COLUMN IF NOT EXISTS zoom_start_url text,
  ADD COLUMN IF NOT EXISTS zoom_join_url text,
  ADD COLUMN IF NOT EXISTS zoom_start_time timestamptz;

-- Helpful index for lookups by meeting id
CREATE INDEX IF NOT EXISTS idx_lessons_zoom_meeting_id ON public.lessons (zoom_meeting_id);
