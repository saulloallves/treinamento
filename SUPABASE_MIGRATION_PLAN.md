# Plano de Migração Supabase - Sistema de Treinamentos

## Informações do Projeto
- **Projeto Origem**: tctkacgbhqvkqovctrzf
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGthY2diaHF2a3FvdmN0cnpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5MTE2MywiZXhwIjoyMDcwMDY3MTYzfQ.Qt8Lh0-OYqREb8ZqvZoaNLgMI30V_jEm30CkZq5pG8M
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGthY2diaHF2a3FvdmN0cnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTExNjMsImV4cCI6MjA3MDA2NzE2M30.Knud71onMpgQdAxjl_kyotWjZq2N0g-vsvqpT9lZqy4

## Visão Geral
Este documento detalha o plano completo de migração do sistema de treinamentos para um novo projeto Supabase, mantendo todos os dados, funcionalidades e estruturas existentes.

---

## FASE 1: Preparação e Foreign Data Wrapper (FDW)

### 1.1 Configurar Foreign Data Wrapper (FDW)

O FDW permite acessar o banco de origem diretamente do banco de destino via SQL, facilitando a migração e validação de dados.

```sql
-- 1. Criar extensão postgres_fdw no projeto DESTINO
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- 2. Criar servidor remoto apontando para o projeto ORIGEM
CREATE SERVER src_branch_fdw
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (
    host 'db.tctkacgbhqvkqovctrzf.supabase.co',
    port '5432',
    dbname 'postgres'
  );

-- 3. Criar mapeamento de usuário (usar service_role_key do projeto ORIGEM)
CREATE USER MAPPING FOR postgres
  SERVER src_branch_fdw
  OPTIONS (
    user 'postgres',
    password 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGthY2diaHF2a3FvdmN0cnpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5MTE2MywiZXhwIjoyMDcwMDY3MTYzfQ.Qt8Lh0-OYqREb8ZqvZoaNLgMI30V_jEm30CkZq5pG8M'
  );

-- 4. Criar schemas para tabelas remotas
CREATE SCHEMA IF NOT EXISTS remote_data;
CREATE SCHEMA IF NOT EXISTS storage_remote;

-- 5. Importar schema auth (apenas tabela users)
IMPORT FOREIGN SCHEMA auth
  LIMIT TO (users)
  FROM SERVER src_branch_fdw
  INTO remote_data;

-- 6. Importar schema public (todas as tabelas)
IMPORT FOREIGN SCHEMA public
  FROM SERVER src_branch_fdw
  INTO remote_data;

-- 7. Importar schema storage (buckets, objects, migrations)
IMPORT FOREIGN SCHEMA storage
  LIMIT TO (buckets, objects, migrations)
  FROM SERVER src_branch_fdw
  INTO storage_remote;
```

### 1.2 Verificar Conexão FDW

```sql
-- Verificar tabelas importadas do remote_data
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'remote_data' 
ORDER BY table_name;

-- Contar registros em tabelas importantes
SELECT 
  'admin_users' as tabela, COUNT(*) as total FROM remote_data.admin_users
UNION ALL
SELECT 'users', COUNT(*) FROM remote_data.users
UNION ALL
SELECT 'courses', COUNT(*) FROM remote_data.courses
UNION ALL
SELECT 'turmas', COUNT(*) FROM remote_data.turmas
UNION ALL
SELECT 'enrollments', COUNT(*) FROM remote_data.enrollments
UNION ALL
SELECT 'lessons', COUNT(*) FROM remote_data.lessons
UNION ALL
SELECT 'attendance', COUNT(*) FROM remote_data.attendance
UNION ALL
SELECT 'quiz', COUNT(*) FROM remote_data.quiz
UNION ALL
SELECT 'tests', COUNT(*) FROM remote_data.tests;

-- Verificar storage buckets
SELECT 
  rb.id AS bucket_id,
  rb.name AS bucket_name,
  COALESCE(o_origem.cnt, 0) AS objetos_origem
FROM storage_remote.buckets rb
LEFT JOIN (
  SELECT bucket_id, COUNT(*) AS cnt
  FROM storage_remote.objects
  GROUP BY bucket_id
) o_origem ON o_origem.bucket_id = rb.id
ORDER BY rb.id;
```

### 1.3 Backup Completo (Redundância)
```bash
# Backup do banco de dados
pg_dump -h aws-0-sa-east-1.pooler.supabase.com \
  -U postgres.tctkacgbhqvkqovctrzf \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d_%H%M%S).dump

# Backup das tabelas críticas individualmente
pg_dump -h aws-0-sa-east-1.pooler.supabase.com \
  -U postgres.tctkacgbhqvkqovctrzf \
  -d postgres \
  -t public.users \
  -t public.courses \
  -t public.turmas \
  -t public.enrollments \
  -t public.lessons \
  -t public.attendance \
  -F c \
  -f backup_critical_tables_$(date +%Y%m%d_%H%M%S).dump
```

### 1.4 Documentação do Estado Atual
- [ ] Listar todas as tabelas e suas dependências
- [ ] Documentar todas as functions existentes
- [ ] Documentar todos os triggers ativos
- [ ] Listar todas as RLS policies
- [ ] Documentar Edge Functions e seus secrets
- [ ] Mapear todos os storage buckets e suas políticas

### 1.5 Inventário de Recursos via FDW

⚠️ **IMPORTANTE**: Todas as queries abaixo devem ser executadas no projeto DESTINO usando o schema remote_data.

```sql
-- Listar todas as tabelas remotas
SELECT table_name 
FROM information_schema.foreign_tables 
WHERE foreign_table_schema = 'remote_data' 
ORDER BY table_name;

-- Contar registros em cada tabela remota
DO $$
DECLARE
  r RECORD;
  v_count BIGINT;
BEGIN
  FOR r IN 
    SELECT table_name 
    FROM information_schema.foreign_tables 
    WHERE foreign_table_schema = 'remote_data'
    ORDER BY table_name
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM remote_data.%I', r.table_name) INTO v_count;
    RAISE NOTICE 'Tabela: % | Registros: %', r.table_name, v_count;
  END LOOP;
END$$;

-- Listar auth.users remotos
SELECT 
  id, 
  email, 
  created_at,
  last_sign_in_at,
  (raw_user_meta_data->>'user_type') as user_type,
  (raw_user_meta_data->>'role') as role
FROM remote_data.users
ORDER BY created_at DESC
LIMIT 10;
```
```sql
-- Listar todas as tabelas
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Listar todas as functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';

-- Listar todos os triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

## FASE 2: Criar Novo Projeto Supabase

### 2.1 Criação do Projeto
1. Acessar [Supabase Dashboard](https://app.supabase.com)
2. Criar novo projeto com as seguintes configurações:
   - **Nome**: Sistema de Treinamentos - Produção
   - **Região**: South America (São Paulo) - sa-east-1
   - **Plano**: Pro (recomendado para produção)
   - **Senha do Banco**: [Usar senha forte e armazenar com segurança]

### 2.2 Configurações Iniciais
- [ ] Anotar Project ID
- [ ] Anotar Project URL
- [ ] Anotar Anon Key
- [ ] Anotar Service Role Key
- [ ] Configurar Custom Domain (se aplicável)

### 2.3 Configurar Authentication
```
Site URL: https://seu-dominio.com
Redirect URLs:
  - https://seu-dominio.com/auth/callback
  - https://seu-dominio.com/**
  - http://localhost:5173/auth/callback (para desenvolvimento)

Email Templates:
  - Personalizar templates de confirmação
  - Personalizar templates de recuperação de senha
  - Personalizar templates de convite
```

---

## FASE 3: Migração de Schema

### 3.1 Estrutura de Tabelas

#### 3.1.1 Tabela: users
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  user_type text NOT NULL CHECK (user_type IN ('Admin', 'Professor', 'Aluno')),
  role text CHECK (role IN ('Franqueado', 'Colaborador', 'Gerente')),
  unit_code text,
  unit_codes text[],
  nomes_unidades text,
  position text,
  approval_status approval_status DEFAULT 'pendente',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  visible_password text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_unit_code ON public.users(unit_code);
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_users_active ON public.users(active);
```

