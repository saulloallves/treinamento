-- Create turmas table for live course instances
CREATE TABLE public.turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT,
  code TEXT UNIQUE,
  responsavel_user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'encerrada', 'cancelada')),
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  completion_deadline DATE NOT NULL,
  capacity INTEGER,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX turmas_course_id_idx ON public.turmas(course_id);
CREATE INDEX turmas_responsavel_idx ON public.turmas(responsavel_user_id);

-- Add turma_id to enrollments table
ALTER TABLE public.enrollments
  ADD COLUMN turma_id UUID REFERENCES public.turmas(id);

CREATE INDEX enrollments_turma_id_idx ON public.enrollments(turma_id);

-- Create lesson_sessions table for turma-specific lesson instances
CREATE TABLE public.lesson_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  zoom_meeting_id TEXT,
  start_url TEXT,
  join_url TEXT,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'iniciada', 'encerrada')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX lesson_sessions_turma_idx ON public.lesson_sessions(turma_id);
CREATE INDEX lesson_sessions_lesson_idx ON public.lesson_sessions(lesson_id);

-- Create transformation kanban table
CREATE TABLE public.transformation_kanban (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformation_kanban ENABLE ROW LEVEL SECURITY;

-- RLS Policies for turmas
CREATE POLICY "Admins can manage all turmas" ON public.turmas
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Professors can manage their turmas" ON public.turmas
  FOR ALL USING (responsavel_user_id = auth.uid());

CREATE POLICY "Students can view turmas they are enrolled in" ON public.turmas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.turma_id = turmas.id AND e.user_id = auth.uid()
    )
  );

-- RLS Policies for lesson_sessions
CREATE POLICY "Admins can manage all lesson sessions" ON public.lesson_sessions
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Professors can manage sessions in their turmas" ON public.lesson_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.turmas t
      WHERE t.id = lesson_sessions.turma_id AND t.responsavel_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view sessions in their turmas" ON public.lesson_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.turma_id = lesson_sessions.turma_id AND e.user_id = auth.uid()
    )
  );

-- RLS Policies for transformation_kanban
CREATE POLICY "Admins can manage transformation kanban" ON public.transformation_kanban
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Professors can view their course transformations" ON public.transformation_kanban
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.turmas t
      WHERE t.course_id = transformation_kanban.course_id AND t.responsavel_user_id = auth.uid()
    )
  );

-- Function to conclude a turma
CREATE OR REPLACE FUNCTION public.conclude_turma(p_turma_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_course_id UUID;
  v_turma_record RECORD;
BEGIN
  -- Get turma details
  SELECT * INTO v_turma_record FROM public.turmas WHERE id = p_turma_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma not found';
  END IF;
  
  IF v_turma_record.status != 'em_andamento' THEN
    RAISE EXCEPTION 'Only turmas in progress can be concluded';
  END IF;

  -- Update turma status
  UPDATE public.turmas
  SET 
    status = 'encerrada', 
    end_at = now(), 
    updated_at = now()
  WHERE id = p_turma_id;

  -- Create transformation kanban entry
  INSERT INTO public.transformation_kanban (course_id, turma_id, status, created_by)
  VALUES (v_turma_record.course_id, p_turma_id, 'Pronto para virar treinamento', p_user_id);
  
  -- TODO: Trigger certificate generation for eligible students
  -- This would be handled by existing certificate generation logic
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start a turma
CREATE OR REPLACE FUNCTION public.start_turma(p_turma_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_turma_record RECORD;
BEGIN
  SELECT * INTO v_turma_record FROM public.turmas WHERE id = p_turma_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma not found';
  END IF;
  
  IF v_turma_record.status != 'agendada' THEN
    RAISE EXCEPTION 'Only scheduled turmas can be started';
  END IF;

  UPDATE public.turmas
  SET 
    status = 'em_andamento', 
    start_at = now(), 
    updated_at = now()
  WHERE id = p_turma_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for updated_at
CREATE TRIGGER update_turmas_updated_at
  BEFORE UPDATE ON public.turmas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_sessions_updated_at
  BEFORE UPDATE ON public.lesson_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transformation_kanban_updated_at
  BEFORE UPDATE ON public.transformation_kanban
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();