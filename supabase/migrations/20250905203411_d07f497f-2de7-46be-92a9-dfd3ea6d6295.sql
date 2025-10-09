-- Update lessons_count for all courses to reflect correct lesson counts
-- For live courses (ao_vivo), count from lessons table
UPDATE public.courses 
SET lessons_count = (
  SELECT COUNT(*) 
  FROM public.lessons 
  WHERE course_id = courses.id 
    AND status = 'Ativo'
)
WHERE tipo = 'ao_vivo';

-- For recorded courses (gravado), count from recorded_lessons table  
UPDATE public.courses 
SET lessons_count = (
  SELECT COUNT(*) 
  FROM public.recorded_lessons 
  WHERE course_id = courses.id 
    AND status = 'Ativo'
)
WHERE tipo = 'gravado';