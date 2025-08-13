-- Criar tabela de configurações do sistema
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name TEXT NOT NULL DEFAULT 'Cresci e Perdi',
  system_description TEXT NOT NULL DEFAULT 'Sistema de Treinamentos',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT true,
  auto_certificate_generation BOOLEAN NOT NULL DEFAULT true,
  certificate_template TEXT NOT NULL DEFAULT 'default',
  course_approval_required BOOLEAN NOT NULL DEFAULT false,
  max_enrollment_per_course INTEGER,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admin can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Admin can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Admin can insert system settings" 
ON public.system_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND active = true
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
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
  'Sistema de Treinamentos',
  true,
  true,
  true,
  'default',
  false,
  NULL,
  'America/Sao_Paulo'
);