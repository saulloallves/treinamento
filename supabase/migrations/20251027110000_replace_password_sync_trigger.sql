-- Remove o gatilho antigo da tabela auth.users, se ele existir.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove a função antiga, se ela existir.
DROP FUNCTION IF EXISTS public.handle_password_sync();

-- Cria a nova função que sincroniza dados, mas ignora Admins.
CREATE OR REPLACE FUNCTION public.handle_new_user_sync()
RETURNS TRIGGER AS $$
DECLARE
  user_meta JSONB;
  user_type_text TEXT;
  user_role TEXT;
  v_approval_status treinamento.approval_status;
BEGIN
  -- Extrai os metadados brutos do novo usuário.
  user_meta := NEW.raw_user_meta_data;
  user_type_text := user_meta->>'user_type';

  -- CONDIÇÃO PRINCIPAL: Se o tipo de usuário for 'Admin' ou 'Professor', não faz nada.
  -- Isso permite que as Edge Functions gerenciem a criação de forma autônoma.
  IF user_type_text <> 'Admin' AND user_type_text <> 'Professor' THEN
    user_role := user_meta->>'role';

    -- Define o status de aprovação com base na role.
    IF user_role = 'Colaborador' THEN
      v_approval_status := 'pendente';
    ELSE
      v_approval_status := 'aprovado';
    END IF;

    -- Realiza um UPSERT na tabela 'treinamento.users' com os dados dos metadados.
    INSERT INTO treinamento.users (id, name, email, cpf, phone, user_type, role, position, unit_code, unit_codes, visible_password, approval_status, active)
    VALUES (
      NEW.id,
      user_meta->>'full_name',
      NEW.email,
      user_meta->>'cpf',
      regexp_replace(user_meta->>'phone', '\D', '', 'g'),
      user_meta->>'user_type',
      (user_role)::treinamento.user_role_type,
      user_meta->>'position',
      user_meta->>'unit_code',
      ARRAY[user_meta->>'unit_code'],
      user_meta->>'password',
      v_approval_status,
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria o novo gatilho que aciona a função APENAS na criação de um novo usuário.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_sync();
