-- Adicionar Professor ao enum user_role_type
ALTER TYPE public.user_role_type ADD VALUE 'Professor';

-- Criar função helper para verificar se usuário é professor
CREATE OR REPLACE FUNCTION public.is_professor(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = _user
      AND u.user_type = 'Professor'
      AND u.active = true
  );
$$;