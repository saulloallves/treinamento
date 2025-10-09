-- Corrigir função update_system_settings para remover ambiguidade
DROP FUNCTION IF EXISTS public.update_system_settings(jsonb);

CREATE OR REPLACE FUNCTION public.update_system_settings(settings_data jsonb)
RETURNS TABLE(
  id uuid,
  system_name text,
  system_description text,
  email_notifications boolean,
  whatsapp_notifications boolean,
  auto_certificate_generation boolean,
  certificate_template text,
  course_approval_required boolean,
  max_enrollment_per_course integer,
  timezone text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_existing_id uuid;
BEGIN
  -- Verificar se usuário é admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin access required.';
  END IF;

  -- Verificar se já existe configuração
  SELECT system_settings.id INTO v_existing_id 
  FROM public.system_settings
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Atualizar registro existente
    UPDATE public.system_settings 
    SET 
      system_name = COALESCE((settings_data->>'system_name')::text, system_settings.system_name),
      system_description = COALESCE((settings_data->>'system_description')::text, system_settings.system_description),
      email_notifications = COALESCE((settings_data->>'email_notifications')::boolean, system_settings.email_notifications),
      whatsapp_notifications = COALESCE((settings_data->>'whatsapp_notifications')::boolean, system_settings.whatsapp_notifications),
      auto_certificate_generation = COALESCE((settings_data->>'auto_certificate_generation')::boolean, system_settings.auto_certificate_generation),
      certificate_template = COALESCE((settings_data->>'certificate_template')::text, system_settings.certificate_template),
      course_approval_required = COALESCE((settings_data->>'course_approval_required')::boolean, system_settings.course_approval_required),
      max_enrollment_per_course = (settings_data->>'max_enrollment_per_course')::integer,
      timezone = COALESCE((settings_data->>'timezone')::text, system_settings.timezone),
      updated_at = now()
    WHERE system_settings.id = v_existing_id;
  ELSE
    -- Criar novo registro
    INSERT INTO public.system_settings (
      system_name,
      system_description,
      email_notifications,
      whatsapp_notifications,
      auto_certificate_generation,
      certificate_template,
      course_approval_required,
      max_enrollment_per_course,
      timezone
    ) VALUES (
      COALESCE((settings_data->>'system_name')::text, 'Cresci e Perdi'),
      COALESCE((settings_data->>'system_description')::text, 'Sistema de Treinamentos'),
      COALESCE((settings_data->>'email_notifications')::boolean, true),
      COALESCE((settings_data->>'whatsapp_notifications')::boolean, true),
      COALESCE((settings_data->>'auto_certificate_generation')::boolean, true),
      COALESCE((settings_data->>'certificate_template')::text, 'default'),
      COALESCE((settings_data->>'course_approval_required')::boolean, false),
      (settings_data->>'max_enrollment_per_course')::integer,
      COALESCE((settings_data->>'timezone')::text, 'America/Sao_Paulo')
    );
  END IF;

  -- Retornar o registro atualizado/criado
  RETURN QUERY
  SELECT 
    system_settings.id,
    system_settings.system_name,
    system_settings.system_description,
    system_settings.email_notifications,
    system_settings.whatsapp_notifications,
    system_settings.auto_certificate_generation,
    system_settings.certificate_template,
    system_settings.course_approval_required,
    system_settings.max_enrollment_per_course,
    system_settings.timezone,
    system_settings.created_at,
    system_settings.updated_at
  FROM public.system_settings
  LIMIT 1;
END;
$function$;