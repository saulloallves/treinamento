
-- Create enrollments table to track student course enrollments
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'Ativo',
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  completed_lessons TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- Add Row Level Security (RLS)
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for enrollments
CREATE POLICY "Users can view all enrollments" 
  ON public.enrollments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create enrollments" 
  ON public.enrollments 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update enrollments" 
  ON public.enrollments 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete enrollments" 
  ON public.enrollments 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Create student progress tracking table
CREATE TABLE public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for student progress
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all student progress" 
  ON public.student_progress 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage student progress" 
  ON public.student_progress 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Create trigger to update updated_at column for enrollments
CREATE TRIGGER update_enrollments_updated_at 
  BEFORE UPDATE ON public.enrollments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update updated_at column for student_progress
CREATE TRIGGER update_student_progress_updated_at 
  BEFORE UPDATE ON public.student_progress 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
