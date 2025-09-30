-- Criar função segura para buscar email pelo telefone durante o login
CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  -- Buscar email do usuário ativo pelo telefone
  SELECT email INTO v_email
  FROM public.users
  WHERE phone = p_phone
    AND active = true
  LIMIT 1;
  
  RETURN v_email;
END;
$$;