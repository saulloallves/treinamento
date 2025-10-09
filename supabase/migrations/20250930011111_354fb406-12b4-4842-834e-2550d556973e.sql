-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS sync_password_trigger ON public.users;

-- Recriar função de sincronização simplificada e direta
CREATE OR REPLACE FUNCTION public.sync_password_on_change()
RETURNS TRIGGER 
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

  -- Fazer chamada HTTP síncrona para o edge function
  PERFORM net.http_post(
    url := 'https://tctkacgbhqvkqovctrzf.supabase.co/functions/v1/sync-password',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGthY2diaHF2a3FvdmN0cnpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5MTE2MywiZXhwIjoyMDcwMDY3MTYzfQ.vY8o9P3xH7dLx_UQ9_pW8gQY4sZKGGvF0vZnGE-LYYI'
    ),
    body := jsonb_build_object(
      'user_id', NEW.id::text,
      'new_password', new_password
    )
  );
  
  RAISE NOTICE 'Senha sincronizada para usuário %', NEW.id;

  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER sync_password_trigger
  BEFORE INSERT OR UPDATE OF visible_password ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_password_on_change();