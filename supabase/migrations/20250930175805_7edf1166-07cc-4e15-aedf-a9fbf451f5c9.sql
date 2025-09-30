-- Função para atualizar nomes_unidades baseado em unit_codes
CREATE OR REPLACE FUNCTION public.update_nomes_unidades()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se unit_codes não for null, buscar os nomes das unidades
  IF NEW.unit_codes IS NOT NULL AND array_length(NEW.unit_codes, 1) > 0 THEN
    SELECT array_agg(u.id ORDER BY u.id)
    INTO NEW.nomes_unidades
    FROM public.unidades u
    WHERE u.id = ANY(NEW.unit_codes);
  ELSE
    NEW.nomes_unidades := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar automaticamente em INSERT e UPDATE
DROP TRIGGER IF EXISTS trigger_update_nomes_unidades ON public.users;
CREATE TRIGGER trigger_update_nomes_unidades
  BEFORE INSERT OR UPDATE OF unit_codes
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nomes_unidades();

-- Atualizar todos os registros existentes
UPDATE public.users u
SET nomes_unidades = (
  SELECT array_agg(un.id ORDER BY un.id)
  FROM public.unidades un
  WHERE un.id = ANY(u.unit_codes)
)
WHERE u.unit_codes IS NOT NULL AND array_length(u.unit_codes, 1) > 0;