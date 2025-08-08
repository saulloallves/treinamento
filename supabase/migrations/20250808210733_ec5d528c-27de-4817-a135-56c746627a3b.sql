
-- Create admin_users table for authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create units table
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  manager_name TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table (franchise users)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES public.units,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  position TEXT, -- cargo
  user_type TEXT NOT NULL, -- franqueado, colaborador
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  lesson_id UUID REFERENCES public.lessons NOT NULL,
  enrollment_id UUID REFERENCES public.enrollments NOT NULL,
  attendance_type TEXT NOT NULL DEFAULT 'manual', -- manual, automatic
  confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz table
CREATE TABLE public.quiz (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_responses table
CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  course_id UUID REFERENCES public.courses NOT NULL,
  quiz_id UUID REFERENCES public.quiz NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  course_id UUID REFERENCES public.courses NOT NULL,
  enrollment_id UUID REFERENCES public.enrollments NOT NULL,
  certificate_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active'
);

-- Add RLS policies for all new tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users
CREATE POLICY "Admins can view all admin users" ON public.admin_users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage admin users" ON public.admin_users FOR ALL USING (auth.uid() IS NOT NULL);

-- Policies for units
CREATE POLICY "Anyone can view units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Admins can manage units" ON public.units FOR ALL USING (auth.uid() IS NOT NULL);

-- Policies for users
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Admins can manage users" ON public.users FOR ALL USING (auth.uid() IS NOT NULL);

-- Policies for attendance
CREATE POLICY "Anyone can view attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Admins can manage attendance" ON public.attendance FOR ALL USING (auth.uid() IS NOT NULL);

-- Policies for quiz
CREATE POLICY "Anyone can view quiz" ON public.quiz FOR SELECT USING (true);
CREATE POLICY "Admins can manage quiz" ON public.quiz FOR ALL USING (auth.uid() IS NOT NULL);

-- Policies for quiz_responses
CREATE POLICY "Anyone can view quiz responses" ON public.quiz_responses FOR SELECT USING (true);
CREATE POLICY "Admins can manage quiz responses" ON public.quiz_responses FOR ALL USING (auth.uid() IS NOT NULL);

-- Policies for certificates
CREATE POLICY "Anyone can view certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (auth.uid() IS NOT NULL);

-- Add triggers for updated_at columns
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
