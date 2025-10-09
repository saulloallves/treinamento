-- Adicionar 'turma' ao tipo permitido no whatsapp_dispatches
ALTER TABLE public.whatsapp_dispatches 
DROP CONSTRAINT IF EXISTS whatsapp_dispatches_type_check;

ALTER TABLE public.whatsapp_dispatches 
ADD CONSTRAINT whatsapp_dispatches_type_check 
CHECK (type IN ('curso', 'aula', 'turma'));