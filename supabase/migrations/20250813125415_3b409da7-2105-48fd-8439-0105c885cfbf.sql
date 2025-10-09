-- Adicionar campo tipo de pergunta na tabela quiz
ALTER TABLE public.quiz ADD COLUMN question_type text NOT NULL DEFAULT 'multiple_choice';

-- Permitir tipos: 'multiple_choice' e 'essay'
ALTER TABLE public.quiz ADD CONSTRAINT quiz_question_type_check 
CHECK (question_type IN ('multiple_choice', 'essay'));

-- Para perguntas dissertativas, os campos de opções podem ser nulos
ALTER TABLE public.quiz ALTER COLUMN option_a DROP NOT NULL;
ALTER TABLE public.quiz ALTER COLUMN option_b DROP NOT NULL;