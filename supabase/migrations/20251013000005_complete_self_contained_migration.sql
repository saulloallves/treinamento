-- SELF-CONTAINED MIGRATION: Complete database setup in one file
-- This migration is fully self-contained and doesn't depend on other migrations
-- It will create schema, extensions, ENUMs, and all tables in the correct order

-- Ensure the treinamento schema exists
CREATE SCHEMA IF NOT EXISTS treinamento;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- DROP existing tables in reverse dependency order
DROP TABLE IF EXISTS treinamento.test_responses CASCADE;
DROP TABLE IF EXISTS treinamento.test_submissions CASCADE;
DROP TABLE IF EXISTS treinamento.test_question_options CASCADE;
DROP TABLE IF EXISTS treinamento.test_questions CASCADE;
DROP TABLE IF EXISTS treinamento.tests CASCADE;
DROP TABLE IF EXISTS treinamento.whatsapp_dispatches CASCADE;
DROP TABLE IF EXISTS treinamento.transformation_kanban CASCADE;
DROP TABLE IF EXISTS treinamento.recorded_lessons CASCADE;
DROP TABLE IF EXISTS treinamento.quiz_responses CASCADE;
DROP TABLE IF EXISTS treinamento.quiz CASCADE;
DROP TABLE IF EXISTS treinamento.student_progress CASCADE;
DROP TABLE IF EXISTS treinamento.student_classes CASCADE;
DROP TABLE IF EXISTS treinamento.live_participants CASCADE;
DROP TABLE IF EXISTS treinamento.lesson_sessions CASCADE;
DROP TABLE IF EXISTS treinamento.professor_turma_permissions CASCADE;
DROP TABLE IF EXISTS treinamento.professor_permissions CASCADE;
DROP TABLE IF EXISTS treinamento.password_sync_queue CASCADE;
DROP TABLE IF EXISTS treinamento.automated_lesson_dispatches CASCADE;
DROP TABLE IF EXISTS treinamento.class_audit_logs CASCADE;
DROP TABLE IF EXISTS treinamento.classes CASCADE;
DROP TABLE IF EXISTS treinamento.attendance CASCADE;
DROP TABLE IF EXISTS treinamento.certificates CASCADE;
DROP TABLE IF EXISTS treinamento.collaboration_approvals CASCADE;
DROP TABLE IF EXISTS treinamento.lessons CASCADE;
DROP TABLE IF EXISTS treinamento.enrollments CASCADE;
DROP TABLE IF EXISTS treinamento.turmas CASCADE;
DROP TABLE IF EXISTS treinamento.course_position_access CASCADE;
DROP TABLE IF EXISTS treinamento.users CASCADE;
DROP TABLE IF EXISTS treinamento.profiles CASCADE;
DROP TABLE IF EXISTS treinamento.courses CASCADE;
DROP TABLE IF EXISTS treinamento.admin_users CASCADE;
DROP TABLE IF EXISTS treinamento.unidades CASCADE;
DROP TABLE IF EXISTS treinamento.sync_audit_log CASCADE;
DROP TABLE IF EXISTS treinamento.system_settings CASCADE;
DROP TABLE IF EXISTS treinamento.modules CASCADE;
DROP TABLE IF EXISTS treinamento.kanban_columns CASCADE;
DROP TABLE IF EXISTS treinamento.job_positions CASCADE;

-- Drop existing ENUMs
DROP TYPE IF EXISTS treinamento.test_status CASCADE;
DROP TYPE IF EXISTS treinamento.submission_status CASCADE;
DROP TYPE IF EXISTS treinamento.user_role_type CASCADE;
DROP TYPE IF EXISTS treinamento.student_class_status CASCADE;
DROP TYPE IF EXISTS treinamento.class_status CASCADE;
DROP TYPE IF EXISTS treinamento.approval_status CASCADE;
DROP TYPE IF EXISTS treinamento.system_module CASCADE;

-- Create ENUMs
CREATE TYPE treinamento.approval_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
CREATE TYPE treinamento.class_status AS ENUM ('planejada', 'iniciada', 'encerrada');
CREATE TYPE treinamento.student_class_status AS ENUM ('inscrito', 'ativo', 'concluido', 'cancelado');
CREATE TYPE treinamento.submission_status AS ENUM ('pendente', 'enviado', 'avaliado');
CREATE TYPE treinamento.system_module AS ENUM ('courses', 'lessons', 'enrollments', 'turmas', 'users', 'reports');
CREATE TYPE treinamento.test_status AS ENUM ('rascunho', 'ativo', 'arquivado');
CREATE TYPE treinamento.user_role_type AS ENUM ('Franqueado', 'Colaborador');

-- Create core tables in dependency order

