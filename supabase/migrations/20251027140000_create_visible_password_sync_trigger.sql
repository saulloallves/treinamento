-- Cria a função que será executada pelo gatilho de UPDATE.
CREATE OR REPLACE FUNCTION public.sync_visible_password_to_auth()
RETURNS TRIGGER AS $$
DECLARE
  franchisee_record RECORD;
BEGIN
  -- Busca o registro do franqueado correspondente, se existir.
  SELECT * INTO franchisee_record
  FROM public.franqueados f
  WHERE f.cpf_rnm = NEW.cpf;

  -- Se for um franqueado com 'systems_password' definida...
  IF FOUND AND franchisee_record.systems_password IS NOT NULL THEN
    -- ...e se a senha que está sendo salva for DIFERENTE da 'systems_password'...
    IF NEW.visible_password IS DISTINCT FROM franchisee_record.systems_password THEN
      -- ...então REVERTE a alteração, sobrescrevendo o novo valor com a senha correta ANTES de salvar.
      NEW.visible_password := franchisee_record.systems_password;
    END IF;
    -- A senha em auth.users não é alterada, pois a do franqueado é imutável.
  ELSE
    -- Para usuários normais, atualiza a senha em 'auth.users' com o novo valor de 'visible_password'.
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(NEW.visible_password, extensions.gen_salt('bf'))
    WHERE id = NEW.id;
  END IF;

  -- Retorna o registro (modificado ou não) para ser salvo no banco.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Altera o gatilho para ser um 'BEFORE' UPDATE, permitindo a validação e reversão ANTES de salvar.
DROP TRIGGER IF EXISTS on_visible_password_update ON treinamento.users;
CREATE TRIGGER on_visible_password_update
  BEFORE UPDATE OF visible_password ON treinamento.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_visible_password_to_auth();
