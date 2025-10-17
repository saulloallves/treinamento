
-- Criar política para alunos visualizarem turmas com inscrições abertas
CREATE POLICY "Students can view available turmas for enrollment"
ON public.turmas
FOR SELECT
TO authenticated
USING (
  status IN ('agendada', 'em_andamento') AND
  (
    -- Permitir se não há restrição de janela de inscrição
    (enrollment_open_at IS NULL AND enrollment_close_at IS NULL) OR
    -- Ou se está dentro da janela de inscrições
    (
      (enrollment_open_at IS NULL OR enrollment_open_at <= now()) AND
      (enrollment_close_at IS NULL OR enrollment_close_at >= now())
    ) OR
    -- Admin sempre pode ver
    is_admin(auth.uid()) OR
    -- Professor responsável pode ver
    responsavel_user_id = auth.uid() OR
    -- Aluno já inscrito pode ver
    EXISTS (
      SELECT 1 FROM public.enrollments e 
      WHERE e.turma_id = turmas.id AND e.user_id = auth.uid()
    )
  )
);
