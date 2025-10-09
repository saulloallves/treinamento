-- Add status field to quiz table to manage active/draft state
ALTER TABLE public.quiz 
ADD COLUMN status text NOT NULL DEFAULT 'rascunho';

-- Create a check constraint to ensure valid status values
ALTER TABLE public.quiz 
ADD CONSTRAINT quiz_status_check 
CHECK (status IN ('rascunho', 'ativo', 'inativo'));