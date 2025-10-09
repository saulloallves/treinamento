-- Criar trigger para atualizar nomes_unidades automaticamente
CREATE OR REPLACE FUNCTION public.sync_nomes_unidades()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Se unit_codes não for null, buscar os nomes dos grupos das unidades
  IF NEW.unit_codes IS NOT NULL AND array_length(NEW.unit_codes, 1) > 0 THEN
    SELECT string_agg(DISTINCT u.grupo, ', ' ORDER BY u.grupo)
    INTO NEW.nomes_unidades
    FROM public.unidades u
    WHERE u.id = ANY(NEW.unit_codes) AND u.grupo IS NOT NULL;
  ELSE
    NEW.nomes_unidades := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger antigo se existir
DROP TRIGGER IF EXISTS trg_sync_nomes_unidades ON public.users;

-- Criar novo trigger
CREATE TRIGGER trg_sync_nomes_unidades
  BEFORE INSERT OR UPDATE OF unit_codes
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_nomes_unidades();

-- Atualizar registros existentes
UPDATE public.users u
SET nomes_unidades = (
  SELECT string_agg(DISTINCT un.grupo, ', ' ORDER BY un.grupo)
  FROM public.unidades un
  WHERE un.id = ANY(u.unit_codes) AND un.grupo IS NOT NULL
)
WHERE u.unit_codes IS NOT NULL AND array_length(u.unit_codes, 1) > 0;