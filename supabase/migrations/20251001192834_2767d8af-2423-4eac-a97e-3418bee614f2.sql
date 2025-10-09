-- Criar tabela para armazenar configurações das colunas do Kanban
CREATE TABLE IF NOT EXISTS public.kanban_columns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  color TEXT NOT NULL,
  header_color TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem visualizar as colunas
CREATE POLICY "Colunas são visíveis para todos autenticados"
  ON public.kanban_columns
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Apenas admins podem criar colunas
CREATE POLICY "Apenas admins podem criar colunas"
  ON public.kanban_columns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Apenas admins podem atualizar colunas
CREATE POLICY "Apenas admins podem atualizar colunas"
  ON public.kanban_columns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Apenas admins podem deletar colunas não-padrão
CREATE POLICY "Apenas admins podem deletar colunas não-padrão"
  ON public.kanban_columns
  FOR DELETE
  USING (
    is_default = false
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_kanban_columns_updated_at
  BEFORE UPDATE ON public.kanban_columns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir colunas padrão
INSERT INTO public.kanban_columns (id, title, status, color, header_color, "order", is_default)
VALUES
  ('agendada', 'Planejadas', 'agendada', 'bg-blue-50 border-blue-200', 'bg-blue-500', 1, true),
  ('em_andamento', 'Em Andamento', 'em_andamento', 'bg-orange-50 border-orange-200', 'bg-orange-500', 2, true),
  ('transformar_treinamento', 'Transformar em Treinamento', 'transformar_treinamento', 'bg-purple-50 border-purple-200', 'bg-purple-500', 3, false),
  ('encerrada', 'Finalizadas', 'encerrada', 'bg-green-50 border-green-200', 'bg-green-500', 4, true)
ON CONFLICT (id) DO NOTHING;