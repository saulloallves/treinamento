-- Verificar e corrigir a função is_admin para ser mais restritiva
CREATE OR REPLACE FUNCTION public.is_admin(_user uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result boolean := false;
BEGIN
  -- Verificar se o usuário existe na tabela admin_users com status aprovado
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = _user
      AND au.active = true
      AND au.status = 'approved'
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Forçar recriação da função com a definição correta
DROP FUNCTION IF EXISTS public.is_admin(uuid);

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