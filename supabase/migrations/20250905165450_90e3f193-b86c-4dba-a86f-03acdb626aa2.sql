-- Fix critical security vulnerability in enrollments table
-- Remove overly permissive RLS policies that expose student personal data

-- Drop the dangerous public access policy
DROP POLICY IF EXISTS "Public access to enrollments by unit_code" ON public.enrollments;

-- Drop the overly broad authenticated users policy  
DROP POLICY IF EXISTS "Authenticated users can view all enrollments" ON public.enrollments;

-- Create secure, restrictive policies
-- 1. Students can only view their own enrollments
CREATE POLICY "Students can view own enrollments only" 
ON public.enrollments 
FOR SELECT 
USING (user_id = auth.uid());

-- 2. Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments" 
ON public.enrollments 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 3. Professors can view enrollments for courses/turmas they are responsible for
CREATE POLICY "Professors can view their course enrollments" 
ON public.enrollments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.turmas t 
    WHERE t.id = enrollments.turma_id 
    AND t.responsavel_user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = enrollments.course_id 
    AND c.created_by = auth.uid()
  )
);

-- 4. Users can view enrollments they created (for enrollment management)
CREATE POLICY "Creators can view enrollments they created" 
ON public.enrollments 
FOR SELECT 
USING (created_by = auth.uid());

-- 5. Secure INSERT policy - only authenticated users can create enrollments
CREATE POLICY "Authenticated users can create enrollments" 
ON public.enrollments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Secure UPDATE policy - only admins, creators, or professors can update
CREATE POLICY "Authorized users can update enrollments" 
ON public.enrollments 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.turmas t 
    WHERE t.id = enrollments.turma_id 
    AND t.responsavel_user_id = auth.uid()
  )
);

-- 7. Secure DELETE policy - only admins and creators can delete
CREATE POLICY "Authorized users can delete enrollments" 
ON public.enrollments 
FOR DELETE 
USING (
  is_admin(auth.uid()) OR 
  created_by = auth.uid()
);