-- Fix sync_password_on_change function to remove net.http_post dependency
-- Since password is already set correctly in edge functions, we don't need the HTTP call

CREATE OR REPLACE FUNCTION public.sync_password_on_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_password text;
  new_password text;
BEGIN
  -- Verificar se houve mudança na visible_password
  IF TG_OP = 'UPDATE' THEN
    old_password := COALESCE(OLD.visible_password, '');
    new_password := COALESCE(NEW.visible_password, '');
    
    -- Se a senha não mudou, não fazer nada
    IF old_password = new_password THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Se é INSERT ou UPDATE com mudança de senha
  new_password := COALESCE(NEW.visible_password, '');
  
  -- Validar se a nova senha tem pelo menos 6 caracteres
  IF LENGTH(new_password) < 6 THEN
    RAISE EXCEPTION 'A senha deve ter pelo menos 6 caracteres';
  END IF;

  -- Password sync is now handled by edge functions during user creation/update
  -- No need for HTTP calls here
  RAISE NOTICE 'Password updated for user %', NEW.id;

  RETURN NEW;
END;
$$;