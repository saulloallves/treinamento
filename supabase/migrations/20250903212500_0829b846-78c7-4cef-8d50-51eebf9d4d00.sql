-- Remove old themes and update existing courses to have proper new themes
UPDATE public.courses 
SET theme = ARRAY['Estrutura de Loja']
WHERE theme && ARRAY['Segurança', 'Vendas', 'Gestão', 'Atendimento', 'Qualidade'];

-- Clean up any null or empty theme arrays
UPDATE public.courses 
SET theme = ARRAY['Estrutura de Loja'] 
WHERE theme IS NULL OR theme = '{}' OR array_length(theme, 1) IS NULL;