/*
  # Sistema Dinâmico de Alternativas com Pontuação Customizada

  ## Objetivo
  Permitir que usuários criem questões com número variável de alternativas (mínimo 2)
  e atribuam pontuações customizadas (0-10) para cada alternativa.

  ## Alterações na Estrutura
  1. Remove coluna `is_correct` (deprecated - usava boolean)
  2. Remove coluna `order_index` (deprecated - nome inconsistente)
  3. Adiciona coluna `score_value` (INTEGER, 0-10 pontos)
  4. Adiciona coluna `option_order` (INTEGER, para ordenação)
  5. Limpa alternativas vazias ou inválidas
  6. Reordena alternativas existentes sequencialmente

  ## Limpeza de Dados
  - Remove alternativas com texto vazio/null
  - Remove alternativas com texto contendo apenas espaços
  - Remove alternativas com menos de 1 caractere válido

  ## Validações Futuras (aplicadas no código)
  - Mínimo 2 alternativas por questão
  - Cada pontuação única por questão
  - Texto obrigatório para cada alternativa

  ## Compatibilidade
  - Dados existentes são preservados
  - `is_correct = true` é convertido para `score_value = 2`
  - `is_correct = false` é convertido para `score_value = 0`
  - `order_index` é migrado para `option_order`
*/

-- ============================================================================
-- ETAPA 1: Backup implícito (caso precise reverter, use transação manual)
-- ============================================================================

-- Para executar com segurança, você pode envolver tudo em BEGIN/COMMIT:
-- BEGIN;
-- ... todo o código abaixo ...
-- COMMIT; (ou ROLLBACK se algo der errado)

-- ============================================================================
-- ETAPA 2: Adicionar novas colunas se não existirem
-- ============================================================================

-- Adicionar score_value (pontuação de 0-10)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'treinamento'
      AND table_name = 'test_question_options'
      AND column_name = 'score_value'
  ) THEN
    ALTER TABLE treinamento.test_question_options
    ADD COLUMN score_value INTEGER DEFAULT 0;
  END IF;
END $$;

-- Adicionar option_order (ordenação sequencial)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'treinamento'
      AND table_name = 'test_question_options'
      AND column_name = 'option_order'
  ) THEN
    ALTER TABLE treinamento.test_question_options
    ADD COLUMN option_order INTEGER;
  END IF;
END $$;

-- ============================================================================
-- ETAPA 3: Migrar dados antigos (is_correct -> score_value)
-- ============================================================================

-- Converter is_correct para score_value se a coluna existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'treinamento'
      AND table_name = 'test_question_options'
      AND column_name = 'is_correct'
  ) THEN
    -- Atualizar score_value baseado em is_correct
    UPDATE treinamento.test_question_options
    SET score_value = CASE
      WHEN is_correct = true THEN 2
      WHEN is_correct = false THEN 0
      ELSE 0
    END
    WHERE score_value IS NULL OR score_value = 0;
  END IF;
END $$;

-- ============================================================================
-- ETAPA 4: Migrar order_index para option_order
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'treinamento'
      AND table_name = 'test_question_options'
      AND column_name = 'order_index'
  ) THEN
    -- Copiar order_index para option_order se ainda não foi feito
    UPDATE treinamento.test_question_options
    SET option_order = order_index
    WHERE option_order IS NULL AND order_index IS NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- ETAPA 5: Reordenar todas as alternativas sequencialmente
-- ============================================================================

-- Criar numeração sequencial por questão, baseado na ordem atual
WITH ordered_options AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY question_id
      ORDER BY
        COALESCE(option_order, order_index, 999),
        created_at
    ) as new_order
  FROM treinamento.test_question_options
)
UPDATE treinamento.test_question_options o
SET option_order = oo.new_order
FROM ordered_options oo
WHERE o.id = oo.id;

-- ============================================================================
-- ETAPA 6: Limpar alternativas inválidas
-- ============================================================================

-- Remover alternativas com texto vazio, null ou apenas espaços
DELETE FROM treinamento.test_question_options
WHERE option_text IS NULL
   OR TRIM(option_text) = ''
   OR LENGTH(TRIM(option_text)) = 0
   OR option_text = 'undefined'
   OR option_text = 'null';

-- ============================================================================
-- ETAPA 7: Garantir que questões tenham pelo menos 2 alternativas
-- ============================================================================

-- Identificar questões com menos de 2 alternativas (para análise)
-- NÃO vamos deletar automaticamente, apenas mostrar
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT question_id) INTO v_count
  FROM treinamento.test_question_options
  GROUP BY question_id
  HAVING COUNT(*) < 2;

  IF v_count > 0 THEN
    RAISE NOTICE 'Atenção: % questões têm menos de 2 alternativas. Revise-as manualmente.', v_count;
  END IF;
