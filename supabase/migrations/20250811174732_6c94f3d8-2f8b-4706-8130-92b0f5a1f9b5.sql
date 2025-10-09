-- Harden RLS on admin_users: only admins can read/manage
-- Ensure RLS is enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop permissive policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

-- Create strict policies
CREATE POLICY "Only admins can select admin_users"
ON public.admin_users
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage admin_users"
ON public.admin_users
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
