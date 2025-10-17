-- First, move all custom types to the 'treinamento' schema.
-- This is safe to run multiple times; it will only move types that are still in 'public'.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'approval_status' AND n.nspname = 'public') THEN
    ALTER TYPE public.approval_status SET SCHEMA treinamento;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'class_status' AND n.nspname = 'public') THEN
    ALTER TYPE public.class_status SET SCHEMA treinamento;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'student_class_status' AND n.nspname = 'public') THEN
    ALTER TYPE public.student_class_status SET SCHEMA treinamento;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'submission_status' AND n.nspname = 'public') THEN
    ALTER TYPE public.submission_status SET SCHEMA treinamento;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'system_module' AND n.nspname = 'public') THEN
    ALTER TYPE public.system_module SET SCHEMA treinamento;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'test_status' AND n.nspname = 'public') THEN
    ALTER TYPE public.test_status SET SCHEMA treinamento;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'user_role_type' AND n.nspname = 'public') THEN
    ALTER TYPE public.user_role_type SET SCHEMA treinamento;
  END IF;
END $$;

-- Then, move all tables from 'public' to 'treinamento' schema.
-- This is safe to run multiple times; it will only move tables that are still in 'public'.
DO $$
DECLARE
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(tbl_name) || ' SET SCHEMA treinamento;';
    END LOOP;
END $$;

-- Grant necessary permissions on the new schema.
GRANT USAGE ON SCHEMA treinamento TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA treinamento TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA treinamento TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA treinamento TO postgres, anon, authenticated, service_role;

-- Set the search_path for the project's roles.
ALTER ROLE authenticated SET search_path = 'treinamento', 'public', 'auth';
ALTER ROLE service_role SET search_path = 'treinamento', 'public', 'auth';
ALTER ROLE postgres SET search_path = 'treinamento', 'public', 'auth';
