CREATE OR REPLACE FUNCTION public.approve_collaborator(_approval_id uuid, _approve boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  approval_record record;
  new_status approval_status;
  is_authorized boolean := false;
BEGIN
  -- Buscar o registro de aprovação para obter o unit_code do colaborador
  SELECT * INTO approval_record 
  FROM public.collaboration_approvals 
  WHERE id = _approval_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval record not found';
  END IF;
  
  -- Verificar se o usuário atual é admin (tem acesso total)
  is_authorized := is_admin(auth.uid());

  -- Se não for admin, verificar se é um franqueado com permissão sobre a unidade
  IF NOT is_authorized THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role = 'Franqueado'
        AND (
          -- Verifica se o código da unidade do colaborador está na lista de unidades do franqueado
          approval_record.unit_code = ANY(unit_codes) OR
          -- Fallback para a coluna antiga para garantir compatibilidade
          approval_record.unit_code = unit_code
        )
    ) INTO is_authorized;
  END IF;
  
  -- Se não for autorizado, bloquear a operação
  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Access Denied. Only the franchisee or admin can approve';
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
$function$