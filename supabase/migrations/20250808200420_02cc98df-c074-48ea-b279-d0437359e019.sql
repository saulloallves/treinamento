
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  public_target TEXT NOT NULL CHECK (public_target IN ('franqueado', 'colaborador', 'ambos')),
  mandatory BOOLEAN NOT NULL DEFAULT false,
  has_quiz BOOLEAN NOT NULL DEFAULT false,
  generates_certificate BOOLEAN NOT NULL DEFAULT false,
  lessons_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Em revisão', 'Inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Users can view all courses" 
  ON public.courses 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create courses" 
  ON public.courses 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update courses" 
  ON public.courses 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete courses" 
  ON public.courses 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  content TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Em revisão', 'Inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for lessons
CREATE POLICY "Users can view all lessons" 
  ON public.lessons 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create lessons" 
  ON public.lessons 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update lessons" 
  ON public.lessons 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete lessons" 
  ON public.lessons 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Function to update courses.lessons_count automatically
CREATE OR REPLACE FUNCTION update_course_lessons_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.courses 
    SET lessons_count = (
      SELECT COUNT(*) 
      FROM public.lessons 
      WHERE course_id = OLD.course_id
    )
    WHERE id = OLD.course_id;
    RETURN OLD;
  ELSE
    UPDATE public.courses 
    SET lessons_count = (
      SELECT COUNT(*) 
      FROM public.lessons 
      WHERE course_id = NEW.course_id
    )
    WHERE id = NEW.course_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update lessons count
CREATE TRIGGER trigger_update_course_lessons_count
  AFTER INSERT OR UPDATE OR DELETE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_course_lessons_count();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON public.courses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at 
  BEFORE UPDATE ON public.lessons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
