-- Add cover_image_url column to courses table
ALTER TABLE public.courses 
ADD COLUMN cover_image_url TEXT;

-- Create course-covers storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-covers', 'course-covers', true);

-- Create storage policies for course covers
CREATE POLICY "Course covers are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-covers');

CREATE POLICY "Authenticated users can upload course covers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update course covers" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete course covers" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-covers' AND auth.uid() IS NOT NULL);