-- Corrigir a função ensure_admin_bootstrap para não criar admin automaticamente
-- Ela deve verificar se há pelo menos um admin aprovado antes de criar
DROP FUNCTION IF EXISTS public.ensure_admin_bootstrap();

CREATE OR REPLACE FUNCTION public.ensure_admin_bootstrap()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  -- Verificar se já existe pelo menos um admin aprovado
  SELECT COUNT(*) INTO v_count 
  FROM public.admin_users 
  WHERE active = true AND status = 'approved';
  
  -- Se já existe admin aprovado, não faz nada
  IF v_count > 0 THEN
    RETURN;
  END IF;
  
  -- Se não há nenhum admin aprovado, não cria automaticamente
  -- O primeiro admin deve ser criado manualmente ou aprovado por outro meio
  RETURN;
END;
$function$;