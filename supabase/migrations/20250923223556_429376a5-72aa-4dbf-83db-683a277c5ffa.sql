-- Remover política muito permissiva atual
DROP POLICY IF EXISTS "Anyone can view quiz" ON public.quiz;

-- Criar políticas mais específicas para quiz
CREATE POLICY "Students can view quiz in their turmas" ON public.quiz
FOR SELECT USING (
  -- Estudantes podem ver quizzes das turmas onde estão inscritos
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid()
    AND e.turma_id = quiz.turma_id
  )
  OR
  -- Quizzes sem turma_id (gerais) podem ser vistos por qualquer estudante inscrito no curso
  (turma_id IS NULL AND EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid()
    AND e.course_id = quiz.course_id
  ))
);

-- Administradores e professores podem ver todos os quizzes
CREATE POLICY "Admins and professors can view all quiz" ON public.quiz
FOR SELECT USING (
  is_admin(auth.uid()) OR is_professor(auth.uid())
);

-- Administradores e professores podem gerenciar quizzes
CREATE POLICY "Admins and professors can manage quiz" ON public.quiz
FOR ALL USING (
  is_admin(auth.uid()) OR is_professor(auth.uid())
);