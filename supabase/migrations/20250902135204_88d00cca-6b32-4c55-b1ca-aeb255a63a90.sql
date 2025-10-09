-- Remove all MIME type restrictions from course-videos bucket to allow any file type
-- This prevents "Invalid key" errors caused by MIME type validation
UPDATE storage.buckets 
SET allowed_mime_types = NULL
WHERE id = 'course-videos';

-- Ensure the bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
SELECT 'course-videos', 'course-videos', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'course-videos');