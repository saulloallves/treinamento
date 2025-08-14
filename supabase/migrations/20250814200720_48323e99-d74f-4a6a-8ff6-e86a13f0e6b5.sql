-- Recriar a função is_admin com CASCADE para remover dependências
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- Recriar a função is_admin com verificação rigorosa
CREATE OR REPLACE FUNCTION public.is_admin(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = _user
      AND au.active = true
      AND au.status = 'approved'
  );
$function$;

-- Recriar as políticas que dependiam da função is_admin
-- Política para admin_users
DROP POLICY IF EXISTS "Only admins can select admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can manage admin_users" ON public.admin_users;

CREATE POLICY "Only admins can select admin_users" 
ON public.admin_users 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage admin_users" 
ON public.admin_users 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Política para users
DROP POLICY IF EXISTS "Admins can manage users strictly" ON public.users;

CREATE POLICY "Admins can manage users strictly" 
ON public.users 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Política para enrollments
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;

CREATE POLICY "Admins can view all enrollments" 
ON public.enrollments 
FOR SELECT 
USING (is_admin(auth.uid()));