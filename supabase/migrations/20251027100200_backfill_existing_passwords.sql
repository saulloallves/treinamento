-- Este script de backfill atualiza as senhas dos usuários existentes.
-- AVISO: As senhas de usuários não-franqueados serão redefinidas para 'Trocar01'.

DO $$
DECLARE
  -- Declara uma variável para iterar sobre cada usuário.
  user_record RECORD;
  -- Declara uma variável para armazenar o registro do franqueado, se encontrado.
  franchisee_record RECORD;
BEGIN
  -- Itera sobre cada usuário na tabela 'treinamento.users'.
  FOR user_record IN SELECT * FROM treinamento.users LOOP
    -- Tenta encontrar um franqueado correspondente com base no CPF do usuário.
    SELECT * INTO franchisee_record FROM public.franqueados WHERE cpf_rnm = user_record.cpf;

    -- SE um franqueado for encontrado E ele tiver uma 'systems_password' definida...
    IF FOUND AND franchisee_record.systems_password IS NOT NULL THEN
      -- Atualiza a senha em 'auth.users' para a 'systems_password'.
      UPDATE auth.users
      SET encrypted_password = extensions.crypt(franchisee_record.systems_password, extensions.gen_salt('bf'))
      WHERE id = user_record.id;

      -- Atualiza a 'visible_password' em 'treinamento.users' para a 'systems_password'.
      UPDATE treinamento.users
      SET visible_password = franchisee_record.systems_password
      WHERE id = user_record.id;
    ELSE
      -- SENÃO (se não for um franqueado ou não tiver 'systems_password')...
      -- Redefine a senha em 'auth.users' para o valor padrão 'Trocar01'.
      UPDATE auth.users
      SET encrypted_password = extensions.crypt('Trocar01', extensions.gen_salt('bf'))
      WHERE id = user_record.id;

      -- Atualiza a 'visible_password' em 'treinamento.users' para 'Trocar01'.
      UPDATE treinamento.users
      SET visible_password = 'Trocar01'
      WHERE id = user_record.id;
    END IF;
  END LOOP;
END $$;
