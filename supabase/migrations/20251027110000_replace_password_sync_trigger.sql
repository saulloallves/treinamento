-- Remove o gatilho antigo da tabela auth.users, se ele existir.
DROP TRIGGER IF EXISTS on_auth_user_update ON auth.users;

-- Remove a função antiga, se ela existir.
DROP FUNCTION IF EXISTS public.handle_password_sync();

-- Cria a nova função aprimorada que centraliza toda a lógica.
CREATE OR REPLACE FUNCTION public.handle_new_user_sync()
RETURNS TRIGGER AS $$
DECLARE
  user_meta JSONB;
  user_cpf TEXT;
  user_password TEXT;
  user_role TEXT;
  v_approval_status treinamento.approval_status;
  v_phone TEXT; -- Variável para o telefone limpo
  franchisee_record RECORD;
BEGIN
  -- Extrai os metadados brutos do novo usuário.
  user_meta := NEW.raw_user_meta_data;
  user_cpf := user_meta->>'cpf';
  user_password := user_meta->>'password';
  user_role := user_meta->>'role';
  -- Limpa o número de telefone, removendo quaisquer caracteres não numéricos.
  v_phone := regexp_replace(user_meta->>'phone', '\D', '', 'g');

  -- Define o status de aprovação com base na função do usuário.
  IF user_role = 'Colaborador' THEN
    v_approval_status := 'pendente';
  ELSE
    v_approval_status := 'aprovado';
  END IF;

  -- Verifica se é um franqueado com base no CPF para a lógica de senha.
  IF user_cpf IS NOT NULL THEN
    SELECT * INTO franchisee_record FROM public.franqueados WHERE cpf_rnm = user_cpf;
    IF FOUND AND franchisee_record.systems_password IS NOT NULL THEN
      user_password := franchisee_record.systems_password;
      -- Força a atualização da senha em auth.users.
      UPDATE auth.users
      SET encrypted_password = extensions.crypt(user_password, extensions.gen_salt('bf'))
      WHERE id = NEW.id;
    END IF;
  END IF;

  -- Realiza um UPSERT na tabela 'treinamento.users'.
  INSERT INTO treinamento.users (id, name, email, cpf, phone, user_type, role, position, unit_code, unit_codes, visible_password, approval_status, active)
  VALUES (
    NEW.id,
    user_meta->>'full_name',
    NEW.email,
    user_cpf,
    v_phone, -- Usa a variável com o telefone limpo.
    user_meta->>'user_type',
    (user_role)::treinamento.user_role_type,
    user_meta->>'position',
    user_meta->>'unit_code',
    ARRAY[user_meta->>'unit_code'],
    user_password,
    v_approval_status, -- Usa a variável de status correta.
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    cpf = EXCLUDED.cpf,
    phone = EXCLUDED.phone,
    user_type = EXCLUDED.user_type,
    role = EXCLUDED.role,
    position = EXCLUDED.position,
    unit_code = EXCLUDED.unit_code,
    unit_codes = EXCLUDED.unit_codes,
    visible_password = EXCLUDED.visible_password,
    approval_status = EXCLUDED.approval_status;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria o novo gatilho que aciona a função APENAS na criação de um novo usuário.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_sync();
