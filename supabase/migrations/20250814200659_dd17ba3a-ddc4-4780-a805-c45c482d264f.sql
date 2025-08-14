-- Criar registro admin pendente para Mel
INSERT INTO admin_users (user_id, name, email, role, status, active) 
VALUES ('278b428b-9b07-40f7-9746-09994232fe37', 'Mel Rodrigues de Assis', 'mel.rodrigues@crescieperdi.com.br', 'admin', 'pending', true)
ON CONFLICT (user_id) DO NOTHING;