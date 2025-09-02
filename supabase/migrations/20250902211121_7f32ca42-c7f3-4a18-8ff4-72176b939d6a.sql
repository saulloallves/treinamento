-- Fix foreign key constraint in student_progress to reference recorded_lessons instead of lessons

-- Step 1: Drop the existing foreign key constraint if it exists
ALTER TABLE public.student_progress 
DROP CONSTRAINT IF EXISTS student_progress_lesson_id_fkey;

-- Step 2: Add new foreign key constraint to reference recorded_lessons
ALTER TABLE public.student_progress 
ADD CONSTRAINT student_progress_lesson_id_fkey 
FOREIGN KEY (lesson_id) 
REFERENCES public.recorded_lessons(id) 
ON DELETE CASCADE;