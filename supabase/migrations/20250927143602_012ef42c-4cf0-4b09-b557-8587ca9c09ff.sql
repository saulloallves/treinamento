-- Atualizar todos os usuários existentes que não têm visible_password definido
UPDATE public.users 
SET visible_password = 'Trocar01'
WHERE visible_password IS NULL OR visible_password = '';

-- Para usuários que já têm visible_password mas está vazio, também definir senha padrão
UPDATE public.users 
SET visible_password = 'Trocar01'
WHERE TRIM(visible_password) = '';

-- Garantir que a coluna não seja nula no futuro
ALTER TABLE public.users 
ALTER COLUMN visible_password SET DEFAULT 'Trocar01';