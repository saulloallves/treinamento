-- Primeiro, vamos atualizar as turmas sem nome para terem nomes adequados
UPDATE public.turmas 
SET name = 'Turma Setembro 2025', code = 'SET25'
WHERE name IS NULL OR name = '';

-- Vamos pegar a primeira turma de setembro (ou criar uma se não existir)
INSERT INTO public.turmas (
  course_id, 
  name, 
  code, 
  status, 
  completion_deadline,
  responsavel_user_id,
  created_at
) 
SELECT DISTINCT 
  e.course_id,
  'Turma Setembro 2025',
  'SET25-' || SUBSTRING(c.name, 1, 3),
  'agendada',
  '2025-09-30'::date,
  (SELECT id FROM users WHERE user_type = 'Professor' LIMIT 1),
  now()
FROM enrollments e
JOIN courses c ON c.id = e.course_id
LEFT JOIN turmas t ON t.course_id = e.course_id AND t.name = 'Turma Setembro 2025'
WHERE t.id IS NULL
GROUP BY e.course_id, c.name;