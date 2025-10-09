-- Create test_questions table
CREATE TABLE public.test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL DEFAULT 0,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_question_options table
CREATE TABLE public.test_question_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  score_value INTEGER NOT NULL DEFAULT 0,
  option_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_question_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_questions
CREATE POLICY "Test creators can manage questions" ON public.test_questions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.tests t 
    WHERE t.id = test_questions.test_id 
    AND (is_admin(auth.uid()) OR is_professor(auth.uid()) OR t.created_by = auth.uid())
  )
);

CREATE POLICY "Students can view questions of active tests" ON public.test_questions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tests t
    JOIN public.enrollments e ON e.turma_id = t.turma_id
    WHERE t.id = test_questions.test_id 
    AND t.status = 'active'
    AND e.user_id = auth.uid()
  )
);

-- RLS Policies for test_question_options
CREATE POLICY "Test creators can manage options" ON public.test_question_options
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.test_questions tq
    JOIN public.tests t ON t.id = tq.test_id
    WHERE tq.id = test_question_options.question_id 
    AND (is_admin(auth.uid()) OR is_professor(auth.uid()) OR t.created_by = auth.uid())
  )
);

CREATE POLICY "Students can view options of active tests" ON public.test_question_options
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.test_questions tq
    JOIN public.tests t ON t.id = tq.test_id
    JOIN public.enrollments e ON e.turma_id = t.turma_id
    WHERE tq.id = test_question_options.question_id 
    AND t.status = 'active'
    AND e.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_test_questions_test_id ON public.test_questions(test_id);
CREATE INDEX idx_test_questions_order ON public.test_questions(test_id, question_order);
CREATE INDEX idx_test_question_options_question_id ON public.test_question_options(question_id);
CREATE INDEX idx_test_question_options_order ON public.test_question_options(question_id, option_order);