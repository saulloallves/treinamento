-- Add quiz_name column to organize questions in groups
ALTER TABLE public.quiz 
ADD COLUMN quiz_name TEXT;

-- Add index for better performance when filtering by quiz_name
CREATE INDEX idx_quiz_quiz_name ON public.quiz(quiz_name);

-- Update existing questions to have a default quiz name based on lesson
UPDATE public.quiz 
SET quiz_name = COALESCE(
  (SELECT lessons.title FROM public.lessons WHERE lessons.id = quiz.lesson_id),
  'Quiz sem nome'
) || ' - Quiz'
WHERE quiz_name IS NULL;