-- Add question_type column to test_questions table
ALTER TABLE public.test_questions 
ADD COLUMN question_type text NOT NULL DEFAULT 'multiple_choice';

-- Add check constraint for valid question types
ALTER TABLE public.test_questions 
ADD CONSTRAINT question_type_check CHECK (question_type IN ('multiple_choice', 'essay'));

-- Add max_score column for essay questions
ALTER TABLE public.test_questions 
ADD COLUMN max_score integer DEFAULT NULL;