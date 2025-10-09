-- Broaden enrollments visibility: allow any authenticated user to view all enrollments
-- Safe re-creation to avoid duplicates
DROP POLICY IF EXISTS "Authenticated users can view all enrollments" ON public.enrollments;

CREATE POLICY "Authenticated users can view all enrollments"
ON public.enrollments
FOR SELECT
USING (auth.uid() IS NOT NULL);