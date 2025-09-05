
-- Permitir null em correct_answer para suportar perguntas dissertativas
ALTER TABLE public.quiz
  ALTER COLUMN correct_answer DROP NOT NULL;

-- Permitir null em is_correct para respostas de questões dissertativas
ALTER TABLE public.quiz_responses
  ALTER COLUMN is_correct DROP NOT NULL;
