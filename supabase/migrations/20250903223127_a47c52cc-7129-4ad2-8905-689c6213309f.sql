-- Atualizar as turmas sem nome para terem nomes adequados com códigos únicos
UPDATE public.turmas 
SET 
  name = CASE 
    WHEN name IS NULL OR name = '' THEN 'Turma Setembro 2025'
    ELSE name 
  END,
  code = CASE 
    WHEN code IS NULL OR code = '' THEN 'SET25-' || substring(id::text, 1, 8)
    ELSE code 
  END
WHERE name IS NULL OR name = '' OR code IS NULL OR code = '';