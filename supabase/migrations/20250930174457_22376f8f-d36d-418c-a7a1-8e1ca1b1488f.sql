-- Desativar todos os usuários exceto o Alison
-- Mantém histórico mas impede login
UPDATE public.users 
SET active = false, updated_at = now()
WHERE email != 'alison.martins@crescieperdi.com.br'
  AND active = true;

-- Limpar aprovações pendentes
UPDATE public.collaboration_approvals
SET status = 'rejeitado', updated_at = now()
WHERE collaborator_id NOT IN (
  SELECT id FROM public.users WHERE email = 'alison.martins@crescieperdi.com.br'
)
AND status = 'pendente';