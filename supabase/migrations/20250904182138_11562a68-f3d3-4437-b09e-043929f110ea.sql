-- Backfill: Adicionar palavra-chave padrão para aulas ao vivo sem palavra-chave
UPDATE public.lessons 
SET attendance_keyword = 'setembro2025'
WHERE zoom_meeting_id IS NOT NULL 
  AND (attendance_keyword IS NULL OR attendance_keyword = '');

-- Comentário: Todas as aulas ao vivo agora têm a palavra-chave padrão 'setembro2025'