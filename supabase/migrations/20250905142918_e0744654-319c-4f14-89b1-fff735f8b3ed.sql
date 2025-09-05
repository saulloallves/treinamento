-- Add turma_id column to quiz table to support turma-specific quizzes
ALTER TABLE public.quiz ADD COLUMN turma_id UUID REFERENCES public.turmas(id);

-- Create index for better performance when filtering by turma
CREATE INDEX idx_quiz_turma_id ON public.quiz(turma_id);

-- Add comment to explain the new column
COMMENT ON COLUMN public.quiz.turma_id IS 'Optional reference to a specific turma for turma-specific quizzes';