-- Módulo 2: Sistema de Turmas
-- Criação das tabelas classes e student_classes

-- Criação do tipo ENUM para status das turmas
CREATE TYPE class_status AS ENUM ('criada', 'iniciada', 'encerrada');

-- Criação do tipo ENUM para status dos alunos nas turmas
CREATE TYPE student_class_status AS ENUM ('inscrito', 'concluido', 'cancelado');

-- Tabela de turmas
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  responsible_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  status class_status NOT NULL DEFAULT 'criada',
  deadline DATE NOT NULL,
  max_students INTEGER DEFAULT 30,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- Tabela de relacionamento alunos x turmas
CREATE TABLE public.student_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status student_class_status NOT NULL DEFAULT 'inscrito',
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint para evitar inscrições duplicadas
  UNIQUE(class_id, student_id)
);

-- Tabela de logs de auditoria para turmas
CREATE TABLE public.class_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'started', 'ended', 'student_enrolled', 'student_removed'
  performed_by UUID NOT NULL REFERENCES public.users(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para classes
-- Admins podem ver todas as turmas
CREATE POLICY "Admins can view all classes" 
ON public.classes 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Professores podem ver turmas que são responsáveis
CREATE POLICY "Teachers can view their classes" 
ON public.classes 
FOR SELECT 
USING (responsible_id = auth.uid());

-- Alunos podem ver turmas que participam
CREATE POLICY "Students can view their enrolled classes" 
ON public.classes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.student_classes sc 
  WHERE sc.class_id = id AND sc.student_id = auth.uid()
));

-- Admins e Professores podem criar turmas
CREATE POLICY "Admins and teachers can create classes" 
ON public.classes 
FOR INSERT 
WITH CHECK (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.user_type = 'Professor'
  )
);

-- Admins e responsáveis podem atualizar turmas
CREATE POLICY "Admins and responsible teachers can update classes" 
ON public.classes 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  responsible_id = auth.uid()
);

-- Apenas admins podem deletar turmas
CREATE POLICY "Only admins can delete classes" 
ON public.classes 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Políticas RLS para student_classes
-- Admins podem ver todas as inscrições
CREATE POLICY "Admins can view all student classes" 
ON public.student_classes 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Responsáveis podem ver inscrições de suas turmas
CREATE POLICY "Teachers can view enrollments in their classes" 
ON public.student_classes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.classes c 
  WHERE c.id = class_id AND c.responsible_id = auth.uid()
));

-- Alunos podem ver suas próprias inscrições
CREATE POLICY "Students can view their own enrollments" 
ON public.student_classes 
FOR SELECT 
USING (student_id = auth.uid());

-- Políticas para inserção e atualização
CREATE POLICY "Authenticated users can enroll in classes" 
ON public.student_classes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and teachers can manage enrollments" 
ON public.student_classes 
FOR ALL 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.classes c 
    WHERE c.id = class_id AND c.responsible_id = auth.uid()
  )
);

-- Políticas para logs de auditoria
CREATE POLICY "Admins can view all audit logs" 
ON public.class_audit_logs 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Teachers can view logs of their classes" 
ON public.class_audit_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.classes c 
  WHERE c.id = class_id AND c.responsible_id = auth.uid()
));

CREATE POLICY "Authenticated users can create audit logs" 
ON public.class_audit_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Índices para performance
CREATE INDEX idx_classes_course_id ON public.classes(course_id);
CREATE INDEX idx_classes_responsible_id ON public.classes(responsible_id);
CREATE INDEX idx_classes_status ON public.classes(status);
CREATE INDEX idx_classes_deadline ON public.classes(deadline);

CREATE INDEX idx_student_classes_class_id ON public.student_classes(class_id);
CREATE INDEX idx_student_classes_student_id ON public.student_classes(student_id);
CREATE INDEX idx_student_classes_status ON public.student_classes(status);

CREATE INDEX idx_class_audit_logs_class_id ON public.class_audit_logs(class_id);
CREATE INDEX idx_class_audit_logs_created_at ON public.class_audit_logs(created_at);

