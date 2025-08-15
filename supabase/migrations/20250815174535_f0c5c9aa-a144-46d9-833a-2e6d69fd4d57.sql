-- Função para vincular inscrições existentes quando um usuário se cadastra
CREATE OR REPLACE FUNCTION public.link_enrollments_on_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Vincular todas as inscrições que tenham o mesmo email do usuário
  UPDATE public.enrollments 
  SET user_id = NEW.id
  WHERE student_email = NEW.email 
    AND user_id IS NULL;
  
  RETURN NEW;
END;
$$;

-- Trigger que executa a função sempre que um usuário é criado
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.link_enrollments_on_user_creation();