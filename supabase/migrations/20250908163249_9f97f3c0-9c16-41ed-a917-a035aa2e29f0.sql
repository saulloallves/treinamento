-- Create table for automated lesson dispatch configurations
CREATE TABLE public.automated_lesson_dispatches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  dispatch_type TEXT NOT NULL CHECK (dispatch_type IN ('1_hour_before', '10_minutes_before')),
  message_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(lesson_id, dispatch_type)
);

-- Enable RLS
ALTER TABLE public.automated_lesson_dispatches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view automated dispatches"
ON public.automated_lesson_dispatches
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage automated dispatches"
ON public.automated_lesson_dispatches
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_automated_lesson_dispatches_updated_at
BEFORE UPDATE ON public.automated_lesson_dispatches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();