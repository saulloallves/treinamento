-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name TEXT NOT NULL DEFAULT 'Sistema de Treinamentos',
  system_description TEXT DEFAULT 'Plataforma de gestão de cursos e treinamentos',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT true,
  auto_certificate_generation BOOLEAN NOT NULL DEFAULT false,
  certificate_template TEXT DEFAULT 'template_default',
  course_approval_required BOOLEAN NOT NULL DEFAULT false,
  max_enrollment_per_course INTEGER DEFAULT 50,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system settings (only admins can manage)
CREATE POLICY "Admin can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.active = true
  )
);

CREATE POLICY "Admin can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.active = true
  )
);

CREATE POLICY "Admin can insert system settings" 
ON public.system_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.active = true
  )
);

-- Insert default system settings
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
  'Cresci e Perdi',
  'Sistema de Treinamentos para Franquias',
  true,
  true,
  false,
  'template_default',
  false,
  50,
  'America/Sao_Paulo'
);

-- Create function to get system settings
CREATE OR REPLACE FUNCTION public.get_system_settings()
RETURNS TABLE (
  id UUID,
  system_name TEXT,
  system_description TEXT,
  email_notifications BOOLEAN,
  whatsapp_notifications BOOLEAN,
  auto_certificate_generation BOOLEAN,
  certificate_template TEXT,
  course_approval_required BOOLEAN,
  max_enrollment_per_course INTEGER,
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.active = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.system_name,
    s.system_description,
    s.email_notifications,
    s.whatsapp_notifications,
    s.auto_certificate_generation,
    s.certificate_template,
    s.course_approval_required,
    s.max_enrollment_per_course,
    s.timezone,
    s.created_at,
    s.updated_at
  FROM public.system_settings s
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();