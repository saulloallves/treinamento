-- Habilita RLS nas tabelas se ainda não estiver habilitado
ALTER TABLE IF EXISTS treinamento.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS treinamento.kanban_columns ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Admins can manage all turmas" ON treinamento.turmas;
DROP POLICY IF EXISTS "Users can view accessible turmas" ON treinamento.turmas;
DROP POLICY IF EXISTS "Admins can manage kanban columns" ON treinamento.kanban_columns;
DROP POLICY IF EXISTS "Authenticated users can view kanban columns" ON treinamento.kanban_columns;

-- Políticas para a tabela 'turmas'
CREATE POLICY "Admins can manage all turmas"
ON treinamento.turmas
FOR ALL
USING (treinamento.is_admin(auth.uid()))
WITH CHECK (treinamento.is_admin(auth.uid()));

CREATE POLICY "Users can view accessible turmas"
ON treinamento.turmas
FOR SELECT
USING (treinamento.user_can_access_turma(auth.uid(), id));

-- Políticas para a tabela 'kanban_columns'
CREATE POLICY "Admins can manage kanban columns"
ON treinamento.kanban_columns
FOR ALL
USING (treinamento.is_admin(auth.uid()))
WITH CHECK (treinamento.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view kanban columns"
ON treinamento.kanban_columns
FOR SELECT
USING (auth.role() = 'authenticated');
