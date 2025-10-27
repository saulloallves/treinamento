-- 1. Cria a função que será executada pelo gatilho.
CREATE OR REPLACE FUNCTION public.handle_password_sync()
RETURNS TRIGGER AS $$
DECLARE
  user_cpf TEXT;
  franchisee_record RECORD;
BEGIN
  -- Busca o CPF do usuário na tabela 'treinamento.users' usando o ID do usuário do gatilho.
  SELECT cpf INTO user_cpf FROM treinamento.users WHERE id = NEW.id;

  -- Se um CPF for encontrado, verifica se corresponde a um franqueado.
  IF user_cpf IS NOT NULL THEN
    SELECT * INTO franchisee_record FROM public.franqueados WHERE cpf_rnm = user_cpf;

    -- Se um registro de franqueado for encontrado e ele tiver uma 'systems_password'.
    IF FOUND AND franchisee_record.systems_password IS NOT NULL THEN
      -- Atualiza a senha na tabela 'auth.users' para a 'systems_password'.
      -- Isso garante que a senha do franqueado seja sempre a definida na tabela 'franqueados'.
      UPDATE auth.users
      SET encrypted_password = crypt(franchisee_record.systems_password, gen_salt('bf'))
      WHERE id = NEW.id;

      -- Atualiza a 'visible_password' na tabela 'treinamento.users' para refletir a 'systems_password'.
      UPDATE treinamento.users
      SET visible_password = franchisee_record.systems_password
      WHERE id = NEW.id;
      
      -- Interrompe a execução aqui, pois a lógica do franqueado foi aplicada.
      RETURN NEW;
    END IF;
  END IF;

  -- Fluxo normal para usuários não-franqueados ou franqueados sem 'systems_password'.
  -- A 'visible_password' será definida pela aplicação no momento da criação/atualização.
  -- O gatilho não precisa fazer nada neste caso, apenas permite que a operação continue.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Cria o gatilho na tabela 'auth.users'.
-- Este gatilho será acionado sempre que um usuário for criado (INSERT) ou atualizado (UPDATE).
CREATE TRIGGER on_auth_user_update
  AFTER INSERT OR UPDATE OF encrypted_password ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_password_sync();
