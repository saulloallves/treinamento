-- Fix critical security issue in enrollments table RLS policies
-- Remove only the problematic overly permissive policies

-- Remove the most dangerous policies that expose student data
DROP POLICY IF EXISTS "Public access to enrollments by unit_code" ON public.enrollments;
DROP POLICY IF EXISTS "Authenticated users can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Creators can view their created enrollments" ON public.enrollments;

-- Remove overly permissive modification policies
DROP POLICY IF EXISTS "Users can update enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can delete enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Authenticated users can create enrollments" ON public.enrollments;

-- Create more secure policies only if they don't already exist

-- Secure policy for professors to view enrollments only in their turmas
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'enrollments' 
        AND policyname = 'Professors can view enrollments in their turmas'
    ) THEN
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
    END IF;
END $$;

-- Secure policy for franchisees (more restricted than before)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'enrollments' 
        AND policyname = 'Franchisees can view enrollments in their unit'
    ) THEN
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
    END IF;
END $$;

-- Secure creation policy
CREATE POLICY "Secure enrollment creation" 
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

-- Secure update policy  
CREATE POLICY "Secure enrollment updates" 
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

-- Secure delete policy
CREATE POLICY "Secure enrollment deletions" 
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