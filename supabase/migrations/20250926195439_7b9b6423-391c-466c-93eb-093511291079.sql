-- ⚠️ ATENÇÃO: Esta migração adiciona uma coluna para armazenar senhas em texto plano
-- Isso representa um SÉRIO RISCO DE SEGURANÇA e não é recomendado
-- Use apenas em ambientes controlados e com extrema cautela

-- Adicionar coluna para armazenar senha visível na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS visible_password TEXT;

-- Comentário explicativo sobre o risco
COMMENT ON COLUMN public.users.visible_password IS 'ATENÇÃO: Senhas em texto plano - RISCO DE SEGURANÇA ALTO';

-- Criar função para sincronizar senha quando usuário é criado/atualizado
CREATE OR REPLACE FUNCTION public.sync_user_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Esta função será chamada via edge function quando senha for definida
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar política RLS para que apenas admins vejam as senhas
CREATE POLICY "Only admins can view passwords" 
ON public.users 
FOR SELECT 
USING (is_admin(auth.uid()) AND visible_password IS NOT NULL);