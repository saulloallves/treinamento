-- Create professor permissions system

-- Create table for professor permissions
CREATE TABLE public.professor_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  enabled_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professor_id, module_name)
);

-- Enable RLS
ALTER TABLE public.professor_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for professor_permissions
CREATE POLICY "Admins can manage professor permissions" 
ON public.professor_permissions 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Professors can view their own permissions" 
ON public.professor_permissions 
FOR SELECT 
USING (professor_id = auth.uid());

-- Create function to check professor permissions
CREATE OR REPLACE FUNCTION public.has_professor_permission(
  _professor_id UUID,
  _module_name TEXT,
  _permission_type TEXT DEFAULT 'view'
) RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN _permission_type = 'edit' THEN 
        COALESCE((SELECT can_edit FROM professor_permissions WHERE professor_id = _professor_id AND module_name = _module_name), false)
      ELSE 
        COALESCE((SELECT can_view FROM professor_permissions WHERE professor_id = _professor_id AND module_name = _module_name), false)
    END;
$$;

-- Create function to get professor enabled fields
CREATE OR REPLACE FUNCTION public.get_professor_enabled_fields(
  _professor_id UUID,
  _module_name TEXT
) RETURNS JSONB
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT enabled_fields FROM professor_permissions WHERE professor_id = _professor_id AND module_name = _module_name),
    '{}'::jsonb
  );
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_professor_permissions_updated_at
  BEFORE UPDATE ON public.professor_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add system modules enum for consistency
CREATE TYPE public.system_module AS ENUM (
  'dashboard',
  'courses',
  'lessons', 
  'turmas',
  'enrollments',
  'attendance',
  'progress',
  'quiz',
  'certificates',
  'communication',
  'settings'
);

-- Add constraint to ensure valid module names
ALTER TABLE public.professor_permissions 
ADD CONSTRAINT valid_module_name 
CHECK (module_name::system_module IS NOT NULL);