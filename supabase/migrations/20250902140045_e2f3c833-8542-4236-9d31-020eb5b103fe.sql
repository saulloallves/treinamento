-- Remove file size limit from course-videos bucket to allow larger uploads
-- This prevents "The object exceeded the maximum allowed size" errors
UPDATE storage.buckets 
SET file_size_limit = NULL
WHERE id = 'course-videos';

-- Ensure the bucket exists with no size limit
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'course-videos', 'course-videos', true, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'course-videos');