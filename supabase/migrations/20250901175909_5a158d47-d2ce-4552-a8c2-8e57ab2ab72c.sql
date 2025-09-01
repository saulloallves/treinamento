-- Permitir que Admins visualizem todas as aprovações de colaboradores
CREATE POLICY "Admins can view all collaboration approvals"
  ON public.collaboration_approvals
  FOR SELECT
  USING (is_admin(auth.uid()));