-- Remove a restrição de chave estrangeira que depende da coluna 'unit_id'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_unit_id_fkey;

-- Remove a coluna 'unit_id' da tabela 'users'
ALTER TABLE public.users DROP COLUMN IF EXISTS unit_id;