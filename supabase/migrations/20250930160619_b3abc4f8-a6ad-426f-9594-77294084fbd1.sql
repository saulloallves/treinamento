-- Remove HTTP calls from approve_collaborator function
CREATE OR REPLACE FUNCTION public.approve_collaborator(_approval_id uuid, _approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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