#### 3.1.2 Tabela: courses
```sql
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  tipo text NOT NULL CHECK (tipo IN ('gravado', 'ao_vivo')),
  status text DEFAULT 'Em produção',
  public_target text CHECK (public_target IN ('franqueado', 'colaborador', 'ambos')),
  cover_image_url text,
  lessons_count integer DEFAULT 0,
  duration_hours integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_courses_tipo ON public.courses(tipo);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_public_target ON public.courses(public_target);
```

#### 3.1.3 Tabela: turmas
```sql
CREATE TABLE public.turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  responsavel_user_id uuid REFERENCES auth.users(id),
  status turma_status DEFAULT 'agendada',
  start_at timestamptz,
  end_at timestamptz,
  enrollment_open_at timestamptz,
  enrollment_close_at timestamptz,
  capacity integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_turmas_course_id ON public.turmas(course_id);
CREATE INDEX idx_turmas_status ON public.turmas(status);
CREATE INDEX idx_turmas_responsavel ON public.turmas(responsavel_user_id);
```

#### 3.1.4 Tabela: enrollments
```sql
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE SET NULL,
  student_name text NOT NULL,
  student_email text NOT NULL,
  student_phone text,
  unit_code text,
  progress_percentage integer DEFAULT 0,
  enrolled_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_enrollments_turma_id ON public.enrollments(turma_id);
CREATE INDEX idx_enrollments_student_email ON public.enrollments(student_email);
```

#### 3.1.5 Tabela: lessons
```sql
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  video_url text,
  duration_minutes integer,
  scheduled_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, order_index);
```

#### 3.1.6 Tabela: attendance
```sql
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  attended boolean DEFAULT true,
  attended_at timestamptz DEFAULT now(),
  keyword_used text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX idx_attendance_enrollment ON public.attendance(enrollment_id);
CREATE INDEX idx_attendance_lesson ON public.attendance(lesson_id);
```

#### 3.1.7 Tabelas Adicionais
```sql
-- admin_users
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text,
  status approval_status DEFAULT 'pending',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- unidades
CREATE TABLE public.unidades (
  id text PRIMARY KEY,
  grupo text,
  codigo_grupo integer,
  fase_loja text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- job_positions
CREATE TABLE public.job_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_code text UNIQUE NOT NULL,
  position_name text NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- course_position_access
CREATE TABLE public.course_position_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position_code text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, position_code)
);

-- collaboration_approvals
CREATE TABLE public.collaboration_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  franchisee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_code text NOT NULL,
  status approval_status DEFAULT 'pendente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- quiz tables
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  passing_score integer DEFAULT 70,
  time_limit_minutes integer,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice',
  points integer DEFAULT 1,
  order_index integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  order_index integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE CASCADE,
  score numeric(5,2),
  passed boolean,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES public.quiz_options(id),
  is_correct boolean,
  created_at timestamptz DEFAULT now()
);

-- tests tables (similar structure to quizzes)
CREATE TABLE public.tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  passing_score integer DEFAULT 70,
  time_limit_minutes integer,
  status text DEFAULT 'draft',
  available_from timestamptz,
  available_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- certificates
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE SET NULL,
  certificate_url text,
  issued_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- professor_permissions
CREATE TABLE public.professor_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_name text NOT NULL,
  can_view boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  enabled_fields jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professor_id, module_name)
);

-- professor_turma_permissions
CREATE TABLE public.professor_turma_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  can_view boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_manage_students boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professor_id, turma_id)
);

-- transformation_kanban
CREATE TABLE public.transformation_kanban (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  status text NOT NULL,
  column_order integer,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- live_sessions (para streaming)
CREATE TABLE public.live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES auth.users(id),
  session_status text DEFAULT 'scheduled',
  started_at timestamptz,
  ended_at timestamptz,
  recording_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.live_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- whatsapp_dispatches
CREATE TABLE public.whatsapp_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  message_template text NOT NULL,
  scheduled_for timestamptz,
  sent_at timestamptz,
  status text DEFAULT 'pending',
  total_recipients integer DEFAULT 0,
  successful_sends integer DEFAULT 0,
  failed_sends integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- system_settings
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name text DEFAULT 'Cresci e Perdi',
  system_description text,
  email_notifications boolean DEFAULT true,
  whatsapp_notifications boolean DEFAULT true,
  auto_certificate_generation boolean DEFAULT true,
  certificate_template text DEFAULT 'default',
  course_approval_required boolean DEFAULT false,
  max_enrollment_per_course integer,
  timezone text DEFAULT 'America/Sao_Paulo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3.2 Custom Types (ENUMs)
```sql
-- Tipos customizados
CREATE TYPE approval_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
CREATE TYPE turma_status AS ENUM ('agendada', 'em_andamento', 'encerrada', 'cancelada');
CREATE TYPE class_status AS ENUM ('planejada', 'iniciada', 'encerrada');
```

---

## FASE 4: Migração de Functions

### 4.1 Functions de Autenticação e Permissões
```sql
-- is_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = _user
      AND au.active = true
      AND au.status = 'approved'
  );
$$;

-- is_professor
CREATE OR REPLACE FUNCTION public.is_professor(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = _user
      AND u.user_type = 'Professor'
      AND u.active = true
  );
$$;

