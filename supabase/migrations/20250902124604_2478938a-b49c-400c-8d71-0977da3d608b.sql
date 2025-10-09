-- Add course type column to courses table
ALTER TABLE public.courses 
ADD COLUMN tipo text NOT NULL DEFAULT 'ao_vivo' 
CHECK (tipo IN ('ao_vivo', 'gravado'));

-- Create modules table for recorded courses
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Ativo',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create recorded lessons table
CREATE TABLE public.recorded_lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  video_file_path text,
  duration_minutes integer DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Ativo',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  false,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime']
);

-- Enable RLS on new tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorded_lessons ENABLE ROW LEVEL SECURITY;

-- RLS policies for modules
CREATE POLICY "Authenticated users can manage modules" 
ON public.modules 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view modules" 
ON public.modules 
FOR SELECT 
USING (true);

-- RLS policies for recorded lessons
CREATE POLICY "Authenticated users can manage recorded lessons" 
ON public.recorded_lessons 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view recorded lessons" 
ON public.recorded_lessons 
FOR SELECT 
USING (true);

-- Storage policies for course videos
CREATE POLICY "Authenticated users can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'course-videos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can view videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can update their videos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'course-videos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete videos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'course-videos' 
  AND auth.uid() IS NOT NULL
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recorded_lessons_updated_at
  BEFORE UPDATE ON public.recorded_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_modules_course_id ON public.modules(course_id);
CREATE INDEX idx_modules_order_index ON public.modules(order_index);
CREATE INDEX idx_recorded_lessons_module_id ON public.recorded_lessons(module_id);
CREATE INDEX idx_recorded_lessons_course_id ON public.recorded_lessons(course_id);
CREATE INDEX idx_recorded_lessons_order_index ON public.recorded_lessons(order_index);