-- admin_users table
CREATE TABLE treinamento.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin',
  status treinamento.approval_status DEFAULT 'pendente',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- courses table
CREATE TABLE treinamento.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tipo TEXT NOT NULL DEFAULT 'gravado',
  public_target TEXT,
  status TEXT DEFAULT 'ativo',
  duration_hours INTEGER,
  lessons_count INTEGER DEFAULT 0,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- course_position_access table
CREATE TABLE treinamento.course_position_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  position_code TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE
);

-- unidades table
CREATE TABLE treinamento.unidades (
  id TEXT PRIMARY KEY,
  id_matriz UUID,
  codigo_grupo BIGINT UNIQUE,
  grupo TEXT,
  email TEXT,
  telefone BIGINT,
  fase_loja TEXT,
  etapa_loja TEXT,
  modelo_loja TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  uf TEXT,
  cep TEXT,
  raw_payload_matriz JSONB,
  sincronizado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- users table
CREATE TABLE treinamento.users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  user_type TEXT DEFAULT 'Aluno',
  role treinamento.user_role_type,
  position TEXT,
  unit_id UUID,
  unit_code TEXT,
  unit_codes TEXT[],
  nomes_unidades TEXT,
  phone TEXT,
  cpf TEXT,
  approval_status treinamento.approval_status DEFAULT 'aprovado',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  visible_password TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- turmas table
CREATE TABLE treinamento.turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  course_id UUID NOT NULL,
  status TEXT DEFAULT 'agendada',
  description TEXT,
  capacity INTEGER,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  enrollment_open_at TIMESTAMPTZ,
  enrollment_close_at TIMESTAMPTZ,
  completion_deadline TIMESTAMPTZ,
  responsavel_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (responsavel_user_id) REFERENCES treinamento.users(id) ON DELETE SET NULL
);

-- enrollments table
CREATE TABLE treinamento.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  turma_id UUID,
  user_id UUID,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  unit_code TEXT,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Ativo',
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES treinamento.turmas(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES treinamento.users(id) ON DELETE SET NULL
);

-- lessons table
CREATE TABLE treinamento.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  turma_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER,
  lesson_date TIMESTAMPTZ,
  attendance_keyword TEXT,
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES treinamento.turmas(id) ON DELETE CASCADE
);

-- attendance table
CREATE TABLE treinamento.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  attended BOOLEAN DEFAULT false,
  attended_at TIMESTAMPTZ,
  keyword_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (enrollment_id) REFERENCES treinamento.enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES treinamento.lessons(id) ON DELETE CASCADE,
  UNIQUE(enrollment_id, lesson_id)
);

-- certificates table
CREATE TABLE treinamento.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  enrollment_id UUID NOT NULL,
  turma_id UUID,
  user_id UUID NOT NULL,
  certificate_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES treinamento.enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES treinamento.turmas(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES treinamento.users(id) ON DELETE CASCADE
);

-- collaboration_approvals table
CREATE TABLE treinamento.collaboration_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL,
  franchisee_id UUID NOT NULL,
  unit_code TEXT NOT NULL,
  status treinamento.approval_status DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (collaborator_id) REFERENCES treinamento.users(id) ON DELETE CASCADE,
  FOREIGN KEY (franchisee_id) REFERENCES treinamento.users(id) ON DELETE CASCADE
);

-- Supporting and feature tables

-- automated_lesson_dispatches table
CREATE TABLE treinamento.automated_lesson_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL,
  turma_id UUID,
  dispatch_date TIMESTAMPTZ NOT NULL,
  message_template TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (lesson_id) REFERENCES treinamento.lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES treinamento.turmas(id) ON DELETE CASCADE
);

-- class_audit_logs table
CREATE TABLE treinamento.class_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (performed_by) REFERENCES treinamento.users(id) ON DELETE SET NULL
);

-- classes table
CREATE TABLE treinamento.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status treinamento.class_status DEFAULT 'planejada',
  max_students INTEGER DEFAULT 30,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  responsible_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (responsible_id) REFERENCES treinamento.users(id) ON DELETE SET NULL
);

-- job_positions table
CREATE TABLE treinamento.job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- kanban_columns table
CREATE TABLE treinamento.kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- lesson_sessions table
CREATE TABLE treinamento.lesson_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (lesson_id) REFERENCES treinamento.lessons(id) ON DELETE CASCADE
);

-- live_participants table
CREATE TABLE treinamento.live_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (lesson_id) REFERENCES treinamento.lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES treinamento.users(id) ON DELETE CASCADE
);

-- modules table
CREATE TABLE treinamento.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- password_sync_queue table
CREATE TABLE treinamento.password_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  new_password TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  FOREIGN KEY (user_id) REFERENCES treinamento.users(id) ON DELETE CASCADE
);

