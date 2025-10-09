-- Alterar unit_code para suportar múltiplos códigos (array de texto)
-- Primeiro, adicionar nova coluna como array
ALTER TABLE public.users ADD COLUMN unit_codes TEXT[];

-- Copiar dados existentes de unit_code para unit_codes como array
UPDATE public.users 
SET unit_codes = ARRAY[unit_code] 
WHERE unit_code IS NOT NULL;

-- Atualizar a função find_franchisee_by_unit_code para buscar em arrays
CREATE OR REPLACE FUNCTION public.find_franchisee_by_unit_code(_unit_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  franchisee_id uuid;
BEGIN
  -- Buscar franqueado que tenha o código no array unit_codes OU no unit_code antigo
  SELECT id INTO franchisee_id
  FROM public.users
  WHERE (
    unit_code = _unit_code OR 
    _unit_code = ANY(unit_codes)
  )
    AND role = 'Franqueado'
    AND active = true
  LIMIT 1;
  
  RETURN franchisee_id;
END;
$function$;

-- Criar função para buscar todas as aprovações de um franqueado (todas suas unidades)
CREATE OR REPLACE FUNCTION public.get_franchisee_unit_codes(_franchisee_id uuid)
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(unit_codes, ARRAY[unit_code]) 
  FROM public.users 
  WHERE id = _franchisee_id 
    AND role = 'Franqueado' 
    AND active = true;
$$;

-- Adicionar índice para melhorar performance de buscas em arrays
CREATE INDEX IF NOT EXISTS idx_users_unit_codes ON public.users USING GIN(unit_codes);

-- Comentários explicativos
COMMENT ON COLUMN public.users.unit_codes IS 'Array de códigos de unidades para franqueados com múltiplas unidades';
COMMENT ON FUNCTION public.find_franchisee_by_unit_code IS 'Busca franqueado por código de unidade, suportando múltiplas unidades';
COMMENT ON FUNCTION public.get_franchisee_unit_codes IS 'Retorna todos os códigos de unidade de um franqueado';