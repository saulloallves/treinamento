-- Step 1: Find all responses linked to an option of an 'essay' question and set their selected_option_id to NULL.
-- This breaks the foreign key constraint that was causing the previous error.
UPDATE treinamento.test_responses
SET selected_option_id = NULL
WHERE selected_option_id IN (
  SELECT o.id
  FROM treinamento.test_question_options AS o
  JOIN treinamento.test_questions AS q ON o.question_id = q.id
  WHERE q.question_type = 'essay'
);