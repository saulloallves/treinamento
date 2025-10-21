-- Step 2: Now that the responses are unlinked, delete the orphaned options from essay questions.
DELETE FROM treinamento.test_question_options
WHERE question_id IN (
  SELECT id FROM treinamento.test_questions WHERE question_type = 'essay'
);