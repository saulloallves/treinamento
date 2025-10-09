-- Criar função para sincronizar senha quando visible_password for alterada
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

  -- Fazer chamada HTTP para o edge function sync-password
  -- Usando a função http do PostgreSQL (se disponível) ou registrar para processamento
  -- Por ora, vamos apenas logar que precisa sincronizar
  RAISE NOTICE 'Senha alterada para usuário %: %', NEW.id, new_password;
  
  -- Inserir na tabela de log para processamento posterior se necessário
  INSERT INTO public.password_sync_queue (user_id, new_password, status, created_at)
  VALUES (NEW.id, new_password, 'pending', now())
  ON CONFLICT (user_id) DO UPDATE 
  SET new_password = EXCLUDED.new_password, 
      status = 'pending', 
      created_at = now();

  RETURN NEW;
END;
$$;

-- Criar tabela para fila de sincronização de senhas
CREATE TABLE IF NOT EXISTS public.password_sync_queue (
  user_id UUID PRIMARY KEY,
  new_password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.password_sync_queue ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver a fila de sincronização
CREATE POLICY "Only admins can manage password sync queue" 
ON public.password_sync_queue 
FOR ALL 
USING (is_admin(auth.uid()));

-- Criar trigger para monitorar mudanças na coluna visible_password
DROP TRIGGER IF EXISTS trigger_sync_password_on_change ON public.users;
CREATE TRIGGER trigger_sync_password_on_change
  AFTER INSERT OR UPDATE OF visible_password ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_password_on_change();