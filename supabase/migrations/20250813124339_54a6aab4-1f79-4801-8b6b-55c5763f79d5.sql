-- Adicionar coluna lesson_id na tabela quiz
ALTER TABLE public.quiz ADD COLUMN lesson_id uuid REFERENCES public.lessons(id);