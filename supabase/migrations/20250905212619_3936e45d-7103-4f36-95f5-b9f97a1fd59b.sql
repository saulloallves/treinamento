-- Create professor turma permissions table
CREATE TABLE public.professor_turma_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_manage_students BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(professor_id, turma_id)
);

-- Enable RLS
ALTER TABLE public.professor_turma_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage professor turma permissions"
ON public.professor_turma_permissions
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Professors can view their own turma permissions"
ON public.professor_turma_permissions
FOR SELECT
USING (professor_id = auth.uid());

-- Create function to check professor turma access
CREATE OR REPLACE FUNCTION public.has_professor_turma_access(
  _professor_id UUID,
  _turma_id UUID,
  _permission_type TEXT DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    CASE 
      WHEN _permission_type = 'edit' THEN 
        COALESCE((SELECT can_edit FROM professor_turma_permissions WHERE professor_id = _professor_id AND turma_id = _turma_id), false)
      WHEN _permission_type = 'manage_students' THEN 
        COALESCE((SELECT can_manage_students FROM professor_turma_permissions WHERE professor_id = _professor_id AND turma_id = _turma_id), false)
      ELSE 
        COALESCE((SELECT can_view FROM professor_turma_permissions WHERE professor_id = _professor_id AND turma_id = _turma_id), false)
    END;
$$;

-- Create function to get professor accessible turmas
CREATE OR REPLACE FUNCTION public.get_professor_accessible_turmas(_professor_id UUID)
RETURNS TABLE(
  turma_id UUID,
  turma_name TEXT,
  can_view BOOLEAN,
  can_edit BOOLEAN,
  can_manage_students BOOLEAN
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    ptp.turma_id,
    t.name as turma_name,
    ptp.can_view,
    ptp.can_edit,
    ptp.can_manage_students
  FROM professor_turma_permissions ptp
  JOIN turmas t ON t.id = ptp.turma_id
  WHERE ptp.professor_id = _professor_id
    AND ptp.can_view = true
  ORDER BY t.name;
$$;

-- Update timestamp trigger
CREATE TRIGGER update_professor_turma_permissions_updated_at
BEFORE UPDATE ON public.professor_turma_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();