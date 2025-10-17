
-- Corrigir função can_user_access_course para verificar permissões específicas corretamente
CREATE OR REPLACE FUNCTION public.can_user_access_course(p_user_id uuid, p_course_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user RECORD;
  v_course RECORD;
  v_user_position TEXT;
  v_has_specific_rules BOOLEAN := false;
  v_has_access BOOLEAN := false;
BEGIN
  -- Buscar dados do usuário
  SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Buscar dados do curso
  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Professores e admins têm acesso total
  IF v_user.user_type = 'Professor' OR v_user.user_type = 'Admin' THEN
    RETURN true;
  END IF;
  
  -- Determinar posição do usuário
  IF v_user.user_type = 'Aluno' AND v_user.role = 'Franqueado' THEN
    -- Para franqueados, determinar pela fase da unidade
    v_user_position := public.get_franchisee_position(v_user.unit_code);
  ELSIF v_user.user_type = 'Aluno' AND v_user.role = 'Colaborador' THEN
    -- Para colaboradores, usar position mapeado para código
    v_user_position := CASE v_user.position
      WHEN 'Atendente de Loja' THEN 'ATEND_LOJA'
      WHEN 'Mídias Sociais' THEN 'MIDIAS_SOC'
      WHEN 'Operador(a) de Caixa' THEN 'OP_CAIXA'
      WHEN 'Avaliadora' THEN 'AVALIADORA'
      WHEN 'Repositor(a)' THEN 'REPOSITOR'
      WHEN 'Líder de Loja' THEN 'LIDER_LOJA'
      WHEN 'Gerente' THEN 'GERENTE'
      ELSE NULL
    END;
  ELSE
    RETURN false;
  END IF;
  
  -- Verificar se há regras específicas de acesso para este curso
  SELECT EXISTS(
    SELECT 1 FROM public.course_position_access cpa
    WHERE cpa.course_id = p_course_id AND cpa.active = true
  ) INTO v_has_specific_rules;
  
  -- Se não há regras específicas, verificar apenas o public_target
  IF NOT v_has_specific_rules THEN
    -- Curso para ambos: liberar acesso
    IF v_course.public_target = 'ambos' THEN
      RETURN true;
    END IF;
    
    -- Curso para franqueados: liberar apenas se for franqueado
    IF v_course.public_target = 'franqueado' AND v_user.role = 'Franqueado' THEN
      RETURN true;
    END IF;
    
    -- Curso para colaboradores: liberar apenas se for colaborador
    IF v_course.public_target = 'colaborador' AND v_user.role = 'Colaborador' THEN
      RETURN true;
    END IF;
    
    RETURN false;
  END IF;
  
  -- Se há regras específicas, verificar se a posição do usuário está permitida
  IF v_user_position IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.course_position_access cpa
      WHERE cpa.course_id = p_course_id 
        AND cpa.position_code = v_user_position 
        AND cpa.active = true
    ) INTO v_has_access;
    
    RETURN v_has_access;
  END IF;
  
  RETURN false;
END;
$function$;
