
-- Remover política antiga e criar nova corrigida
DROP POLICY IF EXISTS "Students can view available turmas for enrollment" ON public.turmas;

-- Criar nova política permitindo alunos verem turmas disponíveis
CREATE POLICY "Students can view available turmas for enrollment"
ON public.turmas
FOR SELECT
TO authenticated
USING (
  -- Admin sempre pode ver
  is_admin(auth.uid()) OR
  -- Professor responsável pode ver
  responsavel_user_id = auth.uid() OR
  -- Aluno já inscrito pode ver
  EXISTS (
    SELECT 1 FROM public.enrollments e 
    WHERE e.turma_id = turmas.id AND e.user_id = auth.uid()
  ) OR
  -- Turmas disponíveis para autoinscrição (agendadas ou em andamento)
  (
    status IN ('agendada', 'em_andamento')
  )
);
