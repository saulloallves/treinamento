-- URGENT FIX: Infinite recursion in RLS policies between turmas and enrollments tables
-- Create security definer functions to break circular dependencies

-- Function to check if user can access a specific turma
CREATE OR REPLACE FUNCTION public.user_can_access_turma(_user_id uuid, _turma_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    -- Admin access
    is_admin(_user_id) OR
    -- Professor responsible for the turma
    EXISTS (
      SELECT 1 FROM public.turmas t 
      WHERE t.id = _turma_id 
      AND t.responsavel_user_id = _user_id
    ) OR
    -- Student enrolled in the turma
    EXISTS (
      SELECT 1 FROM public.enrollments e 
      WHERE e.turma_id = _turma_id 
      AND e.user_id = _user_id
    );
$$;

-- Function to check if user can access enrollments for a turma
CREATE OR REPLACE FUNCTION public.user_can_access_turma_enrollments(_user_id uuid, _turma_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    -- Admin access
    is_admin(_user_id) OR
    -- Professor responsible for the turma
    EXISTS (
      SELECT 1 FROM public.turmas t 
      WHERE t.id = _turma_id 
      AND t.responsavel_user_id = _user_id
    );
$$;

-- Drop and recreate turmas policies to use security definer functions
DROP POLICY IF EXISTS "Students can view turmas they are enrolled in" ON public.turmas;

-- Recreate turmas policies without circular references
CREATE POLICY "Users can view accessible turmas" 
ON public.turmas 
FOR SELECT 
USING (
  public.user_can_access_turma(auth.uid(), id)
);

-- Drop and recreate problematic enrollments policies 
DROP POLICY IF EXISTS "Professors can view enrollments in their turmas" ON public.enrollments;

-- Recreate with security definer function
CREATE POLICY "Users can view turma enrollments with permission" 
ON public.enrollments 
FOR SELECT 
USING (
  -- Admin can see all
  is_admin(auth.uid()) OR
  -- User can see their own enrollments
  (user_id = auth.uid()) OR
  -- User has permission to access this turma's enrollments
  public.user_can_access_turma_enrollments(auth.uid(), turma_id) OR
  -- Franchisee can see enrollments in their unit
  (
    unit_code IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.unit_code = enrollments.unit_code 
      AND u.role = 'Franqueado'
      AND u.active = true
    )
  )
);