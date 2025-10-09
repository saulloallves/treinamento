-- Criar o registro admin que não foi criado automaticamente
INSERT INTO public.admin_users (user_id, name, email, role, status, active)
VALUES (
  '01a8d8bf-8ead-4cce-a78d-3408abc7d821', 
  'Mel Rodrigues de Assis', 
  'mel.rodrigues@crescieperdi.com.br', 
  'admin', 
  'pending', 
  true
);