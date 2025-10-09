-- Clean up duplicate enrollments and add unique constraints to prevent future duplicates

-- Step 1: Create a temporary table to identify duplicates
CREATE TEMPORARY TABLE duplicate_enrollments AS
SELECT 
  user_id, 
  course_id, 
  COUNT(*) as count,
  ARRAY_AGG(id ORDER BY created_at ASC) as enrollment_ids
FROM public.enrollments 
WHERE user_id IS NOT NULL
GROUP BY user_id, course_id 
HAVING COUNT(*) > 1;

-- Step 2: For each set of duplicates, consolidate progress to the oldest enrollment
DO $$
DECLARE 
  dup_record RECORD;
  keep_id UUID;
  remove_ids UUID[];
BEGIN
  FOR dup_record IN SELECT * FROM duplicate_enrollments LOOP
    -- Keep the first (oldest) enrollment
    keep_id := dup_record.enrollment_ids[1];
    -- Mark others for removal
    remove_ids := dup_record.enrollment_ids[2:];
    
    -- Consolidate student_progress to the kept enrollment
    UPDATE public.student_progress 
    SET enrollment_id = keep_id 
    WHERE enrollment_id = ANY(remove_ids);
    
    -- Consolidate attendance to the kept enrollment  
    UPDATE public.attendance 
    SET enrollment_id = keep_id 
    WHERE enrollment_id = ANY(remove_ids);
    
    -- Consolidate certificates to the kept enrollment
    UPDATE public.certificates 
    SET enrollment_id = keep_id 
    WHERE enrollment_id = ANY(remove_ids);
    
    -- Remove duplicate enrollments
    DELETE FROM public.enrollments 
    WHERE id = ANY(remove_ids);
    
    RAISE NOTICE 'Consolidated enrollments for user % course %: kept %, removed %', 
      dup_record.user_id, dup_record.course_id, keep_id, remove_ids;
  END LOOP;
END $$;

-- Step 3: Add unique constraint to prevent future duplicates
-- First, add unique constraint on enrollments for user_id + course_id
ALTER TABLE public.enrollments 
ADD CONSTRAINT unique_user_course_enrollment 
UNIQUE (user_id, course_id);

-- Step 4: Add unique constraint on student_progress for enrollment_id + lesson_id
-- First check if there are duplicates in student_progress
CREATE TEMPORARY TABLE duplicate_progress AS
SELECT 
  enrollment_id, 
  lesson_id, 
  COUNT(*) as count,
  ARRAY_AGG(id ORDER BY updated_at DESC) as progress_ids
FROM public.student_progress 
GROUP BY enrollment_id, lesson_id 
HAVING COUNT(*) > 1;

-- Remove duplicate progress records, keeping the most recent
DO $$
DECLARE 
  dup_record RECORD;
  keep_id UUID;
  remove_ids UUID[];
BEGIN
  FOR dup_record IN SELECT * FROM duplicate_progress LOOP
    -- Keep the most recent progress record
    keep_id := dup_record.progress_ids[1];
    -- Mark others for removal
    remove_ids := dup_record.progress_ids[2:];
    
    -- Remove duplicate progress records
    DELETE FROM public.student_progress 
    WHERE id = ANY(remove_ids);
    
    RAISE NOTICE 'Cleaned duplicate progress for enrollment % lesson %: kept %, removed %', 
      dup_record.enrollment_id, dup_record.lesson_id, keep_id, remove_ids;
  END LOOP;
END $$;

-- Add unique constraint on student_progress
ALTER TABLE public.student_progress 
ADD CONSTRAINT unique_enrollment_lesson_progress 
UNIQUE (enrollment_id, lesson_id);

-- Step 5: Create index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_student_progress_enrollment_lesson 
ON public.student_progress (enrollment_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_course 
ON public.enrollments (user_id, course_id);

-- Step 6: Drop temporary tables
DROP TABLE IF EXISTS duplicate_enrollments;
DROP TABLE IF EXISTS duplicate_progress;