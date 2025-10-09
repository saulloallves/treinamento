-- Add column to store the keyword typed by the user when confirming attendance
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS typed_keyword TEXT; 

-- Optional comment for clarity
COMMENT ON COLUMN public.attendance.typed_keyword IS 'Palavra-chave digitada pelo usuário ao confirmar presença';