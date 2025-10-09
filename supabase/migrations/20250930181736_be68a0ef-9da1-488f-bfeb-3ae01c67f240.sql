-- Atualizar o registro do Alison com os dados corretos
UPDATE public.users
SET 
  phone = '11939581539',
  cpf = '55306286801',
  unit_codes = ARRAY['9999'],
  updated_at = now()
WHERE email = 'alison.martins@crescieperdi.com.br';

-- Forçar atualização do nomes_unidades para esse registro
UPDATE public.users u
SET 
  nomes_unidades = (
    SELECT array_to_string(array_agg(DISTINCT un.grupo ORDER BY un.grupo), ', ')
    FROM public.unidades un
    WHERE un.id = ANY(u.unit_codes) AND un.grupo IS NOT NULL
  )
WHERE email = 'alison.martins@crescieperdi.com.br';