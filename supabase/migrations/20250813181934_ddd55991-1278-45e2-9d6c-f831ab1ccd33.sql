-- Adicionar coluna unit_code na tabela enrollments
ALTER TABLE public.enrollments ADD COLUMN unit_code TEXT;

-- Criar função para preencher unit_code automaticamente
CREATE OR REPLACE FUNCTION public.fill_enrollment_unit_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Se user_id estiver preenchido, buscar unit_code do usuário
  IF NEW.user_id IS NOT NULL THEN
    SELECT unit_code INTO NEW.unit_code 
    FROM public.users 
    WHERE id = NEW.user_id;
  END IF;
  
  -- Se unit_code ainda estiver vazio e temos student_email, tentar buscar por email
  IF NEW.unit_code IS NULL AND NEW.student_email IS NOT NULL THEN
    SELECT unit_code INTO NEW.unit_code 
    FROM public.users 
    WHERE email = NEW.student_email 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para preencher unit_code automaticamente em INSERT/UPDATE
CREATE TRIGGER fill_enrollment_unit_code_trigger
  BEFORE INSERT OR UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.fill_enrollment_unit_code();

-- Preencher unit_code para registros existentes
UPDATE public.enrollments 
SET unit_code = (
  SELECT u.unit_code 
  FROM public.users u 
  WHERE u.id = enrollments.user_id
)
WHERE user_id IS NOT NULL AND unit_code IS NULL;

-- Preencher unit_code para registros sem user_id mas com email
UPDATE public.enrollments 
SET unit_code = (
  SELECT u.unit_code 
  FROM public.users u 
  WHERE u.email = enrollments.student_email 
  LIMIT 1
)
WHERE user_id IS NULL AND student_email IS NOT NULL AND unit_code IS NULL;