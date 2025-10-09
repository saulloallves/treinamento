-- Reestruturação para trabalhar com turmas
-- 1. Tornar turma_id obrigatório em enrollments
ALTER TABLE public.enrollments 
ALTER COLUMN turma_id SET NOT NULL;

-- 2. Adicionar turma_id na tabela attendance se não existir
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id);

-- 3. Atualizar attendance existente para pegar turma_id da enrollment
UPDATE public.attendance 
SET turma_id = (
  SELECT e.turma_id 
  FROM public.enrollments e 
  WHERE e.id = attendance.enrollment_id
)
WHERE turma_id IS NULL;

-- 4. Tornar turma_id obrigatório em attendance após popular
ALTER TABLE public.attendance 
ALTER COLUMN turma_id SET NOT NULL;

-- 5. Adicionar turma_id na tabela certificates se não existir
ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id);

-- 6. Atualizar certificates existente para pegar turma_id da enrollment
UPDATE public.certificates 
SET turma_id = (
  SELECT e.turma_id 
  FROM public.enrollments e 
  WHERE e.id = certificates.enrollment_id
)
WHERE turma_id IS NULL;

-- 7. Tornar turma_id obrigatório em certificates após popular
ALTER TABLE public.certificates 
ALTER COLUMN turma_id SET NOT NULL;

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_enrollments_turma_id ON public.enrollments(turma_id);
CREATE INDEX IF NOT EXISTS idx_attendance_turma_id ON public.attendance(turma_id); 
CREATE INDEX IF NOT EXISTS idx_certificates_turma_id ON public.certificates(turma_id);

-- 9. Função para buscar progresso por turma
CREATE OR REPLACE FUNCTION public.get_student_progress_by_turma(p_user_id UUID, p_turma_id UUID)
RETURNS TABLE(
  lesson_id UUID,
  lesson_title TEXT,
  lesson_order INTEGER,
  status TEXT,
  completed_at TIMESTAMPTZ,
  watch_time_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.lesson_id,
    l.title as lesson_title,
    l.order_index as lesson_order,
    sp.status,
    sp.completed_at,
    sp.watch_time_minutes
  FROM public.student_progress sp
  JOIN public.enrollments e ON e.id = sp.enrollment_id
  JOIN public.lessons l ON l.id = sp.lesson_id
  WHERE e.user_id = p_user_id 
    AND e.turma_id = p_turma_id
  ORDER BY l.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;