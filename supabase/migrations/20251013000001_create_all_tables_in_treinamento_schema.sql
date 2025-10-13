-- Migration: Create all tables and types in treinamento schema
-- This migration is idempotent and can be run multiple times safely.
-- PHASE 1: Drop existing tables, create schema and extensions

-- Ensure the treinamento schema exists
CREATE SCHEMA IF NOT EXISTS treinamento;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PHASE 1: Drop all tables in dependency order (reverse of creation order)
-- This ensures clean recreation even if tables exist but with wrong structure

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

-- PHASE 2: Create ENUMs in treinamento schema (COMMIT required for safe usage)

-- Create approval_status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'treinamento')) THEN
    CREATE TYPE treinamento.approval_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
  END IF;
END $$;

-- Create class_status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'treinamento')) THEN
    CREATE TYPE treinamento.class_status AS ENUM ('planejada', 'iniciada', 'encerrada');
  END IF;
END $$;

-- Create student_class_status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_class_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'treinamento')) THEN
    CREATE TYPE treinamento.student_class_status AS ENUM ('inscrito', 'ativo', 'concluido', 'cancelado');
  END IF;
END $$;

-- Create submission_status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'treinamento')) THEN
    CREATE TYPE treinamento.submission_status AS ENUM ('pendente', 'enviado', 'avaliado');
  END IF;
END $$;

-- Create system_module enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_module' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'treinamento')) THEN
    CREATE TYPE treinamento.system_module AS ENUM ('courses', 'lessons', 'enrollments', 'turmas', 'users', 'reports');
  END IF;
END $$;

-- Create test_status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'treinamento')) THEN
    CREATE TYPE treinamento.test_status AS ENUM ('rascunho', 'ativo', 'arquivado');
  END IF;
END $$;

-- Create user_role_type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'treinamento')) THEN
    CREATE TYPE treinamento.user_role_type AS ENUM ('Franqueado', 'Colaborador');
  END IF;
END $$;

-- FORCE COMMIT - ENUMs must be committed before use
-- This is critical for PostgreSQL ENUM safety

-- PHASE 3: ENUMs created and committed
-- Tables will be created in the next migration file: 20251013000004_create_tables_after_enums.sql
-- This separation ensures ENUMs are properly committed before table creation

-- Migration completed successfully - ENUMs created and ready for use
-- Next step: Run 20251013000004_create_tables_after_enums.sql