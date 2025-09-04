-- Criar tabela para definir os cargos/posições disponíveis
CREATE TABLE public.job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('franqueado', 'colaborador')),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para relacionar cursos com cargos que podem acessá-los
CREATE TABLE public.course_position_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  position_code TEXT REFERENCES public.job_positions(code) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir dados iniciais - Cargos de Franqueado
INSERT INTO public.job_positions (code, name, category, description) VALUES
  ('FRANQ_IMPLANT', 'Franqueado Implantação', 'franqueado', 'Franqueados com unidades em fase de implantação'),
  ('FRANQ_OPER', 'Franqueado Operação', 'franqueado', 'Franqueados com unidades em operação'),
  ('FRANQ_GERAL', 'Franqueado Geral', 'franqueado', 'Franqueados sem fase específica ou acesso geral');

-- Inserir dados iniciais - Cargos de Colaborador
INSERT INTO public.job_positions (code, name, category, description) VALUES
  ('ATEND_LOJA', 'Atendente de Loja', 'colaborador', 'Responsável pelo atendimento aos clientes'),
  ('MIDIAS_SOC', 'Mídias Sociais', 'colaborador', 'Responsável pela gestão das redes sociais'),
  ('OP_CAIXA', 'Operador(a) de Caixa', 'colaborador', 'Responsável pelas operações de caixa'),
  ('AVALIADORA', 'Avaliadora', 'colaborador', 'Responsável pela avaliação de produtos/processos'),
  ('REPOSITOR', 'Repositor(a)', 'colaborador', 'Responsável pela reposição de estoque'),
  ('LIDER_LOJA', 'Líder de Loja', 'colaborador', 'Responsável pela liderança da equipe da loja'),
  ('GERENTE', 'Gerente', 'colaborador', 'Responsável pela gestão geral da unidade');

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_position_access ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para job_positions
CREATE POLICY "Anyone can view job positions"
ON public.job_positions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage job positions"
ON public.job_positions FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Políticas RLS para course_position_access
CREATE POLICY "Anyone can view course position access"
ON public.course_position_access FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage course position access"
ON public.course_position_access FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_job_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_positions_updated_at
  BEFORE UPDATE ON public.job_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_positions_updated_at();

-- Função para determinar cargo do franqueado baseado na fase da loja
CREATE OR REPLACE FUNCTION public.get_franchisee_position(p_unit_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fase_loja TEXT;
BEGIN
  -- Buscar fase da loja na tabela unidades
  SELECT fase_loja INTO v_fase_loja
  FROM public.unidades
  WHERE id = p_unit_code OR grupo = p_unit_code
  LIMIT 1;
  
  -- Determinar cargo baseado na fase
  CASE
    WHEN v_fase_loja = 'IMPLANTAÇÃO' THEN
      RETURN 'FRANQ_IMPLANT';
    WHEN v_fase_loja = 'OPERAÇÃO' THEN
      RETURN 'FRANQ_OPER';
    ELSE
      RETURN 'FRANQ_GERAL';
  END CASE;
END;
$$;

-- Função para verificar se usuário pode acessar curso
CREATE OR REPLACE FUNCTION public.can_user_access_course(p_user_id UUID, p_course_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_course RECORD;
  v_user_position TEXT;
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
    -- Professores e admins têm acesso total
    RETURN true;
  END IF;
  
  -- Verificar acesso baseado no public_target do curso
  IF v_course.public_target = 'ambos' THEN
    -- Se curso é para ambos, verificar se há regras específicas
    SELECT EXISTS(
      SELECT 1 FROM public.course_position_access cpa
      WHERE cpa.course_id = p_course_id AND cpa.active = true
    ) INTO v_has_access;
    
    -- Se não há regras específicas, liberar acesso
    IF NOT v_has_access THEN
      RETURN true;
    END IF;
    
  ELSIF v_course.public_target = 'franqueado' AND v_user.role = 'Franqueado' THEN
    -- Verificar regras específicas para franqueados
    SELECT EXISTS(
      SELECT 1 FROM public.course_position_access cpa
      WHERE cpa.course_id = p_course_id AND cpa.active = true
    ) INTO v_has_access;
    
    -- Se não há regras específicas, liberar acesso para todos franqueados
    IF NOT v_has_access THEN
      RETURN true;
    END IF;
    
  ELSIF v_course.public_target = 'colaborador' AND v_user.role = 'Colaborador' THEN
    -- Verificar regras específicas para colaboradores
    SELECT EXISTS(
      SELECT 1 FROM public.course_position_access cpa
      WHERE cpa.course_id = p_course_id AND cpa.active = true
    ) INTO v_has_access;
    
    -- Se não há regras específicas, liberar acesso para todos colaboradores
    IF NOT v_has_access THEN
      RETURN true;
    END IF;
  ELSE
    -- public_target não é compatível com o tipo do usuário
    RETURN false;
  END IF;
  
  -- Verificar se a posição específica tem acesso
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
$$;