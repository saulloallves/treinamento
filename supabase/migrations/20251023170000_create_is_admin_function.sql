CREATE OR REPLACE FUNCTION treinamento.is_admin()
RETURNS boolean AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM treinamento.admin_users
    WHERE user_id = auth.uid() AND status = 'approved' AND active = true
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
