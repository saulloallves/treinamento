-- Backfill existing active lessons with the default attendance keyword
UPDATE public.lessons 
SET attendance_keyword = 'Cresci e Perdi 2025', updated_at = now()
WHERE status = 'Ativo' 
  AND (attendance_keyword IS NULL OR attendance_keyword = '');

-- Set default for future lessons
ALTER TABLE public.lessons 
ALTER COLUMN attendance_keyword SET DEFAULT 'Cresci e Perdi 2025';