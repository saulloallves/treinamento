-- Função para validar se os códigos de unidade existem
CREATE OR REPLACE FUNCTION public.validate_unit_codes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invalid_codes text[];
BEGIN
  -- Verificar se unit_codes foi fornecido e não está vazio
  IF NEW.unit_codes IS NOT NULL AND array_length(NEW.unit_codes, 1) > 0 THEN
    -- Buscar códigos que NÃO existem na tabela unidades
    SELECT array_agg(code)
    INTO invalid_codes
    FROM unnest(NEW.unit_codes) AS code
    WHERE code NOT IN (SELECT id FROM public.unidades);
    
    -- Se encontrou códigos inválidos, bloquear a operação
    IF invalid_codes IS NOT NULL AND array_length(invalid_codes, 1) > 0 THEN
      RAISE EXCEPTION 'Código(s) de unidade inválido(s): %. Cadastro não aprovado.', 
        array_to_string(invalid_codes, ', ');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para validar códigos antes de INSERT ou UPDATE
DROP TRIGGER IF EXISTS trigger_validate_unit_codes ON public.users;
CREATE TRIGGER trigger_validate_unit_codes
  BEFORE INSERT OR UPDATE OF unit_codes
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_unit_codes();