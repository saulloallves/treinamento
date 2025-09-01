-- Correção definitiva para o login do Alison
-- Primeiro vamos resetar e sincronizar tudo

-- Atualizar na tabela users para garantir que está tudo correto
UPDATE public.users 
SET 
  name = 'Alison Martins',
  email = 'alison.martins@crescieperdi.com.br',
  role = 'Franqueado',
  unit_code = '9999',
  approval_status = 'aprovado',
  active = true,
  user_type = 'Aluno',
  updated_at = now()
WHERE email = 'alison.martins@crescieperdi.com.br';