-- Migration: Create indexes for performance optimization
-- This migration creates all indexes after tables are established
-- PHASE 7: Create indexes for performance

-- Create indexes for performance on core tables
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON treinamento.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON treinamento.admin_users(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON treinamento.admin_users(email);

CREATE INDEX IF NOT EXISTS idx_attendance_enrollment_lesson ON treinamento.attendance(enrollment_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_attendance_lesson_id ON treinamento.attendance(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attendance_attended ON treinamento.attendance(attended);

CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON treinamento.certificates(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_enrollment_id ON treinamento.certificates(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_certificates_turma_id ON treinamento.certificates(turma_id);

CREATE INDEX IF NOT EXISTS idx_collaboration_approvals_status ON treinamento.collaboration_approvals(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_approvals_collaborator ON treinamento.collaboration_approvals(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_approvals_franchisee ON treinamento.collaboration_approvals(franchisee_id);

CREATE INDEX IF NOT EXISTS idx_course_position_access_course_id ON treinamento.course_position_access(course_id);
CREATE INDEX IF NOT EXISTS idx_course_position_access_position ON treinamento.course_position_access(position_code);

CREATE INDEX IF NOT EXISTS idx_courses_tipo ON treinamento.courses(tipo);
CREATE INDEX IF NOT EXISTS idx_courses_status ON treinamento.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_public_target ON treinamento.courses(public_target);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON treinamento.enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_turma_id ON treinamento.enrollments(turma_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_email ON treinamento.enrollments(student_email);
CREATE INDEX IF NOT EXISTS idx_enrollments_unit_code ON treinamento.enrollments(unit_code);
CREATE INDEX IF NOT EXISTS idx_enrollments_progress ON treinamento.enrollments(progress_percentage);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON treinamento.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_turma_id ON treinamento.lessons(turma_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON treinamento.lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_date ON treinamento.lessons(lesson_date);
CREATE INDEX IF NOT EXISTS idx_lessons_is_live ON treinamento.lessons(is_live);

CREATE INDEX IF NOT EXISTS idx_turmas_course_id ON treinamento.turmas(course_id);
CREATE INDEX IF NOT EXISTS idx_turmas_status ON treinamento.turmas(status);
CREATE INDEX IF NOT EXISTS idx_turmas_code ON treinamento.turmas(code);
CREATE INDEX IF NOT EXISTS idx_turmas_responsavel ON treinamento.turmas(responsavel_user_id);
CREATE INDEX IF NOT EXISTS idx_turmas_dates ON treinamento.turmas(start_at, end_at);

CREATE INDEX IF NOT EXISTS idx_users_email ON treinamento.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON treinamento.users(role);
CREATE INDEX IF NOT EXISTS idx_users_unit_code ON treinamento.users(unit_code);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON treinamento.users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_active ON treinamento.users(active);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON treinamento.users(user_type);

-- Indexes for supporting tables
CREATE INDEX IF NOT EXISTS idx_classes_course_id ON treinamento.classes(course_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON treinamento.classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_responsible ON treinamento.classes(responsible_id);

CREATE INDEX IF NOT EXISTS idx_quiz_course_turma ON treinamento.quiz(course_id, turma_id);
CREATE INDEX IF NOT EXISTS idx_quiz_active ON treinamento.quiz(active);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_user ON treinamento.quiz_responses(quiz_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_enrollment ON treinamento.quiz_responses(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_tests_course_turma ON treinamento.tests(course_id, turma_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON treinamento.tests(status);

CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON treinamento.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_order ON treinamento.test_questions(order_index);

CREATE INDEX IF NOT EXISTS idx_test_submissions_test_user ON treinamento.test_submissions(test_id, user_id);
CREATE INDEX IF NOT EXISTS idx_test_submissions_status ON treinamento.test_submissions(status);

CREATE INDEX IF NOT EXISTS idx_student_progress_user_course ON treinamento.student_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_lesson ON treinamento.student_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_completed ON treinamento.student_progress(completed);

CREATE INDEX IF NOT EXISTS idx_professor_permissions_professor ON treinamento.professor_permissions(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_permissions_module ON treinamento.professor_permissions(module_name);

CREATE INDEX IF NOT EXISTS idx_professor_turma_permissions_professor ON treinamento.professor_turma_permissions(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_turma_permissions_turma ON treinamento.professor_turma_permissions(turma_id);

CREATE INDEX IF NOT EXISTS idx_unidades_codigo_grupo ON treinamento.unidades(codigo_grupo);
CREATE INDEX IF NOT EXISTS idx_unidades_fase_loja ON treinamento.unidades(fase_loja);

CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_status ON treinamento.whatsapp_dispatches(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_user ON treinamento.whatsapp_dispatches(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_phone ON treinamento.whatsapp_dispatches(phone);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_enrollments_user_turma_progress ON treinamento.enrollments(user_id, turma_id, progress_percentage);
CREATE INDEX IF NOT EXISTS idx_lessons_course_turma_order ON treinamento.lessons(course_id, turma_id, order_index);
CREATE INDEX IF NOT EXISTS idx_attendance_enrollment_attended ON treinamento.attendance(enrollment_id, attended);

-- Text search indexes for common search fields
CREATE INDEX IF NOT EXISTS idx_courses_name_text ON treinamento.courses USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_lessons_title_text ON treinamento.lessons USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS idx_users_name_text ON treinamento.users USING gin(to_tsvector('portuguese', name));

-- Migration completed successfully - Indexes created