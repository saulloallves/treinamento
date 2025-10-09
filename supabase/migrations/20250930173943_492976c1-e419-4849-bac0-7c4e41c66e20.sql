-- Desativar logins de alunos (exceto o Alison)
-- Mantém o histórico mas impede login
UPDATE public.users 
SET active = false, updated_at = now()
WHERE user_type = 'Aluno' 
  AND email != 'alison.martins@crescieperdi.com.br'
  AND active = true;

-- Remover aprovações de colaboradores pendentes (exceto Alison)
DELETE FROM public.collaboration_approvals
WHERE collaborator_id NOT IN (
  SELECT id FROM public.users WHERE email = 'alison.martins@crescieperdi.com.br'
)
AND status = 'pendente';

-- Atualizar o usuário Alison (aluno) para ter telefone
UPDATE public.users
SET 
  phone = '5511999999999',
  updated_at = now()
WHERE email = 'alison.martins@crescieperdi.com.br' 
  AND user_type = 'Aluno'
  AND (phone IS NULL OR phone = '');

-- Adicionar índice para melhorar performance de consultas por unit_codes
CREATE INDEX IF NOT EXISTS idx_users_unit_codes ON public.users USING GIN(unit_codes);

-- Adicionar índice para consultas por telefone
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone) WHERE phone IS NOT NULL;