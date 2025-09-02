-- Make the course-videos bucket public for video playback
UPDATE storage.buckets 
SET public = true 
WHERE id = 'course-videos';

-- Create RLS policies for the course-videos bucket
CREATE POLICY "Public can view course videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can upload course videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update course videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete course videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);