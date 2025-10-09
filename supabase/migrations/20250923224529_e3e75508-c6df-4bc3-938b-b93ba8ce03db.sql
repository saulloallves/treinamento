-- Update RLS policies for quiz table to filter by status for students

-- Drop existing student policy
DROP POLICY IF EXISTS "Students can view quiz in their turmas" ON public.quiz;

-- Create new policy that filters active quizzes for students
CREATE POLICY "Students can view active quiz in their turmas" 
ON public.quiz 
FOR SELECT 
USING (
  status = 'ativo' AND (
    (EXISTS ( 
      SELECT 1 
      FROM enrollments e 
      WHERE e.user_id = auth.uid() 
        AND e.turma_id = quiz.turma_id
    )) OR (
      turma_id IS NULL AND (EXISTS ( 
        SELECT 1 
        FROM enrollments e 
        WHERE e.user_id = auth.uid() 
          AND e.course_id = quiz.course_id
      ))
    )
  )
);