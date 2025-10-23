-- Adiciona a coluna 'status' à tabela correta se ela ainda não existir
ALTER TABLE treinamento.courses
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo';

-- Cria um índice na nova coluna para otimizar as consultas
CREATE INDEX IF NOT EXISTS idx_courses_status ON treinamento.courses(status);