-- Atualizar função para sincronizar senha automaticamente
CREATE OR REPLACE FUNCTION public.sync_password_on_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_password text;
  new_password text;
  function_result record;
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

  -- Tentar sincronizar automaticamente usando net.http_post
  BEGIN
    -- Fazer chamada HTTP para o edge function sync-password
    SELECT * INTO function_result FROM net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/sync-password',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key')
      ),
      body := jsonb_build_object(
        'user_id', NEW.id,
        'new_password', new_password
      )
    );
    
    -- Log de sucesso
    RAISE NOTICE 'Senha sincronizada automaticamente para usuário %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Se falhar, adicionar na fila para processamento posterior
    RAISE NOTICE 'Falha na sincronização automática, adicionando à fila: %', SQLERRM;
    
    INSERT INTO public.password_sync_queue (user_id, new_password, status, created_at)
    VALUES (NEW.id, new_password, 'pending', now())
    ON CONFLICT (user_id) DO UPDATE 
    SET new_password = EXCLUDED.new_password, 
        status = 'pending', 
        created_at = now();
  END;

  RETURN NEW;
END;
$$;