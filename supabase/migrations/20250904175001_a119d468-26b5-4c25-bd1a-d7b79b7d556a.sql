-- Add attendance keyword field to lessons table
ALTER TABLE public.lessons 
ADD COLUMN attendance_keyword TEXT;