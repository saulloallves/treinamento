-- Forçar atualização de todos os registros com unit_codes mas sem nomes_unidades
UPDATE public.users u
SET 
  nomes_unidades = (
    SELECT array_to_string(array_agg(DISTINCT un.grupo ORDER BY un.grupo), ', ')
    FROM public.unidades un
    WHERE un.id = ANY(u.unit_codes) AND un.grupo IS NOT NULL
  ),
  updated_at = now()
WHERE u.unit_codes IS NOT NULL 
  AND array_length(u.unit_codes, 1) > 0
  AND (u.nomes_unidades IS NULL OR u.nomes_unidades = '');