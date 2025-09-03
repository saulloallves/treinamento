-- Make responsavel_user_id nullable in turmas table to allow manual professor names
ALTER TABLE public.turmas 
ALTER COLUMN responsavel_user_id DROP NOT NULL;