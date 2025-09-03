-- Add responsavel_name field to turmas table to store manually entered professor names
ALTER TABLE public.turmas 
ADD COLUMN responsavel_name text;