-- Criar enum para tipo de usuário
CREATE TYPE user_role_type AS ENUM ('Franqueado', 'Colaborador');

-- Criar enum para status de aprovação
CREATE TYPE approval_status AS ENUM ('pendente', 'aprovado', 'rejeitado');

-- Adicionar colunas na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role user_role_type,
ADD COLUMN IF NOT EXISTS position text,
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'aprovado',
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Criar tabela para notificações de aprovação
CREATE TABLE IF NOT EXISTS public.collaboration_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  franchisee_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  unit_code text NOT NULL,
  status approval_status DEFAULT 'pendente',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  notification_sent boolean DEFAULT false,
  approval_token uuid DEFAULT gen_random_uuid()
);

-- Enable RLS
ALTER TABLE public.collaboration_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies for collaboration_approvals
CREATE POLICY "Admins can manage collaboration approvals"
ON public.collaboration_approvals
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own approval requests"
ON public.collaboration_approvals
FOR SELECT
USING (collaborator_id = auth.uid() OR franchisee_id = auth.uid());

-- Função para encontrar franqueado da unidade
CREATE OR REPLACE FUNCTION public.find_franchisee_by_unit_code(_unit_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  franchisee_id uuid;
BEGIN
  SELECT id INTO franchisee_id
  FROM public.users
  WHERE unit_code = _unit_code 
    AND role = 'Franqueado'
    AND active = true
  LIMIT 1;
  
  RETURN franchisee_id;
END;
$$;

-- Função para processar aprovação de colaborador
CREATE OR REPLACE FUNCTION public.approve_collaborator(_approval_id uuid, _approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  approval_record record;
  new_status approval_status;
BEGIN
  -- Buscar o registro de aprovação
  SELECT * INTO approval_record 
  FROM public.collaboration_approvals 
  WHERE id = _approval_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval record not found';
  END IF;
  
  -- Verificar se o usuário atual é o franqueado responsável ou admin
  IF NOT (approval_record.franchisee_id = auth.uid() OR is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied. Only the franchisee or admin can approve';
  END IF;
  
  -- Definir novo status
  new_status := CASE WHEN _approve THEN 'aprovado'::approval_status ELSE 'rejeitado'::approval_status END;
  
  -- Atualizar status na tabela collaboration_approvals
  UPDATE public.collaboration_approvals
  SET status = new_status, updated_at = now()
  WHERE id = _approval_id;
  
  -- Atualizar status do colaborador na tabela users
  UPDATE public.users
  SET 
    approval_status = new_status,
    approved_by = CASE WHEN _approve THEN auth.uid() ELSE NULL END,
    approved_at = CASE WHEN _approve THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = approval_record.collaborator_id;
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_collaboration_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collaboration_approvals_updated_at
  BEFORE UPDATE ON public.collaboration_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_collaboration_approvals_updated_at();