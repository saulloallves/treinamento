-- Create enum for test status
CREATE TYPE test_status AS ENUM ('draft', 'active', 'archived');

-- Create enum for submission status  
CREATE TYPE submission_status AS ENUM ('in_progress', 'completed', 'expired');

-- Table for tests
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
  passing_percentage INTEGER NOT NULL DEFAULT 70,
  max_attempts INTEGER DEFAULT 1,
  time_limit_minutes INTEGER,
  status test_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for test questions
CREATE TABLE public.test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL DEFAULT 0,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for test question options (3 options: wrong=0, medium=1, best=2)
CREATE TABLE public.test_question_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  score_value INTEGER NOT NULL CHECK (score_value IN (0, 1, 2)),
  option_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for individual question responses
CREATE TABLE public.test_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES public.test_question_options(id),
  score_obtained INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(test_id, user_id, question_id)
);

-- Table for final test submissions
CREATE TABLE public.test_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  total_score INTEGER NOT NULL DEFAULT 0,
  max_possible_score INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  status submission_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_taken_minutes INTEGER,
  UNIQUE(test_id, user_id, attempt_number)
);

-- Enable RLS on all tables
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tests
CREATE POLICY "Admins and professors can manage tests" ON public.tests
FOR ALL USING (
  is_admin(auth.uid()) OR 
  is_professor(auth.uid()) OR
  created_by = auth.uid()
);

CREATE POLICY "Students can view active tests in their turmas" ON public.tests
FOR SELECT USING (
  status = 'active' AND
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.turma_id = tests.turma_id 
    AND e.user_id = auth.uid()
  )
);

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

-- RLS Policies for test_responses
CREATE POLICY "Users can manage their own responses" ON public.test_responses
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Test creators can view all responses" ON public.test_responses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tests t
    WHERE t.id = test_responses.test_id
    AND (is_admin(auth.uid()) OR is_professor(auth.uid()) OR t.created_by = auth.uid())
  )
);

-- RLS Policies for test_submissions
CREATE POLICY "Users can manage their own submissions" ON public.test_submissions
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Test creators can view all submissions" ON public.test_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tests t
    WHERE t.id = test_submissions.test_id
    AND (is_admin(auth.uid()) OR is_professor(auth.uid()) OR t.created_by = auth.uid())
  )
);

-- Create indexes for better performance
CREATE INDEX idx_tests_turma_id ON public.tests(turma_id);
CREATE INDEX idx_tests_course_id ON public.tests(course_id);
CREATE INDEX idx_test_questions_test_id ON public.test_questions(test_id);
CREATE INDEX idx_test_question_options_question_id ON public.test_question_options(question_id);
CREATE INDEX idx_test_responses_test_user ON public.test_responses(test_id, user_id);
CREATE INDEX idx_test_submissions_test_user ON public.test_submissions(test_id, user_id);

-- Trigger to update updated_at column
CREATE TRIGGER update_tests_updated_at
BEFORE UPDATE ON public.tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();