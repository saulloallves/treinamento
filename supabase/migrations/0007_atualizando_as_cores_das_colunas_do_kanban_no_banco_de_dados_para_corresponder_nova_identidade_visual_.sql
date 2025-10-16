-- Atualiza a coluna 'Planejadas' para usar a cor primária (amarelo/laranja)
UPDATE public.kanban_columns
SET 
  color = 'bg-primary/5 border-primary/20',
  header_color = 'bg-primary'
WHERE status = 'agendada';

-- Atualiza a coluna 'Em Andamento' para usar a cor de destaque (azul)
UPDATE public.kanban_columns
SET 
  color = 'bg-accent/5 border-accent/20',
  header_color = 'bg-accent'
WHERE status = 'em_andamento';

-- Atualiza a coluna 'Transformar em Treinamento' para usar uma cor roxa
UPDATE public.kanban_columns
SET 
  color = 'bg-purple-50 border-purple-200',
  header_color = 'bg-purple-500'
WHERE status = 'transformar_treinamento';

-- Atualiza a coluna 'Finalizadas' para usar a cor de status ativo (verde)
UPDATE public.kanban_columns
SET 
  color = 'bg-status-active/5 border-status-active/20',
  header_color = 'bg-status-active'
WHERE status = 'encerrada';