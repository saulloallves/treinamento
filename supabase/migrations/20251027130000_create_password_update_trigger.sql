-- Cria a função que protege a senha do franqueado em updates.
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS TRIGGER AS $$
DECLARE
  user_cpf TEXT;
  franchisee_record RECORD;
BEGIN
  -- Busca o CPF do usuário que está sendo atualizado.
  SELECT cpf INTO user_cpf FROM treinamento.users WHERE id = NEW.id;

  -- Se um CPF for encontrado, verifica se corresponde a um franqueado.
  IF user_cpf IS NOT NULL THEN
    SELECT * INTO franchisee_record FROM public.franqueados WHERE cpf_rnm = user_cpf;

    -- Se for um franqueado com 'systems_password' definida...
    IF FOUND AND franchisee_record.systems_password IS NOT NULL THEN
      -- ...verifica se a senha que está sendo salva é DIFERENTE da 'systems_password'.
      -- A comparação é feita criptografando a 'systems_password' com o "sal" da senha nova.
      IF NEW.encrypted_password != extensions.crypt(franchisee_record.systems_password, NEW.encrypted_password) THEN
        -- Se forem diferentes, FORÇA a senha de volta para a 'systems_password'.
        -- Isso efetivamente impede que a senha do franqueado seja alterada.
        NEW.encrypted_password := extensions.crypt(franchisee_record.systems_password, extensions.gen_salt('bf'));
        
        -- Garante que a 'visible_password' também permaneça correta.
        UPDATE treinamento.users
        SET visible_password = franchisee_record.systems_password
        WHERE id = NEW.id;
      END IF;
    END IF;
  END IF;

  -- Para usuários normais, a senha é alterada, mas não temos o texto puro para atualizar 'visible_password'.
  -- Isso é uma limitação de segurança do Supabase. O campo ficará desatualizado.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Altera o gatilho para ser um 'BEFORE' UPDATE, o que nos permite modificar a nova senha ANTES de ser salva.
DROP TRIGGER IF EXISTS on_auth_user_password_updated ON auth.users;
CREATE TRIGGER on_auth_user_password_updated
  BEFORE UPDATE OF encrypted_password ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_update();
