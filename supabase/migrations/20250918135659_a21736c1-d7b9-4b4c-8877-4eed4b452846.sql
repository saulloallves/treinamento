-- Add live streaming fields to lessons table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS live_stream_room_id uuid DEFAULT gen_random_uuid();
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS live_stream_status text DEFAULT 'waiting';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS live_stream_settings jsonb DEFAULT '{}';

-- Create live_participants table for managing streaming participants
CREATE TABLE IF NOT EXISTS public.live_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  left_at timestamp with time zone,
  is_instructor boolean NOT NULL DEFAULT false,
  audio_enabled boolean NOT NULL DEFAULT true,
  video_enabled boolean NOT NULL DEFAULT true,
  screen_sharing boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'connected',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on live_participants
ALTER TABLE public.live_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for live_participants
CREATE POLICY "Users can view participants in their lessons" 
ON public.live_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.enrollments e ON e.course_id = l.course_id
    WHERE l.id = live_participants.lesson_id 
    AND (e.user_id = auth.uid() OR l.created_by = auth.uid())
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.id = live_participants.lesson_id 
    AND is_admin(auth.uid())
  )
);

CREATE POLICY "Users can manage their own participation" 
ON public.live_participants 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Instructors can manage participants in their lessons" 
ON public.live_participants 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.id = live_participants.lesson_id 
    AND (l.created_by = auth.uid() OR is_admin(auth.uid()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.id = live_participants.lesson_id 
    AND (l.created_by = auth.uid() OR is_admin(auth.uid()))
  )
);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_live_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_live_participants_updated_at
  BEFORE UPDATE ON public.live_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_live_participants_updated_at();