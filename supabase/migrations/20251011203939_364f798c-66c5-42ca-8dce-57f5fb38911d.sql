-- Drop existing function
DROP FUNCTION IF EXISTS public.approve_collaborator(uuid, boolean);

-- Create improved function that adds collaborator to WhatsApp group
CREATE OR REPLACE FUNCTION public.approve_collaborator(_approval_id uuid, _approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  approval_record record;
  new_status approval_status;
  is_authorized boolean := false;
  v_unit_code text;
  v_phone text;
  v_name text;
  v_group_id text;
  v_grupo_nome text;
BEGIN
  -- Buscar o registro de aprovação
  SELECT * INTO approval_record 
  FROM public.collaboration_approvals 
  WHERE id = _approval_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval record not found';
  END IF;
  
  -- Verificar autorização (admin ou franqueado da unidade)
  is_authorized := is_admin(auth.uid());

  IF NOT is_authorized THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role = 'Franqueado'
        AND (
          approval_record.unit_code = ANY(unit_codes) OR
          approval_record.unit_code = unit_code
        )
    ) INTO is_authorized;
  END IF;
  
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
  
  -- Se aprovado, adicionar ao grupo do WhatsApp
  IF _approve THEN
    -- Buscar dados do colaborador e da unidade
    SELECT u.unit_code, u.phone, u.name, un.grupo_colaborador, un.grupo
    INTO v_unit_code, v_phone, v_name, v_group_id, v_grupo_nome
    FROM public.users u
    LEFT JOIN public.unidades un ON un.codigo_grupo::text = u.unit_code
    WHERE u.id = approval_record.collaborator_id;
    
    -- Log dos dados encontrados
    RAISE NOTICE 'Colaborador aprovado - Dados: unit_code=%, phone=%, name=%, group_id=%, grupo_nome=%', 
      v_unit_code, v_phone, v_name, v_group_id, v_grupo_nome;
    
    -- Se tem telefone e unit_code válido
    IF v_phone IS NOT NULL AND v_phone != '' AND v_unit_code IS NOT NULL THEN
      -- Se grupo não existe, inserir requisição para criar (será processado por trigger ou job)
      IF v_group_id IS NULL OR v_group_id = '' THEN
        RAISE NOTICE 'Grupo não existe para unidade %. Requisição de criação será necessária.', v_unit_code;
        -- Nota: O grupo deve ser criado via edge function create-collaborator-group
        -- que será chamado pela aplicação quando detectar grupo inexistente
      ELSE
        -- Grupo existe, inserir requisição para adicionar colaborador
        RAISE NOTICE 'Adicionando colaborador ao grupo existente: %', v_group_id;
        -- Nota: A aplicação deve chamar add-collaborator-to-group edge function
        -- com os dados: groupId=v_group_id, phone=v_phone, name=v_name
      END IF;
    ELSE
      RAISE NOTICE 'Telefone ou unit_code ausente. Não é possível adicionar ao grupo WhatsApp.';
    END IF;
  END IF;
END;
$$;