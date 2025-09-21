-- Add transformar_treinamento status to turmas table
ALTER TABLE public.turmas DROP CONSTRAINT IF EXISTS turmas_status_check;
ALTER TABLE public.turmas ADD CONSTRAINT turmas_status_check 
CHECK (status IN ('agendada', 'inscricoes_abertas', 'em_andamento', 'encerrada', 'transformar_treinamento'));