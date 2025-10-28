-- Cria a função que será executada pelo gatilho.
CREATE OR REPLACE FUNCTION public.handle_admin_user_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se o 'user_type' do novo usuário é 'Admin'.
  IF NEW.user_type = 'Admin' THEN
    -- Insere um registro correspondente na tabela 'admin_users'.
    INSERT INTO treinamento.admin_users (user_id, name, email, role, status, active)
    VALUES (NEW.id, NEW.name, NEW.email, 'admin', 'approved', true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria o gatilho que aciona a função após a inserção de um novo usuário.
CREATE TRIGGER on_user_insert_sync_admin
  AFTER INSERT ON treinamento.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user_sync();
