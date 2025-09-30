-- Modificar a função approve_collaborator para criar grupo de colaboradores automaticamente
CREATE OR REPLACE FUNCTION public.approve_collaborator(_approval_id uuid, _approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  approval_record record;
  new_status approval_status;
  v_unit_code text;
  v_grupo text;
  v_grupo_colaborador text;
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
  
  -- Se aprovado, verificar/criar grupo de colaboradores
  IF _approve THEN
    -- Buscar informações da unidade
    SELECT codigo_grupo::text, grupo, grupo_colaborador 
    INTO v_unit_code, v_grupo, v_grupo_colaborador
    FROM public.unidades
    WHERE codigo_grupo::text = approval_record.unit_code
    LIMIT 1;
    
    -- Se a unidade existe e ainda não tem grupo de colaboradores
    IF v_unit_code IS NOT NULL AND (v_grupo_colaborador IS NULL OR v_grupo_colaborador = '') THEN
      -- Invocar edge function para criar o grupo
      PERFORM net.http_post(
        url := 'https://tctkacgbhqvkqovctrzf.supabase.co/functions/v1/create-collaborator-group',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGthY2diaHF2a3FvdmN0cnpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5MTE2MywiZXhwIjoyMDcwMDY3MTYzfQ.vY8o9P3xH7dLx_UQ9_pW8gQY4sZKGGvF0vZnGE-LYYI'
        ),
        body := jsonb_build_object(
          'unit_code', v_unit_code,
          'grupo', v_grupo
        )
      );
      
      RAISE NOTICE 'Grupo de colaboradores criado para unidade %', v_unit_code;
    END IF;
  END IF;
END;
$$;