-- Secure enrollments visibility without breaking current flows
-- 1) Add a user_id column to map enrollments to authenticated students (optional usage by the app)
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2) Remove overly permissive public read policy
DROP POLICY IF EXISTS "Users can view all enrollments" ON public.enrollments;

-- 3) Replace with least-privilege, role-aware SELECT policies
-- Admins can view everything
CREATE POLICY "Admins can view all enrollments"
ON public.enrollments
FOR SELECT
USING (is_admin(auth.uid()));

-- Creators (staff) can view the enrollments they created
CREATE POLICY "Creators can view their created enrollments"
ON public.enrollments
FOR SELECT
USING (created_by = auth.uid());

-- Students can view their own enrollments when linked to their user account
CREATE POLICY "Students can view their own enrollments"
ON public.enrollments
FOR SELECT
USING (user_id = auth.uid());