END $$;

-- ============================================================================
-- ETAPA 8: Remover colunas antigas (deprecated)
-- ============================================================================

-- Remover is_correct (agora usamos score_value)
ALTER TABLE treinamento.test_question_options
DROP COLUMN IF EXISTS is_correct;

-- Remover order_index (agora usamos option_order)
ALTER TABLE treinamento.test_question_options
DROP COLUMN IF EXISTS order_index;

-- ============================================================================
-- ETAPA 9: Adicionar constraints e validações
-- ============================================================================

-- Garantir que score_value é NOT NULL
ALTER TABLE treinamento.test_question_options
ALTER COLUMN score_value SET NOT NULL;

-- Garantir que score_value está entre 0 e 10
ALTER TABLE treinamento.test_question_options
DROP CONSTRAINT IF EXISTS check_score_value_range;

ALTER TABLE treinamento.test_question_options
ADD CONSTRAINT check_score_value_range
CHECK (score_value >= 0 AND score_value <= 10);

-- Garantir que option_order é NOT NULL
ALTER TABLE treinamento.test_question_options
ALTER COLUMN option_order SET NOT NULL;

-- Garantir que option_order é positivo
ALTER TABLE treinamento.test_question_options
DROP CONSTRAINT IF EXISTS check_option_order_positive;

ALTER TABLE treinamento.test_question_options
ADD CONSTRAINT check_option_order_positive
CHECK (option_order > 0);

-- Garantir que option_text não é vazio
ALTER TABLE treinamento.test_question_options
DROP CONSTRAINT IF EXISTS check_option_text_not_empty;

ALTER TABLE treinamento.test_question_options
ADD CONSTRAINT check_option_text_not_empty
CHECK (LENGTH(TRIM(option_text)) > 0);

-- ============================================================================
-- ETAPA 10: Criar índices para performance
-- ============================================================================

-- Índice para buscar alternativas por questão (já deve existir pelo FK)
CREATE INDEX IF NOT EXISTS idx_test_question_options_question_id
ON treinamento.test_question_options(question_id);

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_test_question_options_order
ON treinamento.test_question_options(question_id, option_order);

-- ============================================================================
-- ETAPA 11: Atualizar RLS policies se necessário
-- ============================================================================

-- Verificar policies existentes
-- (não vamos modificar, apenas garantir que existem)

-- ============================================================================
-- ETAPA 12: Verificação final
-- ============================================================================

-- Mostrar estatísticas
DO $$
DECLARE
  v_total_options INTEGER;
  v_total_questions INTEGER;
  v_avg_options NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_options
  FROM treinamento.test_question_options;

  SELECT COUNT(DISTINCT question_id) INTO v_total_questions
  FROM treinamento.test_question_options;

  IF v_total_questions > 0 THEN
    v_avg_options := ROUND(v_total_options::NUMERIC / v_total_questions, 2);
  ELSE
    v_avg_options := 0;
  END IF;

  RAISE NOTICE '=== MIGRAÇÃO CONCLUÍDA ===';
  RAISE NOTICE 'Total de alternativas: %', v_total_options;
  RAISE NOTICE 'Total de questões com alternativas: %', v_total_questions;
  RAISE NOTICE 'Média de alternativas por questão: %', v_avg_options;
END $$;

-- ============================================================================
-- QUERIES DE VERIFICAÇÃO (execute separadamente se quiser)
-- ============================================================================

-- Ver estrutura final da tabela:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'treinamento'
--   AND table_name = 'test_question_options'
-- ORDER BY ordinal_position;

-- Ver distribuição de pontuações:
-- SELECT score_value, COUNT(*) as total
-- FROM treinamento.test_question_options
-- GROUP BY score_value
-- ORDER BY score_value;

-- Ver questões com menos de 2 alternativas:
-- SELECT question_id, COUNT(*) as num_options
-- FROM treinamento.test_question_options
-- GROUP BY question_id
-- HAVING COUNT(*) < 2;

-- Ver questões com pontuações duplicadas:
-- SELECT question_id, score_value, COUNT(*) as duplicates
-- FROM treinamento.test_question_options
-- GROUP BY question_id, score_value
-- HAVING COUNT(*) > 1;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- IMPORTANTE: Se envolveu em BEGIN, execute COMMIT agora:
-- COMMIT;

-- Se algo deu errado e você usou BEGIN, pode reverter com:
-- ROLLBACK;
