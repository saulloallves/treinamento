-- AVISO: Este comando apagará todos os dados da tabela 'unidades' e de todas as tabelas que dependem dela (incluindo usuários, inscrições, etc.).
TRUNCATE public.unidades CASCADE;

-- Agora que a tabela está vazia, podemos adicionar as restrições necessárias com segurança.
-- Garante que a coluna 'codigo_grupo' não pode ser nula.
ALTER TABLE public.unidades ALTER COLUMN codigo_grupo SET NOT NULL;

-- Garante que a coluna 'codigo_grupo' seja única para a lógica de UPSERT funcionar.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unidades_codigo_grupo_key' AND conrelid = 'public.unidades'::regclass
  ) THEN
    ALTER TABLE public.unidades ADD CONSTRAINT unidades_codigo_grupo_key UNIQUE (codigo_grupo);
  END IF;
END;
$$;