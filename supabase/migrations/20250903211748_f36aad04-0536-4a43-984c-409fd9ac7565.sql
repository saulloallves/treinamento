-- Add instructor field and change theme to support multiple values
ALTER TABLE public.courses 
ADD COLUMN instructor TEXT,
ALTER COLUMN theme TYPE TEXT[] USING ARRAY[theme];

-- Update existing courses to have proper theme array format
UPDATE public.courses 
SET theme = ARRAY['Estrutura de Loja'] 
WHERE theme IS NULL OR theme = '{}';