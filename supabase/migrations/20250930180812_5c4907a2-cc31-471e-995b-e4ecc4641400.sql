-- Atualizar função para retornar texto ao invés de array
CREATE OR REPLACE FUNCTION public.update_nomes_unidades()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se unit_codes não for null, buscar os nomes dos grupos das unidades
  IF NEW.unit_codes IS NOT NULL AND array_length(NEW.unit_codes, 1) > 0 THEN
    SELECT array_to_string(array_agg(DISTINCT u.grupo ORDER BY u.grupo), ', ')
    INTO NEW.nomes_unidades
    FROM public.unidades u
    WHERE u.id = ANY(NEW.unit_codes) AND u.grupo IS NOT NULL;
  ELSE
    NEW.nomes_unidades := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;