-- professor_permissions table
CREATE TABLE treinamento.professor_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  enabled_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (professor_id) REFERENCES treinamento.users(id) ON DELETE CASCADE,
  UNIQUE(professor_id, module_name)
);

-- professor_turma_permissions table
CREATE TABLE treinamento.professor_turma_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL,
  turma_id UUID NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_manage_students BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (professor_id) REFERENCES treinamento.users(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES treinamento.turmas(id) ON DELETE CASCADE,
  UNIQUE(professor_id, turma_id)
);

-- profiles table
CREATE TABLE treinamento.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- quiz table
CREATE TABLE treinamento.quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  turma_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]',
  max_attempts INTEGER DEFAULT 1,
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES treinamento.turmas(id) ON DELETE CASCADE
);

-- quiz_responses table
CREATE TABLE treinamento.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL,
  user_id UUID NOT NULL,
  enrollment_id UUID,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  passed BOOLEAN,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (quiz_id) REFERENCES treinamento.quiz(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES treinamento.users(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES treinamento.enrollments(id) ON DELETE CASCADE
);

-- recorded_lessons table
CREATE TABLE treinamento.recorded_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL,
  recording_url TEXT NOT NULL,
  duration_minutes INTEGER,
  file_size_mb INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (lesson_id) REFERENCES treinamento.lessons(id) ON DELETE CASCADE
);

-- student_classes table
CREATE TABLE treinamento.student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL,
  student_id UUID NOT NULL,
  status treinamento.student_class_status DEFAULT 'inscrito',
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (class_id) REFERENCES treinamento.classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES treinamento.users(id) ON DELETE CASCADE,
  UNIQUE(class_id, student_id)
);

-- student_progress table
CREATE TABLE treinamento.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES treinamento.users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES treinamento.lessons(id) ON DELETE CASCADE,
  UNIQUE(user_id, lesson_id)
);

-- sync_audit_log table
CREATE TABLE treinamento.sync_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  operation TEXT NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- system_settings table
CREATE TABLE treinamento.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT DEFAULT 'Cresci e Perdi',
  system_description TEXT DEFAULT 'Sistema de Treinamentos',
  email_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT true,
  auto_certificate_generation BOOLEAN DEFAULT true,
  certificate_template TEXT DEFAULT 'default',
  course_approval_required BOOLEAN DEFAULT false,
  max_enrollment_per_course INTEGER,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- tests table
CREATE TABLE treinamento.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  turma_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 1,
  passing_score INTEGER DEFAULT 70,
  status treinamento.test_status DEFAULT 'rascunho',
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES treinamento.turmas(id) ON DELETE CASCADE
);

-- test_questions table
CREATE TABLE treinamento.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  points INTEGER DEFAULT 1,
  order_index INTEGER,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (test_id) REFERENCES treinamento.tests(id) ON DELETE CASCADE
);

-- test_question_options table
CREATE TABLE treinamento.test_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (question_id) REFERENCES treinamento.test_questions(id) ON DELETE CASCADE
);

-- test_submissions table
CREATE TABLE treinamento.test_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL,
  user_id UUID NOT NULL,
  enrollment_id UUID,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  passed BOOLEAN,
  attempt_number INTEGER DEFAULT 1,
  status treinamento.submission_status DEFAULT 'pendente',
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  graded_by UUID,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (test_id) REFERENCES treinamento.tests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES treinamento.users(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES treinamento.enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES treinamento.users(id) ON DELETE SET NULL
);

-- test_responses table
CREATE TABLE treinamento.test_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  question_id UUID NOT NULL,
  answer_text TEXT,
  selected_option_ids UUID[],
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (submission_id) REFERENCES treinamento.test_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES treinamento.test_questions(id) ON DELETE CASCADE
);

-- transformation_kanban table
CREATE TABLE treinamento.transformation_kanban (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  turma_id UUID,
  status TEXT NOT NULL DEFAULT 'Pronto para virar treinamento',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES treinamento.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES treinamento.turmas(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES treinamento.users(id) ON DELETE SET NULL
);

-- whatsapp_dispatches table
CREATE TABLE treinamento.whatsapp_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES treinamento.users(id) ON DELETE SET NULL
);

-- Grant permissions
GRANT USAGE ON SCHEMA treinamento TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA treinamento TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA treinamento TO postgres, anon, authenticated, service_role;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA treinamento GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA treinamento GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Insert initial system settings if none exist
INSERT INTO treinamento.system_settings (system_name, system_description)
SELECT 'Cresci e Perdi', 'Sistema de Treinamentos'
WHERE NOT EXISTS (SELECT 1 FROM treinamento.system_settings);

-- Migration completed successfully - All tables created with ENUMs