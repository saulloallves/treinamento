-- Add CPF field to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cpf TEXT;