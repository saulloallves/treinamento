-- Seed seguro de admin: promove o primeiro usuário autenticado a admin se não houver nenhum admin ativo
CREATE OR REPLACE FUNCTION public.ensure_admin_bootstrap()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
  v_uid uuid;
  v_email text;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.admin_users WHERE active = true;
  IF v_count > 0 THEN
    RETURN; -- já existe admin ativo
  END IF;

  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN; -- sem usuário autenticado
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

  -- insere admin inicial
  INSERT INTO public.admin_users (user_id, email, name, role, active)
  VALUES (v_uid, COALESCE(v_email, 'unknown'), COALESCE(v_email, 'Admin Inicial'), 'admin', true)
  ON CONFLICT DO NOTHING;
END;
$$;