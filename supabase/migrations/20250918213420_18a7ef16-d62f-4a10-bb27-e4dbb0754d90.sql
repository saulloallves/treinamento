-- Fix critical security issue in enrollments table RLS policies
-- Remove overly permissive policies and implement proper access controls

-- Drop the problematic policies that allow too broad access
DROP POLICY IF EXISTS "Public access to enrollments by unit_code" ON public.enrollments;
DROP POLICY IF EXISTS "Authenticated users can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Creators can view their created enrollments" ON public.enrollments;

-- Create more secure policies

-- 1. Admins can still view all enrollments (existing policy is fine)
-- Policy "Admins can view all enrollments" already exists and is appropriate

-- 2. Students can only view their own enrollments (existing policy is fine)  
-- Policy "Students can view their own enrollments" already exists and is appropriate

-- 3. Professors can view enrollments for turmas they are responsible for
CREATE POLICY "Professors can view enrollments in their turmas" 
ON public.enrollments 
FOR SELECT 
USING (
  is_professor(auth.uid()) AND 
  EXISTS (
    SELECT 1 FROM public.turmas t 
    WHERE t.id = enrollments.turma_id 
    AND t.responsavel_user_id = auth.uid()
  )
);

-- 4. Allow franchise owners to view enrollments in their unit only (more restricted than before)
CREATE POLICY "Franchisees can view enrollments in their unit" 
ON public.enrollments 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  unit_code IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.unit_code = enrollments.unit_code 
    AND u.role = 'Franqueado'
    AND u.active = true
  )
);

-- 5. More restrictive creation policy - users can only create enrollments for their own unit
DROP POLICY IF EXISTS "Authenticated users can create enrollments" ON public.enrollments;
CREATE POLICY "Users can create enrollments for their unit" 
ON public.enrollments 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (
    is_admin(auth.uid()) OR 
    is_professor(auth.uid()) OR
    (
      unit_code IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.unit_code = enrollments.unit_code 
        AND u.active = true
      )
    )
  )
);

-- 6. More restrictive update policy - only admins, professors of the turma, or franchise owners of the unit
DROP POLICY IF EXISTS "Users can update enrollments" ON public.enrollments;
CREATE POLICY "Authorized users can update enrollments" 
ON public.enrollments 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR
  (
    is_professor(auth.uid()) AND 
    EXISTS (
      SELECT 1 FROM public.turmas t 
      WHERE t.id = enrollments.turma_id 
      AND t.responsavel_user_id = auth.uid()
    )
  ) OR
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

-- 7. More restrictive delete policy - only admins or professors of the turma
DROP POLICY IF EXISTS "Users can delete enrollments" ON public.enrollments;
CREATE POLICY "Authorized users can delete enrollments" 
ON public.enrollments 
FOR DELETE 
USING (
  is_admin(auth.uid()) OR
  (
    is_professor(auth.uid()) AND 
    EXISTS (
      SELECT 1 FROM public.turmas t 
      WHERE t.id = enrollments.turma_id 
      AND t.responsavel_user_id = auth.uid()
    )
  )
);