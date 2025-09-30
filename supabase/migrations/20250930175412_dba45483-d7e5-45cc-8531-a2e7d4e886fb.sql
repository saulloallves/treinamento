-- Deletar dados relacionados aos usuários que não são Admin/Professor
-- 1. Attendance
DELETE FROM public.attendance
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
);

-- 2. Certificates
DELETE FROM public.certificates
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
);

-- 3. Quiz responses
DELETE FROM public.quiz_responses
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
);

-- 4. Test responses
DELETE FROM public.test_responses
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
);

-- 5. Test submissions
DELETE FROM public.test_submissions
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
);

-- 6. Live participants
DELETE FROM public.live_participants
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
);

-- 7. Student progress
DELETE FROM public.student_progress
WHERE enrollment_id IN (
  SELECT id FROM public.enrollments 
  WHERE user_id NOT IN (
    SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
  )
);

-- 8. Enrollments
DELETE FROM public.enrollments
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
);

-- 9. Collaboration approvals
DELETE FROM public.collaboration_approvals
WHERE collaborator_id NOT IN (
  SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
);

-- 10. Student classes
DELETE FROM public.student_classes
WHERE student_id NOT IN (
  SELECT id FROM public.users WHERE user_type IN ('Admin', 'Professor')
);

-- 11. Finalmente, deletar os usuários
DELETE FROM public.users 
WHERE user_type NOT IN ('Admin', 'Professor');