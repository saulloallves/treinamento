-- Adicionar coluna status à tabela admin_users
ALTER TABLE public.admin_users 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Atualizar admins existentes e ativos para status 'approved'
UPDATE public.admin_users 
SET status = 'approved' 
WHERE active = true;

-- Modificar a função is_admin para verificar se o admin está aprovado
CREATE OR REPLACE FUNCTION public.is_admin(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  with me as (
    select u.id, u.email
    from auth.users u
    where u.id = _user
    limit 1
  )
  select exists (
    select 1
    from public.admin_users au
    cross join me
    where au.active = true
      and au.status = 'approved'
      and (
        au.user_id = _user
        or (
          au.email is not null
          and me.email is not null
          and lower(au.email) = lower(me.email)
        )
      )
  );
$function$;

-- Função para buscar admins pendentes de aprovação
CREATE OR REPLACE FUNCTION public.get_pending_admin_approvals()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  role text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    au.id,
    au.user_id,
    au.name,
    au.email,
    au.role,
    au.created_at
  FROM public.admin_users au
  WHERE au.status = 'pending'
    AND au.active = true
  ORDER BY au.created_at ASC;
$function$;

-- Função para aprovar um admin
CREATE OR REPLACE FUNCTION public.approve_admin_user(admin_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o usuário atual é admin aprovado
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin access required.';
  END IF;

  -- Atualizar status para approved
  UPDATE public.admin_users 
  SET status = 'approved', updated_at = now()
  WHERE id = admin_user_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin user not found or already processed.';
  END IF;
END;
$function$;

-- Função para rejeitar um admin
CREATE OR REPLACE FUNCTION public.reject_admin_user(admin_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o usuário atual é admin aprovado
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin access required.';
  END IF;

  -- Atualizar status para rejected e desativar
  UPDATE public.admin_users 
  SET status = 'rejected', active = false, updated_at = now()
  WHERE id = admin_user_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin user not found or already processed.';
  END IF;
END;
$function$;