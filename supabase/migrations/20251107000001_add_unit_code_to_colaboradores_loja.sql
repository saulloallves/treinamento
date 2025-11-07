-- Migration: Add unit_code column to public.colaboradores_loja
-- Date: 2025-11-07
-- Description: Adiciona coluna unit_code para armazenar o código da unidade do colaborador

-- Adicionar coluna unit_code (TEXT para compatibilidade com treinamento.users)
ALTER TABLE public.colaboradores_loja 
ADD COLUMN IF NOT EXISTS unit_code TEXT;

-- Criar índice para melhorar performance em queries por unidade
CREATE INDEX IF NOT EXISTS idx_colaboradores_loja_unit_code 
ON public.colaboradores_loja(unit_code);

-- Adicionar comentário explicativo na coluna
COMMENT ON COLUMN public.colaboradores_loja.unit_code IS 
'Código da unidade (franquia) à qual o colaborador pertence. Corresponde ao group_code em public.unidades';

-- Opcional: Popular unit_code para colaboradores existentes que já têm registro em treinamento.users
-- (Este UPDATE pode ser executado manualmente se necessário)
-- UPDATE public.colaboradores_loja c
-- SET unit_code = u.unit_code
-- FROM treinamento.users u
-- WHERE c.email = u.email
-- AND u.unit_code IS NOT NULL
-- AND c.unit_code IS NULL;