-- Triggers para updated_at
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_classes_updated_at
BEFORE UPDATE ON public.student_classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar log de auditoria automaticamente
CREATE OR REPLACE FUNCTION public.create_class_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.class_audit_logs (class_id, action, performed_by, new_data)
    VALUES (NEW.id, 'created', auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.class_audit_logs (class_id, action, performed_by, old_data, new_data)
    VALUES (NEW.id, 'updated', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.class_audit_logs (class_id, action, performed_by, old_data)
    VALUES (OLD.id, 'deleted', auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auditoria automática
CREATE TRIGGER classes_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.create_class_audit_log();

-- Função para gerenciar status da turma e curso
CREATE OR REPLACE FUNCTION public.manage_class_status(
  _class_id UUID,
  _new_status class_status
)
RETURNS VOID AS $$
DECLARE
  _class_record RECORD;
  _current_time TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- Verificar permissões
  SELECT * INTO _class_record FROM public.classes WHERE id = _class_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma não encontrada';
  END IF;
  
  IF NOT (is_admin(auth.uid()) OR _class_record.responsible_id = auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas admins ou responsáveis podem alterar o status da turma.';
  END IF;
  
  -- Atualizar status da turma
  IF _new_status = 'iniciada' THEN
    UPDATE public.classes 
    SET status = _new_status, started_at = _current_time, updated_at = _current_time
    WHERE id = _class_id;
    
    -- Log de auditoria
    INSERT INTO public.class_audit_logs (class_id, action, performed_by, new_data)
    VALUES (_class_id, 'started', auth.uid(), jsonb_build_object('started_at', _current_time));
    
  ELSIF _new_status = 'encerrada' THEN
    UPDATE public.classes 
    SET status = _new_status, ended_at = _current_time, updated_at = _current_time
    WHERE id = _class_id;
    
    -- Atualizar curso para "Pronto para virar treinamento" quando turma encerra
    UPDATE public.courses 
    SET status = 'Pronto para virar treinamento', updated_at = _current_time
    WHERE id = _class_record.course_id;
    
    -- Log de auditoria
    INSERT INTO public.class_audit_logs (class_id, action, performed_by, new_data)
    VALUES (_class_id, 'ended', auth.uid(), jsonb_build_object('ended_at', _current_time));
    
  ELSE
    UPDATE public.classes 
    SET status = _new_status, updated_at = _current_time
    WHERE id = _class_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para inscrever aluno em turma
CREATE OR REPLACE FUNCTION public.enroll_student_in_class(
  _class_id UUID,
  _student_id UUID
)
RETURNS VOID AS $$
DECLARE
  _class_record RECORD;
  _student_count INTEGER;
BEGIN
  -- Verificar se a turma existe e está ativa
  SELECT * INTO _class_record FROM public.classes WHERE id = _class_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma não encontrada';
  END IF;
  
  IF _class_record.status = 'encerrada' THEN
    RAISE EXCEPTION 'Não é possível inscrever-se em uma turma encerrada';
  END IF;
  
  -- Verificar limite de alunos
  SELECT COUNT(*) INTO _student_count 
  FROM public.student_classes 
  WHERE class_id = _class_id AND status = 'inscrito';
  
  IF _student_count >= COALESCE(_class_record.max_students, 30) THEN
    RAISE EXCEPTION 'Turma lotada. Limite de alunos atingido.';
  END IF;
  
  -- Verificar se aluno já está inscrito
  IF EXISTS (
    SELECT 1 FROM public.student_classes 
    WHERE class_id = _class_id AND student_id = _student_id
  ) THEN
    RAISE EXCEPTION 'Aluno já está inscrito nesta turma';
  END IF;
  
  -- Inscrever aluno
  INSERT INTO public.student_classes (class_id, student_id)
  VALUES (_class_id, _student_id);
  
  -- Log de auditoria
  INSERT INTO public.class_audit_logs (class_id, action, performed_by, new_data)
  VALUES (_class_id, 'student_enrolled', auth.uid(), 
    jsonb_build_object('student_id', _student_id, 'enrolled_at', now()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;