-- has_professor_permission
CREATE OR REPLACE FUNCTION public.has_professor_permission(
  _professor_id uuid,
  _module_name text,
  _permission_type text DEFAULT 'view'
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN _permission_type = 'edit' THEN 
        COALESCE((SELECT can_edit FROM professor_permissions WHERE professor_id = _professor_id AND module_name = _module_name), false)
      ELSE 
        COALESCE((SELECT can_view FROM professor_permissions WHERE professor_id = _professor_id AND module_name = _module_name), false)
    END;
$$;

-- has_professor_turma_access
CREATE OR REPLACE FUNCTION public.has_professor_turma_access(
  _professor_id uuid,
  _turma_id uuid,
  _permission_type text DEFAULT 'view'
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN _permission_type = 'edit' THEN 
        COALESCE((SELECT can_edit FROM professor_turma_permissions WHERE professor_id = _professor_id AND turma_id = _turma_id), false)
      WHEN _permission_type = 'manage_students' THEN 
        COALESCE((SELECT can_manage_students FROM professor_turma_permissions WHERE professor_id = _professor_id AND turma_id = _turma_id), false)
      ELSE 
        COALESCE((SELECT can_view FROM professor_turma_permissions WHERE professor_id = _professor_id AND turma_id = _turma_id), false)
    END;
$$;
```

### 4.2 Functions de Negócio
```sql
-- get_franchisee_position
CREATE OR REPLACE FUNCTION public.get_franchisee_position(p_unit_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_fase_loja TEXT;
BEGIN
  SELECT fase_loja INTO v_fase_loja
  FROM public.unidades
  WHERE id = p_unit_code OR grupo = p_unit_code
  LIMIT 1;
  
  CASE
    WHEN v_fase_loja = 'IMPLANTAÇÃO' THEN
      RETURN 'FRANQ_IMPLANT';
    WHEN v_fase_loja = 'OPERAÇÃO' THEN
      RETURN 'FRANQ_OPER';
    ELSE
      RETURN 'FRANQ_GERAL';
  END CASE;
END;
$$;

-- can_user_access_course
CREATE OR REPLACE FUNCTION public.can_user_access_course(
  p_user_id uuid,
  p_course_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user RECORD;
  v_course RECORD;
  v_user_position TEXT;
  v_has_access BOOLEAN := false;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN RETURN false; END IF;
  
  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;
  IF NOT FOUND THEN RETURN false; END IF;
  
  IF v_user.user_type = 'Aluno' AND v_user.role = 'Franqueado' THEN
    v_user_position := public.get_franchisee_position(v_user.unit_code);
  ELSIF v_user.user_type = 'Aluno' AND v_user.role = 'Colaborador' THEN
    v_user_position := CASE v_user.position
      WHEN 'Atendente de Loja' THEN 'ATEND_LOJA'
      WHEN 'Mídias Sociais' THEN 'MIDIAS_SOC'
      WHEN 'Operador(a) de Caixa' THEN 'OP_CAIXA'
      WHEN 'Avaliadora' THEN 'AVALIADORA'
      WHEN 'Repositor(a)' THEN 'REPOSITOR'
      WHEN 'Líder de Loja' THEN 'LIDER_LOJA'
      WHEN 'Gerente' THEN 'GERENTE'
      ELSE NULL
    END;
  ELSE
    RETURN true;
  END IF;
  
  IF v_course.public_target = 'ambos' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.course_position_access cpa
      WHERE cpa.course_id = p_course_id AND cpa.active = true
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN RETURN true; END IF;
  ELSIF v_course.public_target = 'franqueado' AND v_user.role = 'Franqueado' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.course_position_access cpa
      WHERE cpa.course_id = p_course_id AND cpa.active = true
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN RETURN true; END IF;
  ELSIF v_course.public_target = 'colaborador' AND v_user.role = 'Colaborador' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.course_position_access cpa
      WHERE cpa.course_id = p_course_id AND cpa.active = true
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN RETURN true; END IF;
  ELSE
    RETURN false;
  END IF;
  
  IF v_user_position IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.course_position_access cpa
      WHERE cpa.course_id = p_course_id 
        AND cpa.position_code = v_user_position 
        AND cpa.active = true
    ) INTO v_has_access;
    
    RETURN v_has_access;
  END IF;
  
  RETURN false;
END;
$$;

-- recalc_enrollment_progress
CREATE OR REPLACE FUNCTION public.recalc_enrollment_progress(p_enrollment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_course_id uuid;
  v_total_lessons integer;
  v_attended integer;
  v_percent integer;
BEGIN
  SELECT course_id INTO v_course_id FROM public.enrollments WHERE id = p_enrollment_id;
  IF v_course_id IS NULL THEN RETURN; END IF;

  SELECT COUNT(*) INTO v_total_lessons FROM public.lessons WHERE course_id = v_course_id;
  IF COALESCE(v_total_lessons, 0) = 0 THEN
    v_percent := 0;
  ELSE
    SELECT COUNT(*) INTO v_attended FROM public.attendance WHERE enrollment_id = p_enrollment_id;
    v_percent := FLOOR((v_attended::numeric * 100) / v_total_lessons)::int;
    IF v_percent > 100 THEN v_percent := 100; END IF;
    IF v_percent < 0 THEN v_percent := 0; END IF;
  END IF;

  UPDATE public.enrollments
  SET progress_percentage = v_percent, updated_at = now()
  WHERE id = p_enrollment_id;
END;
$$;

-- can_enroll_in_turma
CREATE OR REPLACE FUNCTION public.can_enroll_in_turma(p_user uuid, p_turma uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_course UUID;
  v_status TEXT;
  v_open TIMESTAMPTZ;
  v_close TIMESTAMPTZ;
  v_capacity INTEGER;
  v_now TIMESTAMPTZ := now();
  v_tipo TEXT;
  v_current_count INT;
  v_has_other INT;
BEGIN
  SELECT t.course_id, t.status::text, t.enrollment_open_at, t.enrollment_close_at, t.capacity, c.tipo
  INTO v_course, v_status, v_open, v_close, v_capacity, v_tipo
  FROM turmas t
  JOIN courses c ON c.id = t.course_id
  WHERE t.id = p_turma;

  IF NOT FOUND OR v_tipo <> 'ao_vivo' THEN RETURN FALSE; END IF;

  IF v_status NOT IN ('agendada', 'em_andamento') THEN RETURN FALSE; END IF;

  IF v_open IS NOT NULL AND v_close IS NOT NULL THEN
    IF NOT (v_now >= v_open AND v_now < v_close) THEN RETURN FALSE; END IF;
  END IF;

  IF v_capacity IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_count FROM enrollments e WHERE e.turma_id = p_turma;
    IF v_current_count >= v_capacity THEN RETURN FALSE; END IF;
  END IF;

  SELECT COUNT(*) INTO v_has_other
  FROM enrollments e
  WHERE e.user_id = p_user AND e.course_id = v_course AND e.turma_id IS NOT NULL;
  IF v_has_other > 0 THEN RETURN FALSE; END IF;

  RETURN TRUE;
END;
$$;

-- approve_collaborator
CREATE OR REPLACE FUNCTION public.approve_collaborator(_approval_id uuid, _approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  approval_record record;
  new_status approval_status;
BEGIN
  SELECT * INTO approval_record 
  FROM public.collaboration_approvals 
  WHERE id = _approval_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval record not found';
  END IF;
  
  IF NOT (approval_record.franchisee_id = auth.uid() OR is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  new_status := CASE WHEN _approve THEN 'aprovado'::approval_status ELSE 'rejeitado'::approval_status END;
  
  UPDATE public.collaboration_approvals
  SET status = new_status, updated_at = now()
  WHERE id = _approval_id;
  
  UPDATE public.users
  SET 
    approval_status = new_status,
    approved_by = CASE WHEN _approve THEN auth.uid() ELSE NULL END,
    approved_at = CASE WHEN _approve THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = approval_record.collaborator_id;
END;
$$;

-- get_email_by_phone
CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM public.users
  WHERE phone = p_phone AND active = true
  LIMIT 1;
  
  RETURN v_email;
END;
$$;

-- find_franchisee_by_unit_code
CREATE OR REPLACE FUNCTION public.find_franchisee_by_unit_code(_unit_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  franchisee_id uuid;
BEGIN
  SELECT id INTO franchisee_id
  FROM public.users
  WHERE (unit_code = _unit_code OR _unit_code = ANY(unit_codes))
    AND role = 'Franqueado'
    AND active = true
  LIMIT 1;
  
  RETURN franchisee_id;
END;
$$;
```

### 4.3 Functions de Gerenciamento de Turmas
```sql
-- start_turma
CREATE OR REPLACE FUNCTION public.start_turma(p_turma_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_turma_record RECORD;
BEGIN
  SELECT * INTO v_turma_record FROM public.turmas WHERE id = p_turma_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma not found';
  END IF;
  
  IF v_turma_record.status != 'agendada' THEN
    RAISE EXCEPTION 'Only scheduled turmas can be started';
  END IF;

  UPDATE public.turmas
  SET status = 'em_andamento', start_at = now(), updated_at = now()
  WHERE id = p_turma_id;
END;
$$;

-- conclude_turma
CREATE OR REPLACE FUNCTION public.conclude_turma(p_turma_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_turma_record RECORD;
BEGIN
  SELECT * INTO v_turma_record FROM public.turmas WHERE id = p_turma_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma not found';
  END IF;
  
  IF v_turma_record.status != 'em_andamento' THEN
    RAISE EXCEPTION 'Only turmas in progress can be concluded';
  END IF;

  UPDATE public.turmas
  SET status = 'encerrada', end_at = now(), updated_at = now()
  WHERE id = p_turma_id;

  INSERT INTO public.transformation_kanban (course_id, turma_id, status, created_by)
  VALUES (v_turma_record.course_id, p_turma_id, 'Pronto para virar treinamento', p_user_id);
END;
$$;

-- force_close_turma_enrollments
CREATE OR REPLACE FUNCTION public.force_close_turma_enrollments(p_turma_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_turma_record RECORD;
BEGIN
  SELECT * INTO v_turma_record FROM public.turmas WHERE id = p_turma_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma not found';
  END IF;
  
  IF NOT (is_admin(p_user_id) OR v_turma_record.responsavel_user_id = p_user_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.turmas
  SET status = 'encerrada', updated_at = now()
  WHERE id = p_turma_id;
END;
$$;
```

---

## FASE 5: Migração de Triggers

```sql
-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at
  BEFORE UPDATE ON public.turmas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para recalcular progresso ao registrar presença
CREATE OR REPLACE FUNCTION public.trg_update_progress_on_attendance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recalc_enrollment_progress(NEW.enrollment_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recalc_enrollment_progress(OLD.enrollment_id);
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trg_update_progress_on_attendance
  AFTER INSERT OR DELETE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_update_progress_on_attendance();

-- Trigger para atualizar contagem de lessons
CREATE OR REPLACE FUNCTION public.update_course_lessons_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.courses 
    SET lessons_count = (SELECT COUNT(*) FROM public.lessons WHERE course_id = OLD.course_id)
    WHERE id = OLD.course_id;
    RETURN OLD;
  ELSE
    UPDATE public.courses 
    SET lessons_count = (SELECT COUNT(*) FROM public.lessons WHERE course_id = NEW.course_id)
    WHERE id = NEW.course_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trg_update_course_lessons_count
  AFTER INSERT OR DELETE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_lessons_count();

-- Trigger para vincular enrollments ao criar usuário
CREATE OR REPLACE FUNCTION public.link_enrollments_on_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.enrollments 
  SET user_id = NEW.id
  WHERE student_email = NEW.email AND user_id IS NULL;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_link_enrollments_on_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_enrollments_on_user_creation();

-- Trigger para sincronizar nomes de unidades
CREATE OR REPLACE FUNCTION public.sync_nomes_unidades()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.unit_codes IS NOT NULL AND array_length(NEW.unit_codes, 1) > 0 THEN
    SELECT string_agg(DISTINCT u.grupo, ', ' ORDER BY u.grupo)
    INTO NEW.nomes_unidades
    FROM public.unidades u
    WHERE u.codigo_grupo::text = ANY(NEW.unit_codes) AND u.grupo IS NOT NULL;
  ELSE
    NEW.nomes_unidades := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_nomes_unidades
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_nomes_unidades();

-- Trigger para validar unit codes
CREATE OR REPLACE FUNCTION public.validate_unit_codes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invalid_codes text[];
BEGIN
  IF NEW.unit_codes IS NOT NULL AND array_length(NEW.unit_codes, 1) > 0 THEN
    SELECT array_agg(code)
    INTO invalid_codes
    FROM unnest(NEW.unit_codes) AS code
    WHERE code NOT IN (SELECT id FROM public.unidades);
    
    IF invalid_codes IS NOT NULL AND array_length(invalid_codes, 1) > 0 THEN
      RAISE EXCEPTION 'Código(s) de unidade inválido(s): %. Cadastro não aprovado.', 
        array_to_string(invalid_codes, ', ');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_unit_codes
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_unit_codes();

-- Trigger para preencher unit_code em enrollments
CREATE OR REPLACE FUNCTION public.fill_enrollment_unit_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    SELECT unit_code INTO NEW.unit_code 
    FROM public.users 
    WHERE id = NEW.user_id;
  END IF;
  
  IF NEW.unit_code IS NULL AND NEW.student_email IS NOT NULL THEN
    SELECT unit_code INTO NEW.unit_code 
    FROM public.users 
    WHERE email = NEW.student_email 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fill_enrollment_unit_code
  BEFORE INSERT OR UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.fill_enrollment_unit_code();
```

---

## FASE 6: Row Level Security (RLS)

### 6.1 Habilitar RLS em Todas as Tabelas
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_position_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_turma_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformation_kanban ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
```

### 6.2 Policies para Tabela users
```sql
-- Admins podem ver e modificar todos os usuários
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil (campos limitados)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Professores podem ver usuários (para gerenciamento de turmas)
CREATE POLICY "Professors can view users"
  ON public.users FOR SELECT
  USING (is_professor(auth.uid()));

-- Franqueados podem ver colaboradores de suas unidades
CREATE POLICY "Franchisees can view their unit collaborators"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users franchisee
      WHERE franchisee.id = auth.uid()
        AND franchisee.role = 'Franqueado'
        AND (
          franchisee.unit_code = users.unit_code
          OR users.unit_code = ANY(franchisee.unit_codes)
        )
    )
  );
```

### 6.3 Policies para Tabela courses
```sql
-- Admins têm acesso completo
CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (is_admin(auth.uid()));

-- Professores podem ver todos os cursos
CREATE POLICY "Professors can view courses"
  ON public.courses FOR SELECT
  USING (is_professor(auth.uid()));

-- Alunos podem ver cursos aos quais têm acesso
CREATE POLICY "Students can view accessible courses"
  ON public.courses FOR SELECT
  USING (can_user_access_course(auth.uid(), id));
```

### 6.4 Policies para Tabela turmas
```sql
-- Admins têm acesso completo
CREATE POLICY "Admins can manage turmas"
  ON public.turmas FOR ALL
  USING (is_admin(auth.uid()));

-- Professores responsáveis podem gerenciar suas turmas
CREATE POLICY "Responsible professors can manage turmas"
  ON public.turmas FOR ALL
  USING (responsavel_user_id = auth.uid());

-- Professores com permissão podem ver turmas específicas
CREATE POLICY "Professors can view permitted turmas"
  ON public.turmas FOR SELECT
  USING (
    is_professor(auth.uid()) AND
    has_professor_turma_access(auth.uid(), id, 'view')
  );

-- Alunos podem ver turmas em que estão inscritos
CREATE POLICY "Students can view their turmas"
  ON public.turmas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.turma_id = id
        AND e.user_id = auth.uid()
    )
  );

-- Alunos podem ver turmas disponíveis para inscrição
CREATE POLICY "Students can view available turmas"
  ON public.turmas FOR SELECT
  USING (
    status IN ('agendada', 'em_andamento') AND
    can_enroll_in_turma(auth.uid(), id)
  );
```

### 6.5 Policies para Tabela enrollments
```sql
-- Admins têm acesso completo
CREATE POLICY "Admins can manage enrollments"
  ON public.enrollments FOR ALL
  USING (is_admin(auth.uid()));

-- Professores podem ver enrollments de suas turmas
CREATE POLICY "Professors can view turma enrollments"
  ON public.enrollments FOR SELECT
  USING (
    is_professor(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.turmas t
      WHERE t.id = turma_id
        AND (
          t.responsavel_user_id = auth.uid()
          OR has_professor_turma_access(auth.uid(), t.id, 'view')
        )
    )
  );

-- Alunos podem ver suas próprias inscrições
CREATE POLICY "Students can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (user_id = auth.uid());

-- Alunos podem criar inscrições para si mesmos
CREATE POLICY "Students can create own enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Alunos podem atualizar suas próprias inscrições (campos limitados)
CREATE POLICY "Students can update own enrollments"
  ON public.enrollments FOR UPDATE
  USING (user_id = auth.uid());
```

### 6.6 Policies para Tabela lessons
```sql
-- Admins têm acesso completo
CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL
  USING (is_admin(auth.uid()));

-- Professores podem gerenciar lessons
CREATE POLICY "Professors can manage lessons"
  ON public.lessons FOR ALL
  USING (is_professor(auth.uid()));

-- Alunos podem ver lessons de cursos aos quais têm acesso
CREATE POLICY "Students can view course lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = lessons.course_id
        AND e.user_id = auth.uid()
    )
  );
```

### 6.7 Policies para Tabela attendance
```sql
-- Admins têm acesso completo
CREATE POLICY "Admins can manage attendance"
  ON public.attendance FOR ALL
  USING (is_admin(auth.uid()));

-- Professores podem gerenciar presença
CREATE POLICY "Professors can manage attendance"
  ON public.attendance FOR ALL
  USING (is_professor(auth.uid()));

-- Alunos podem ver sua própria presença
CREATE POLICY "Students can view own attendance"
  ON public.attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.id = enrollment_id
        AND e.user_id = auth.uid()
    )
  );

-- Alunos podem registrar sua própria presença
CREATE POLICY "Students can register own attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.id = enrollment_id
        AND e.user_id = auth.uid()
    )
  );
```

### 6.8 Policies para Tabela quizzes
```sql
-- Admins têm acesso completo
CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL
  USING (is_admin(auth.uid()));

-- Professores podem gerenciar quizzes
CREATE POLICY "Professors can manage quizzes"
  ON public.quizzes FOR ALL
  USING (is_professor(auth.uid()));

-- Alunos podem ver quizzes publicados de seus cursos
CREATE POLICY "Students can view published quizzes"
  ON public.quizzes FOR SELECT
  USING (
    status = 'published' AND
    (
      EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.course_id = quizzes.course_id
          AND e.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.turma_id = quizzes.turma_id
          AND e.user_id = auth.uid()
      )
    )
  );
```

### 6.9 Policies para Tabela certificates
```sql
-- Admins têm acesso completo
CREATE POLICY "Admins can manage certificates"
  ON public.certificates FOR ALL
  USING (is_admin(auth.uid()));

-- Professores podem ver certificados
CREATE POLICY "Professors can view certificates"
  ON public.certificates FOR SELECT
  USING (is_professor(auth.uid()));

-- Alunos podem ver seus próprios certificados
CREATE POLICY "Students can view own certificates"
  ON public.certificates FOR SELECT
  USING (user_id = auth.uid());
```

### 6.10 Policies Adicionais
```sql
-- admin_users
CREATE POLICY "Admins can manage admin users"
  ON public.admin_users FOR ALL
  USING (is_admin(auth.uid()));

-- collaboration_approvals
CREATE POLICY "Admins can manage approvals"
  ON public.collaboration_approvals FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Franchisees can manage their approvals"
  ON public.collaboration_approvals FOR ALL
  USING (franchisee_id = auth.uid());

CREATE POLICY "Collaborators can view their approval status"
  ON public.collaboration_approvals FOR SELECT
  USING (collaborator_id = auth.uid());

-- professor_permissions
CREATE POLICY "Admins can manage professor permissions"
  ON public.professor_permissions FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Professors can view own permissions"
  ON public.professor_permissions FOR SELECT
  USING (professor_id = auth.uid());

-- system_settings
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "All authenticated users can view system settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (true);

-- unidades (público para leitura)
CREATE POLICY "All authenticated users can view unidades"
  ON public.unidades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage unidades"
  ON public.unidades FOR ALL
  USING (is_admin(auth.uid()));
```

---

## FASE 7: Storage Buckets e Migração via FDW

### 7.1 Criar e Migrar Buckets via FDW

```sql
-- IMPORTANTE: Preserve o id (bucket_id), pois storage.objects referencia por id
INSERT INTO storage.buckets (
  id, name, public, avif_autodetection, file_size_limit, 
  allowed_mime_types, owner, created_at, updated_at, owner_id
)
SELECT 
  rb.id, rb.name, rb.public, rb.avif_autodetection, rb.file_size_limit,
  rb.allowed_mime_types, rb.owner, rb.created_at, rb.updated_at, rb.owner_id
FROM storage_remote.buckets rb
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  avif_autodetection = EXCLUDED.avif_autodetection,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  owner = EXCLUDED.owner,
  updated_at = EXCLUDED.updated_at,
  owner_id = EXCLUDED.owner_id;

-- Verificar buckets migrados
SELECT id, name, public, file_size_limit FROM storage.buckets;
```

### 7.2 Migrar Metadados dos Objects via FDW

```sql
-- Migrar metadados dos objetos (os arquivos físicos devem ser copiados separadamente)
INSERT INTO storage.objects (
  id, bucket_id, name, owner, created_at, updated_at, last_accessed_at,
  metadata, user_metadata, version, owner_id, level
)
SELECT
  ro.id, ro.bucket_id, ro.name, ro.owner, ro.created_at, ro.updated_at, ro.last_accessed_at,
  ro.metadata, ro.user_metadata, ro.version, ro.owner_id, ro.level
FROM storage_remote.objects ro
ON CONFLICT (id) DO UPDATE
SET
  bucket_id = EXCLUDED.bucket_id,
  name = EXCLUDED.name,
  owner = EXCLUDED.owner,
  updated_at = EXCLUDED.updated_at,
  last_accessed_at = EXCLUDED.last_accessed_at,
  metadata = EXCLUDED.metadata,
  user_metadata = EXCLUDED.user_metadata,
  version = EXCLUDED.version,
  owner_id = EXCLUDED.owner_id,
  level = EXCLUDED.level;
```

### 7.3 Verificar Migração de Storage

```sql
-- Verificar contagem de buckets e objetos
SELECT 
  rb.id AS bucket_id,
  rb.name AS bucket_name,
  COALESCE(o_origem.cnt, 0) AS objetos_origem,
  COALESCE(o_dest.cnt, 0) AS objetos_destino,
  CASE 
    WHEN COALESCE(o_origem.cnt, 0) = COALESCE(o_dest.cnt, 0) THEN '✅ OK'
    ELSE '❌ DIVERGENTE'
  END AS status
FROM storage_remote.buckets rb
LEFT JOIN (
  SELECT bucket_id, COUNT(*) AS cnt
  FROM storage_remote.objects
  GROUP BY bucket_id
) o_origem ON o_origem.bucket_id = rb.id
LEFT JOIN (
  SELECT bucket_id, COUNT(*) AS cnt
  FROM storage.objects
  GROUP BY bucket_id
) o_dest ON o_dest.bucket_id = rb.id
ORDER BY rb.id;
```

### 7.4 Copiar Arquivos Físicos

⚠️ **ATENÇÃO**: A cópia física dos arquivos não pode ser feita via SQL/FDW.

**Opções para copiar arquivos físicos:**

1. **Via CLI Supabase** (recomendado para volumes grandes)
2. **Via Script TypeScript** (usando SDK do Supabase - ver seção 7.5)
3. **Manualmente via Dashboard** (apenas para testes pequenos)

### 7.5 Script para Copiar Arquivos de Storage (TypeScript)

```typescript
// migrate-storage-files.ts
import { createClient } from '@supabase/supabase-js'

const ORIGEM_URL = 'https://tctkacgbhqvkqovctrzf.supabase.co'
const ORIGEM_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGthY2diaHF2a3FvdmN0cnpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5MTE2MywiZXhwIjoyMDcwMDY3MTYzfQ.Qt8Lh0-OYqREb8ZqvZoaNLgMI30V_jEm30CkZq5pG8M'

const DESTINO_URL = 'https://NEW_PROJECT_ID.supabase.co'
const DESTINO_KEY = 'YOUR_NEW_SERVICE_ROLE_KEY'

const supabaseOrigem = createClient(ORIGEM_URL, ORIGEM_KEY)
const supabaseDestino = createClient(DESTINO_URL, DESTINO_KEY)

async function copyStorageFiles(bucketName: string) {
  console.log(`🔄 Iniciando cópia de arquivos do bucket: ${bucketName}`)
  
  // Listar todos os arquivos do bucket de origem
  const { data: files, error } = await supabaseOrigem
    .storage
    .from(bucketName)
    .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })

  if (error) {
    console.error(`❌ Erro ao listar arquivos: ${error.message}`)
    return
  }

  console.log(`📋 Encontrados ${files.length} arquivos`)

  for (const file of files) {
    try {
      // Download do arquivo de origem
      const { data: fileData, error: downloadError } = await supabaseOrigem
        .storage
        .from(bucketName)
        .download(file.name)

      if (downloadError) {
        console.error(`❌ Erro ao baixar ${file.name}: ${downloadError.message}`)
        continue
      }

      // Upload para destino
      const { error: uploadError } = await supabaseDestino
        .storage
        .from(bucketName)
        .upload(file.name, fileData, {
          contentType: file.metadata?.mimetype,
          upsert: true
        })

      if (uploadError) {
        console.error(`❌ Erro ao fazer upload de ${file.name}: ${uploadError.message}`)
      } else {
        console.log(`✅ Arquivo copiado: ${file.name}`)
      }
    } catch (err) {
      console.error(`❌ Erro ao processar ${file.name}:`, err)
    }
  }

  console.log(`✅ Cópia concluída para o bucket: ${bucketName}`)
}

// Executar para todos os buckets
async function main() {
  const buckets = ['course-videos', 'course-covers', 'test-images']
  
  for (const bucket of buckets) {
    await copyStorageFiles(bucket)
  }
  
  console.log('🎉 Migração de storage concluída!')
}

main()
```

### 7.6 Policies de Storage
```sql
-- course-videos: Admins e professores podem fazer upload
CREATE POLICY "Admins and professors can upload course videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-videos' AND
    (is_admin(auth.uid()) OR is_professor(auth.uid()))
  );

CREATE POLICY "Everyone can view course videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-videos');

-- course-covers: Admins e professores podem fazer upload
CREATE POLICY "Admins and professors can upload course covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-covers' AND
    (is_admin(auth.uid()) OR is_professor(auth.uid()))
  );

CREATE POLICY "Everyone can view course covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-covers');

-- test-images: Admins e professores podem fazer upload
CREATE POLICY "Admins and professors can upload test images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'test-images' AND
    (is_admin(auth.uid()) OR is_professor(auth.uid()))
  );

CREATE POLICY "Everyone can view test images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'test-images');

-- certificates: Apenas sistema pode fazer upload
CREATE POLICY "System can upload certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Users can view own certificates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'certificates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all certificates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'certificates' AND
    is_admin(auth.uid())
  );

-- user-avatars: Usuários podem fazer upload de seus próprios avatars
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Everyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-avatars');
```

---

## FASE 8: Edge Functions

### 8.1 Lista de Edge Functions a Migrar
1. `sync-password` - Sincronização de senhas
2. `create-admin` - Criação de administradores
3. `create-professor` - Criação de professores
4. `create-franchisee` - Criação de franqueados
5. `update-franchisee` - Atualização de franqueados
6. `reset-professor-password` - Reset de senha de professores
7. `reset-franchisee-password` - Reset de senha de franqueados
8. `create-enrollment` - Criação de inscrições
9. `whatsapp-disparo` - Disparos via WhatsApp
10. `whatsapp-scheduler` - Agendamento de mensagens
11. `notify-franchisee` - Notificações para franqueados
12. `approve-collaborator` - Aprovação de colaboradores
13. `bulk-create-franchisees` - Criação em massa de franqueados
14. `fix-email-formatting` - Correção de formato de email
15. `stream-signaling` - Sinalização para streaming
16. `turmas-window-keeper` - Manutenção de janelas de turmas

### 8.2 Configurar Secrets nas Edge Functions
```bash
# No Supabase Dashboard -> Edge Functions -> Settings
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_HOST_EMAIL=your_zoom_email

ZAPI_CLIENT_TOKEN=your_zapi_token
ZAPI_INSTANCE_ID=your_instance_id
ZAPI_TOKEN=your_zapi_token

TYPEBOT_WEBHOOK_SECRET=your_typebot_secret

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### 8.3 Exemplo de Edge Function Migrada
```typescript
// supabase/functions/sync-password/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncPasswordPayload {
  user_id: string;
  new_password: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json() as SyncPasswordPayload
    const { user_id, new_password } = payload

    if (!user_id || !new_password) {
      return new Response(
        JSON.stringify({ success: false, error: 'user_id e new_password são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new_password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'A senha deve ter pelo menos 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id)
    
    if (getUserError || !userData.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      password: new_password
    })

    if (updateAuthError) {
      return new Response(
        JSON.stringify({ success: false, error: updateAuthError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Senha sincronizada com sucesso', user_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## FASE 9: Migração de Dados via FDW

### 9.1 Estratégia de Migração

Usar o Foreign Data Wrapper (FDW) configurado na Fase 1 para migrar dados diretamente via SQL, garantindo integridade referencial e preservação de IDs.

### 9.2 Ordem de Migração (Respeitando Dependências)

**Grupos de migração:**

**Grupo 1 - Tabelas Base (sem dependências externas):**
1. `unidades`
2. `job_positions`
3. `system_settings`

**Grupo 2 - Auth e Usuários:**
4. `auth.users` (via script TypeScript - ver seção 9.3)
5. `users` (vinculado a auth.users)
6. `admin_users`

**Grupo 3 - Cursos:**
7. `courses`
8. `course_position_access`
9. `modules`

**Grupo 4 - Turmas e Aulas:**
10. `turmas`
11. `lessons`
12. `lesson_sessions`
13. `recorded_lessons`

**Grupo 5 - Inscrições e Progresso:**
14. `enrollments`
15. `attendance`
16. `student_progress`

**Grupo 6 - Avaliações:**
17. `quiz`
18. `quiz_responses`
19. `tests`
20. `test_questions`
21. `test_question_options`
22. `test_responses`
23. `test_submissions`

**Grupo 7 - Demais tabelas:**
24. `certificates`
25. `professor_permissions`
26. `professor_turma_permissions`
27. `collaboration_approvals`
28. `transformation_kanban`
29. `kanban_columns`
30. `live_participants`
31. `automated_lesson_dispatches`
32. `password_sync_queue`

### 9.3 Script de Migração de Usuários do Auth (TypeScript)
```typescript
// migrate-auth-users.ts
import { createClient } from '@supabase/supabase-js'

const sourceSupabase = createClient(
  'SOURCE_URL',
  'SOURCE_SERVICE_ROLE_KEY'
)

const targetSupabase = createClient(
  'TARGET_URL',
  'TARGET_SERVICE_ROLE_KEY'
)

async function migrateAuthUsers() {
  let page = 1
  const perPage = 1000
  let hasMore = true

  while (hasMore) {
    // Buscar usuários da origem
    const { data: users, error } = await sourceSupabase.auth.admin.listUsers({
      page,
      perPage
    })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      break
    }

    if (!users || users.users.length === 0) {
      hasMore = false
      break
    }

    // Criar usuários no destino
    for (const user of users.users) {
      try {
        const { data, error: createError } = await targetSupabase.auth.admin.createUser({
          email: user.email!,
          email_confirm: true,
          user_metadata: user.user_metadata,
          app_metadata: user.app_metadata,
          password: 'TemporaryPassword123!', // Será resetado
        })

        if (createError) {
          console.error(`Erro ao criar usuário ${user.email}:`, createError)
        } else {
          console.log(`✓ Usuário ${user.email} migrado com sucesso`)
        }
      } catch (err) {
        console.error(`Exceção ao migrar ${user.email}:`, err)
      }
    }

    page++
  }

  console.log('Migração de usuários do auth concluída!')
}

migrateAuthUsers()
```

### 9.3 Script de Migração de Dados de Tabelas
```typescript
// migrate-table-data.ts
import { createClient } from '@supabase/supabase-js'

const sourceSupabase = createClient('SOURCE_URL', 'SOURCE_SERVICE_ROLE_KEY')
const targetSupabase = createClient('TARGET_URL', 'TARGET_SERVICE_ROLE_KEY')

async function migrateTable(tableName: string, batchSize = 1000) {
  console.log(`\nIniciando migração da tabela: ${tableName}`)
  
  let offset = 0
  let hasMore = true
  let totalMigrated = 0

  while (hasMore) {
    // Buscar dados da origem
    const { data, error } = await sourceSupabase
      .from(tableName)
      .select('*')
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error(`Erro ao buscar dados de ${tableName}:`, error)
      break
    }

    if (!data || data.length === 0) {
      hasMore = false
      break
    }

    // Inserir dados no destino
    const { error: insertError } = await targetSupabase
      .from(tableName)
      .insert(data)

    if (insertError) {
      console.error(`Erro ao inserir dados em ${tableName}:`, insertError)
      // Tentar inserir um por um se houver erro no batch
      for (const row of data) {
        const { error: singleError } = await targetSupabase
          .from(tableName)
          .insert(row)
        
        if (singleError) {
          console.error(`Erro ao inserir registro individual:`, singleError, row)
        } else {
          totalMigrated++
        }
      }
    } else {
      totalMigrated += data.length
      console.log(`✓ Migrados ${data.length} registros de ${tableName} (total: ${totalMigrated})`)
    }

    offset += batchSize
  }

  console.log(`✅ Migração de ${tableName} concluída! Total: ${totalMigrated} registros`)
}

async function migrateAllTables() {
  const tables = [
    'unidades',
    'users',
    'admin_users',
    'job_positions',
    'courses',
    'course_position_access',
    'turmas',
    'lessons',
    'enrollments',
    'attendance',
    'quizzes',
    'quiz_questions',
    'quiz_options',
    'quiz_attempts',
    'quiz_responses',
    'tests',
    'certificates',
    'professor_permissions',
    'professor_turma_permissions',
    'collaboration_approvals',
    'transformation_kanban',
    'live_sessions',
    'live_participants',
    'whatsapp_dispatches',
    'system_settings'
  ]

  for (const table of tables) {
    await migrateTable(table)
    // Pequena pausa entre tabelas
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n🎉 Migração de todas as tabelas concluída!')
}

migrateAllTables()
```

### 9.4 Migração de Arquivos do Storage
```typescript
// migrate-storage.ts
import { createClient } from '@supabase/supabase-js'

const sourceSupabase = createClient('SOURCE_URL', 'SOURCE_SERVICE_ROLE_KEY')
const targetSupabase = createClient('TARGET_URL', 'TARGET_SERVICE_ROLE_KEY')

async function migrateBucket(bucketName: string) {
  console.log(`\nIniciando migração do bucket: ${bucketName}`)
  
  // Listar todos os arquivos
  const { data: files, error: listError } = await sourceSupabase
    .storage
    .from(bucketName)
    .list('', {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    })

  if (listError) {
    console.error(`Erro ao listar arquivos de ${bucketName}:`, listError)
    return
  }

  if (!files || files.length === 0) {
    console.log(`Bucket ${bucketName} está vazio`)
    return
  }

  let migrated = 0
  
  for (const file of files) {
    try {
      // Download do arquivo
      const { data: fileData, error: downloadError } = await sourceSupabase
        .storage
        .from(bucketName)
        .download(file.name)

      if (downloadError) {
        console.error(`Erro ao baixar ${file.name}:`, downloadError)
        continue
      }

      // Upload para o destino
      const { error: uploadError } = await targetSupabase
        .storage
        .from(bucketName)
        .upload(file.name, fileData, {
          contentType: file.metadata?.mimetype,
          upsert: true
        })

      if (uploadError) {
        console.error(`Erro ao fazer upload de ${file.name}:`, uploadError)
      } else {
        migrated++
        console.log(`✓ Arquivo ${file.name} migrado`)
      }
    } catch (err) {
      console.error(`Exceção ao migrar ${file.name}:`, err)
    }
  }

  console.log(`✅ Migração do bucket ${bucketName} concluída! Total: ${migrated} arquivos`)
}

async function migrateAllBuckets() {
  const buckets = [
    'course-videos',
    'course-covers',
    'test-images',
    'certificates',
    'user-avatars'
  ]

  for (const bucket of buckets) {
    await migrateBucket(bucket)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n🎉 Migração de todos os buckets concluída!')
}

migrateAllBuckets()
```

---

## FASE 10: Validação e Testes

### 10.1 Checklist de Validação Pós-Migração

#### Estrutura do Banco
- [ ] Todas as tabelas foram criadas
- [ ] Todos os índices foram criados
- [ ] Todos os custom types (ENUMs) foram criados
- [ ] Todas as foreign keys estão funcionando
- [ ] Todas as constraints estão ativas

#### Functions e Triggers
- [ ] Todas as functions foram criadas
- [ ] Todos os triggers estão ativos
- [ ] Functions de permissão (is_admin, is_professor) funcionam
- [ ] Functions de negócio (can_user_access_course, etc.) funcionam
- [ ] Triggers de atualização automática (updated_at) funcionam

#### RLS Policies
- [ ] RLS está habilitado em todas as tabelas
- [ ] Policies de admin funcionam
- [ ] Policies de professor funcionam
- [ ] Policies de aluno funcionam
- [ ] Policies de franqueado funcionam

#### Storage
- [ ] Todos os buckets foram criados
- [ ] Policies de storage funcionam
- [ ] Arquivos foram migrados corretamente
- [ ] URLs de acesso estão funcionando

#### Edge Functions
- [ ] Todas as edge functions foram deployadas
- [ ] Todos os secrets foram configurados
- [ ] Edge functions respondem corretamente
- [ ] CORS está configurado

#### Dados
- [ ] Usuários do auth foram migrados
- [ ] Dados da tabela users foram migrados
- [ ] Dados de courses foram migrados
- [ ] Dados de turmas foram migrados
- [ ] Dados de enrollments foram migrados
- [ ] Dados de lessons foram migrados
- [ ] Dados de attendance foram migrados
- [ ] Dados de quizzes foram migrados
- [ ] Dados de certificates foram migrados
- [ ] Contagem de registros coincide com origem

### 10.2 Scripts de Validação
```sql
-- Validar contagem de registros
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'turmas', COUNT(*) FROM public.turmas
UNION ALL
SELECT 'enrollments', COUNT(*) FROM public.enrollments
UNION ALL
SELECT 'lessons', COUNT(*) FROM public.lessons
UNION ALL
SELECT 'attendance', COUNT(*) FROM public.attendance
UNION ALL
SELECT 'quizzes', COUNT(*) FROM public.quizzes
UNION ALL
SELECT 'certificates', COUNT(*) FROM public.certificates
ORDER BY table_name;

-- Validar integridade referencial
SELECT 
  'enrollments sem user_id' as issue,
  COUNT(*) as count
FROM public.enrollments
WHERE user_id IS NULL
UNION ALL
SELECT 
  'enrollments com user_id inválido',
  COUNT(*)
FROM public.enrollments e
LEFT JOIN public.users u ON u.id = e.user_id
WHERE e.user_id IS NOT NULL AND u.id IS NULL
UNION ALL
SELECT 
  'lessons sem course_id válido',
  COUNT(*)
FROM public.lessons l
LEFT JOIN public.courses c ON c.id = l.course_id
WHERE c.id IS NULL
UNION ALL
SELECT 
  'turmas sem course_id válido',
  COUNT(*)
FROM public.turmas t
LEFT JOIN public.courses c ON c.id = t.course_id
WHERE c.id IS NULL;

-- Validar functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Validar triggers
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Validar RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Testar permissions functions
SELECT 
  'Admin check' as test,
  is_admin('USER_ID_HERE'::uuid) as result
UNION ALL
SELECT 
  'Professor check',
  is_professor('USER_ID_HERE'::uuid)
UNION ALL
SELECT
  'Course access check',
  can_user_access_course('USER_ID_HERE'::uuid, 'COURSE_ID_HERE'::uuid);
```

### 10.3 Testes de Aplicação
1. **Teste de Login**
   - Fazer login como Admin
   - Fazer login como Professor
   - Fazer login como Aluno (Franqueado)
   - Fazer login como Aluno (Colaborador)

2. **Teste de Permissões**
   - Verificar acesso do admin a todas as páginas
   - Verificar restrições do professor
   - Verificar restrições do aluno

3. **Teste de CRUD**
   - Criar/Editar/Excluir Course
   - Criar/Editar/Excluir Turma
   - Criar/Editar/Excluir Lesson
   - Criar enrollment
   - Registrar attendance

4. **Teste de Edge Functions**
   - Testar criação de usuário
   - Testar reset de senha
   - Testar envio de WhatsApp
   - Testar aprovação de colaborador

5. **Teste de Storage**
   - Upload de cover de curso
   - Upload de vídeo de lesson
   - Download de certificado

---

## FASE 11: Configuração da Aplicação Frontend

### 11.1 Atualizar Variáveis de Ambiente
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://NEW_PROJECT_ID.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "NEW_ANON_KEY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### 11.2 Atualizar Edge Function URLs
- Verificar se todas as chamadas de edge functions estão usando o novo projeto
- Atualizar URLs se necessário
- Testar todas as chamadas

### 11.3 Configurar Email Templates
No Supabase Dashboard -> Authentication -> Email Templates:

1. **Confirm signup**
```html
<h2>Confirme seu cadastro</h2>
<p>Obrigado por se cadastrar no Sistema de Treinamentos!</p>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar email</a></p>
```

2. **Reset password**
```html
<h2>Redefinição de senha</h2>
<p>Você solicitou a redefinição de sua senha.</p>
<p>Clique no link abaixo para criar uma nova senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir senha</a></p>
<p>Se você não solicitou esta redefinição, ignore este email.</p>
```

3. **Magic Link**
```html
<h2>Link de acesso</h2>
<p>Clique no link abaixo para acessar sua conta:</p>
<p><a href="{{ .ConfirmationURL }}">Acessar sistema</a></p>
```

### 11.4 Configurar Redirect URLs
No Supabase Dashboard -> Authentication -> URL Configuration:

**Site URL:**
```
https://seu-dominio-producao.com
```

**Redirect URLs:**
```
https://seu-dominio-producao.com/**
https://seu-dominio-staging.com/** (se houver)
http://localhost:5173/** (para desenvolvimento)
```

---

## FASE 12: Cutover e Go-Live

### 12.1 Plano de Cutover (4 horas de janela)

#### Hora 0: Início (00:00)
- [ ] Notificar todos os usuários sobre manutenção
- [ ] Colocar sistema em modo manutenção
- [ ] Fazer backup final do sistema antigo
- [ ] Exportar logs recentes

#### Hora 0:30 (00:30)
- [ ] Executar migração final de dados incrementais
- [ ] Validar contagem de registros
- [ ] Executar scripts de validação

#### Hora 1:00 (01:00)
- [ ] Atualizar configurações de DNS (se aplicável)
- [ ] Atualizar frontend para apontar para novo Supabase
- [ ] Deploy da aplicação atualizada

#### Hora 1:30 (01:30)
- [ ] Testes de smoke completos
- [ ] Testar fluxo de login
- [ ] Testar criação de enrollment
- [ ] Testar registro de attendance
- [ ] Testar edge functions críticas

#### Hora 2:00 (02:00)
- [ ] Liberar acesso para grupo de teste (beta testers)
- [ ] Monitorar logs em tempo real
- [ ] Validar performance
- [ ] Verificar edge function logs

#### Hora 2:30 (02:30)
- [ ] Resolver quaisquer issues identificados
- [ ] Revalidar funcionalidades críticas
- [ ] Preparar para liberação geral

#### Hora 3:00 (03:00)
- [ ] Liberar sistema para todos os usuários
- [ ] Remover página de manutenção
- [ ] Enviar comunicação de sistema restabelecido
- [ ] Monitoramento intensivo por 24h

#### Hora 3:30 (03:30)
- [ ] Documentar issues encontrados
- [ ] Finalizar documentação de migração
- [ ] Celebrar! 🎉

### 12.2 Rollback Plan (Se necessário)
1. **Identificação de problema crítico** (Dentro de 1h do go-live)
   - Colocar sistema em manutenção novamente
   - Reverter configuração do frontend para projeto antigo
   - Reverter DNS (se alterado)
   - Comunicar usuários sobre o rollback

2. **Análise do problema**
   - Coletar logs e evidências
   - Identificar causa raiz
   - Documentar problema

3. **Correção e Nova Tentativa**
   - Corrigir problema identificado
   - Agendar nova janela de migração
   - Executar novamente o plano de cutover

### 12.3 Monitoramento Pós-Migração (Primeiras 48h)

**Métricas a Monitorar:**
- Taxa de sucesso de login
- Tempo de resposta das APIs
- Erros em edge functions
- Performance de queries
- Uso de storage
- Taxa de erro geral

**Dashboards:**
- Supabase Dashboard -> Logs
- Supabase Dashboard -> Database Performance
- Supabase Dashboard -> Edge Functions Logs
- Google Analytics (se configurado)

**Alertas:**
- [ ] Configurar alerta para taxa de erro > 5%
- [ ] Configurar alerta para tempo de resposta > 2s
- [ ] Configurar alerta para edge function failures
- [ ] Configurar alerta para storage quota

---

## FASE 13: Otimizações Pós-Migração

### 13.1 Performance
```sql
-- Analisar queries lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;

-- Adicionar índices adicionais se necessário
CREATE INDEX CONCURRENTLY idx_enrollments_user_course 
  ON public.enrollments(user_id, course_id);

CREATE INDEX CONCURRENTLY idx_attendance_enrollment_lesson 
  ON public.attendance(enrollment_id, lesson_id);

CREATE INDEX CONCURRENTLY idx_quiz_attempts_user_quiz 
  ON public.quiz_attempts(user_id, quiz_id);
```

### 13.2 Limpeza
```sql
-- Remover dados de teste (se houver)
DELETE FROM public.users WHERE email LIKE '%@teste.com';

-- Vacuum e analyze
VACUUM ANALYZE public.users;
VACUUM ANALYZE public.enrollments;
VACUUM ANALYZE public.courses;
VACUUM ANALYZE public.turmas;
```

### 13.3 Documentação Final
- [ ] Atualizar README.md com novas configurações
- [ ] Documentar processo de migração completo
- [ ] Criar guia de troubleshooting
- [ ] Atualizar documentação de APIs
- [ ] Documentar mudanças de configuração

---

## Apêndices

### A. Comandos Úteis

#### Backup
```bash
# Backup completo
pg_dump -h HOST -U USER -d DATABASE -F c -f backup.dump

# Backup de tabela específica
pg_dump -h HOST -U USER -d DATABASE -t public.users -F c -f users_backup.dump

# Restore
pg_restore -h HOST -U USER -d DATABASE -c backup.dump
```

#### Supabase CLI
```bash
# Login
supabase login

# Link projeto
supabase link --project-ref NEW_PROJECT_ID

# Pull schema
supabase db pull

# Push migrations
supabase db push

# Deploy edge functions
supabase functions deploy function-name

# View logs
supabase functions logs function-name
```

### B. Contatos de Suporte
- **Supabase Support**: support@supabase.com
- **Supabase Discord**: https://discord.supabase.com
- **Documentação**: https://supabase.com/docs

### C. Recursos Adicionais
- [Guia de Migração Oficial](https://supabase.com/docs/guides/database/migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Storage](https://supabase.com/docs/guides/storage)

---

## Conclusão

Este plano de migração foi desenvolvido para garantir uma transição suave e segura do sistema de treinamentos para um novo projeto Supabase. Seguindo todas as fases e verificações, o sistema estará completamente funcional no novo ambiente com todos os dados, funcionalidades e configurações preservadas.

**Tempo Estimado Total:** 
- Preparação e testes: 40-60 horas
- Migração de dados: 8-12 horas
- Cutover e validação: 4-6 horas
- **Total: 52-78 horas de trabalho**

**Recomendações Finais:**
1. Executar migração em horário de baixo uso
2. Ter equipe de suporte disponível durante cutover
3. Manter sistema antigo ativo por 30 dias como backup
4. Documentar todos os problemas e soluções
5. Realizar retrospectiva pós-migração

---

**Status do Documento:** ✅ Completo  
**Última Atualização:** 2025-01-09  
**Versão:** 1.0  
**Aprovado por:** _______________________  
**Data de Aprovação:** ___________________