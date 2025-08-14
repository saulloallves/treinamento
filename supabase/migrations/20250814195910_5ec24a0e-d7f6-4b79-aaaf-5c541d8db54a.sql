-- Remover a constraint existente
ALTER TABLE public.admin_users DROP CONSTRAINT admin_users_user_id_fkey;

-- Recriar a constraint com CASCADE DELETE
ALTER TABLE public.admin_users 
ADD CONSTRAINT admin_users_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;