-- Drop existing functions in 'treinamento' schema to avoid signature conflicts
DROP FUNCTION IF EXISTS treinamento.advance_turmas_close(timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS treinamento.advance_turmas_open(timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS treinamento.approve_admin_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.approve_collaborator(uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS treinamento.authenticate_with_role(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS treinamento.backfill_users_unit_code() CASCADE;
DROP FUNCTION IF EXISTS treinamento.can_enroll_in_turma(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.can_user_access_course(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.conclude_turma(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.create_class_audit_log() CASCADE;
DROP FUNCTION IF EXISTS treinamento.enroll_student_in_class(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.ensure_admin_bootstrap() CASCADE;
DROP FUNCTION IF EXISTS treinamento.fill_enrollment_unit_code() CASCADE;
DROP FUNCTION IF EXISTS treinamento.find_franchisee_by_unit_code(text) CASCADE;
DROP FUNCTION IF EXISTS treinamento.force_close_turma_enrollments(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.get_email_by_phone(text) CASCADE;
DROP FUNCTION IF EXISTS treinamento.get_franchisee_position(text) CASCADE;
DROP FUNCTION IF EXISTS treinamento.get_franchisee_unit_codes(uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.get_pending_admin_approvals() CASCADE;
DROP FUNCTION IF EXISTS treinamento.get_professor_accessible_turmas(uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.get_professor_enabled_fields(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS treinamento.get_system_settings() CASCADE;
DROP FUNCTION IF EXISTS treinamento.has_professor_permission(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS treinamento.has_professor_turma_access(uuid, uuid, text) CASCADE;
DROP FUNCTION IF EXISTS treinamento.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.is_professor(uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.link_enrollments_on_signup() CASCADE;
DROP FUNCTION IF EXISTS treinamento.link_enrollments_on_user_creation() CASCADE;
DROP FUNCTION IF EXISTS treinamento.manage_class_status(uuid, class_status) CASCADE;
DROP FUNCTION IF EXISTS treinamento.recalc_enrollment_progress(uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.reject_admin_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.start_turma(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.sync_nomes_unidades() CASCADE;
DROP FUNCTION IF EXISTS treinamento.sync_password_on_change() CASCADE;
DROP FUNCTION IF EXISTS treinamento.sync_user_password() CASCADE;
DROP FUNCTION IF EXISTS treinamento.trg_update_progress_on_attendance() CASCADE;
DROP FUNCTION IF EXISTS treinamento.update_collaboration_approvals_updated_at() CASCADE;
DROP FUNCTION IF EXISTS treinamento.update_course_lessons_count() CASCADE;
DROP FUNCTION IF EXISTS treinamento.update_job_positions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS treinamento.update_live_participants_updated_at() CASCADE;
DROP FUNCTION IF EXISTS treinamento.update_nomes_unidades() CASCADE;
DROP FUNCTION IF EXISTS treinamento.update_system_settings(jsonb) CASCADE;
DROP FUNCTION IF EXISTS treinamento.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS treinamento.upsert_unidade_from_matriz(uuid, bigint, text, text, text, text, text, text, text, text, text, text, text, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS treinamento.user_can_access_turma(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.user_can_access_turma_enrollments(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS treinamento.validate_unit_codes() CASCADE;

-- Recreate functions in 'treinamento' schema
CREATE OR REPLACE FUNCTION treinamento.advance_turmas_close(p_now timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RAISE NOTICE 'Advance turmas close called at %', p_now;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.advance_turmas_open(p_now timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RAISE NOTICE 'Advance turmas open called at %', p_now;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.approve_admin_user(admin_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
BEGIN
  IF NOT treinamento.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin access required.';
  END IF;

  UPDATE treinamento.admin_users 
  SET status = 'approved', updated_at = now()
  WHERE id = admin_user_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin user not found or already processed.';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.approve_collaborator(_approval_id uuid, _approve boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  approval_record record;
  new_status approval_status;
  is_authorized boolean := false;
BEGIN
  SELECT * INTO approval_record 
  FROM treinamento.collaboration_approvals 
  WHERE id = _approval_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval record not found';
  END IF;
  
  is_authorized := treinamento.is_admin(auth.uid());

  IF NOT is_authorized THEN
    SELECT EXISTS (
      SELECT 1
      FROM treinamento.users
      WHERE id = auth.uid()
        AND role = 'Franqueado'
        AND (
          approval_record.unit_code = ANY(unit_codes) OR
          approval_record.unit_code = unit_code
        )
    ) INTO is_authorized;
  END IF;
  
  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Access Denied. Only the franchisee or admin can approve';
  END IF;
  
  new_status := CASE WHEN _approve THEN 'aprovado'::approval_status ELSE 'rejeitado'::approval_status END;
  
  UPDATE treinamento.collaboration_approvals
  SET status = new_status, updated_at = now()
  WHERE id = _approval_id;
  
  UPDATE treinamento.users
  SET 
    approval_status = new_status,
    approved_by = CASE WHEN _approve THEN auth.uid() ELSE NULL END,
    approved_at = CASE WHEN _approve THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = approval_record.collaborator_id;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.authenticate_with_role(p_email text, p_password text, p_role text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_is_admin boolean := false;
  v_is_professor boolean := false;
  v_has_student_profile boolean := false;
  v_result jsonb;
BEGIN
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'Usuário não encontrado'
    );
  END IF;
  
  v_is_admin := treinamento.is_admin(v_user_id);
  v_is_professor := treinamento.is_professor(v_user_id);
  
  SELECT EXISTS(
    SELECT 1 FROM treinamento.users WHERE id = v_user_id
    UNION
    SELECT 1 FROM treinamento.enrollments WHERE user_id = v_user_id LIMIT 1
  ) INTO v_has_student_profile;
  
  CASE p_role
    WHEN 'Admin' THEN
      IF NOT v_is_admin THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'ROLE_NOT_GRANTED',
          'message', 'Usuário não possui permissão de administrador'
        );
      END IF;
    WHEN 'Professor' THEN
      IF NOT v_is_professor THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'ROLE_NOT_GRANTED',
          'message', 'Usuário não possui permissão de professor'
        );
      END IF;
    WHEN 'Aluno' THEN
      IF NOT v_has_student_profile THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'ROLE_NOT_GRANTED',
          'message', 'Usuário não possui perfil de estudante'
        );
      END IF;
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INVALID_ROLE',
        'message', 'Papel inválido'
      );
  END CASE;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'act_as', CASE p_role
      WHEN 'Admin' THEN 'admin'
      WHEN 'Professor' THEN 'teacher'
      WHEN 'Aluno' THEN 'student'
    END,
    'permissions', jsonb_build_object(
      'is_admin', v_is_admin,
      'is_professor', v_is_professor,
      'has_student_profile', v_has_student_profile
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.backfill_users_unit_code()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
BEGIN
  UPDATE treinamento.users u
  SET unit_code = (
    SELECT au.raw_user_meta_data ->> 'unit_code'
    FROM auth.users au
    WHERE au.id = u.id
  )
  WHERE u.unit_code IS NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.can_enroll_in_turma(p_user uuid, p_turma uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
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
  SELECT t.course_id, t.status::text, t.enrollment_open_at, t.enrollment_close_at, t.capacity,
         c.tipo
  INTO   v_course, v_status, v_open, v_close, v_capacity, v_tipo
  FROM turmas t
  JOIN courses c ON c.id = t.course_id
  WHERE t.id = p_turma;

  IF NOT FOUND OR v_tipo <> 'ao_vivo' THEN
    RETURN FALSE;
  END IF;

  IF v_status NOT IN ('agendada', 'em_andamento') THEN
    RETURN FALSE;
  END IF;

  IF v_open IS NOT NULL AND v_close IS NOT NULL THEN
    IF NOT (v_now >= v_open AND v_now < v_close) THEN
      RETURN FALSE;
    END IF;
  END IF;

  IF v_capacity IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_count
    FROM enrollments e
    WHERE e.turma_id = p_turma;
    IF v_current_count >= v_capacity THEN
      RETURN FALSE;
    END IF;
  END IF;

  SELECT COUNT(*) INTO v_has_other
  FROM enrollments e
  WHERE e.user_id = p_user
    AND e.course_id = v_course
    AND e.turma_id IS NOT NULL;
  IF v_has_other > 0 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.can_user_access_course(p_user_id uuid, p_course_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_user RECORD;
  v_course RECORD;
  v_user_position TEXT;
  v_has_access BOOLEAN := false;
BEGIN
  SELECT * INTO v_user FROM treinamento.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  SELECT * INTO v_course FROM treinamento.courses WHERE id = p_course_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF v_user.user_type = 'Aluno' AND v_user.role = 'Franqueado' THEN
    v_user_position := treinamento.get_franchisee_position(v_user.unit_code);
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
      SELECT 1 FROM treinamento.course_position_access cpa
      WHERE cpa.course_id = p_course_id AND cpa.active = true
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN
      RETURN true;
    END IF;
    
  ELSIF v_course.public_target = 'franqueado' AND v_user.role = 'Franqueado' THEN
    SELECT EXISTS(
      SELECT 1 FROM treinamento.course_position_access cpa
      WHERE cpa.course_id = p_course_id AND cpa.active = true
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN
      RETURN true;
    END IF;
    
  ELSIF v_course.public_target = 'colaborador' AND v_user.role = 'Colaborador' THEN
    SELECT EXISTS(
      SELECT 1 FROM treinamento.course_position_access cpa
      WHERE cpa.course_id = p_course_id AND cpa.active = true
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN
      RETURN true;
    END IF;
  ELSE
    RETURN false;
  END IF;
  
  IF v_user_position IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM treinamento.course_position_access cpa
      WHERE cpa.course_id = p_course_id 
        AND cpa.position_code = v_user_position 
        AND cpa.active = true
    ) INTO v_has_access;
    
    RETURN v_has_access;
  END IF;
  
  RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.conclude_turma(p_turma_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_course_id UUID;
  v_turma_record RECORD;
BEGIN
  SELECT * INTO v_turma_record FROM treinamento.turmas WHERE id = p_turma_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma not found';
  END IF;
  
  IF v_turma_record.status != 'em_andamento' THEN
    RAISE EXCEPTION 'Only turmas in progress can be concluded';
  END IF;

  UPDATE treinamento.turmas
  SET 
    status = 'encerrada', 
    end_at = now(), 
    updated_at = now()
  WHERE id = p_turma_id;

  INSERT INTO treinamento.transformation_kanban (course_id, turma_id, status, created_by)
  VALUES (v_turma_record.course_id, p_turma_id, 'Pronto para virar treinamento', p_user_id);
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.create_class_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO treinamento.class_audit_logs (class_id, action, performed_by, new_data)
    VALUES (NEW.id, 'created', auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO treinamento.class_audit_logs (class_id, action, performed_by, old_data, new_data)
    VALUES (NEW.id, 'updated', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO treinamento.class_audit_logs (class_id, action, performed_by, old_data)
    VALUES (OLD.id, 'deleted', auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.enroll_student_in_class(_class_id uuid, _student_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  _class_record RECORD;
  _student_count INTEGER;
BEGIN
  SELECT * INTO _class_record FROM treinamento.classes WHERE id = _class_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma não encontrada';
  END IF;
  
  IF _class_record.status = 'encerrada' THEN
    RAISE EXCEPTION 'Não é possível inscrever-se em uma turma encerrada';
  END IF;
  
  SELECT COUNT(*) INTO _student_count 
  FROM treinamento.student_classes 
  WHERE class_id = _class_id AND status = 'inscrito';
  
  IF _student_count >= COALESCE(_class_record.max_students, 30) THEN
    RAISE EXCEPTION 'Turma lotada. Limite de alunos atingido.';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM treinamento.student_classes 
    WHERE class_id = _class_id AND student_id = _student_id
  ) THEN
    RAISE EXCEPTION 'Aluno já está inscrito nesta turma';
  END IF;
  
  INSERT INTO treinamento.student_classes (class_id, student_id)
  VALUES (_class_id, _student_id);
  
  INSERT INTO treinamento.class_audit_logs (class_id, action, performed_by, new_data)
  VALUES (_class_id, 'student_enrolled', auth.uid(), 
    jsonb_build_object('student_id', _student_id, 'enrolled_at', now()));
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.ensure_admin_bootstrap()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count 
  FROM treinamento.admin_users 
  WHERE active = true AND status = 'approved';
  
  IF v_count > 0 THEN
    RETURN;
  END IF;
  
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.fill_enrollment_unit_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    SELECT unit_code INTO NEW.unit_code 
    FROM treinamento.users 
    WHERE id = NEW.user_id;
  END IF;
  
  IF NEW.unit_code IS NULL AND NEW.student_email IS NOT NULL THEN
    SELECT unit_code INTO NEW.unit_code 
    FROM treinamento.users 
    WHERE email = NEW.student_email 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.find_franchisee_by_unit_code(_unit_code text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  franchisee_id uuid;
BEGIN
  SELECT id INTO franchisee_id
  FROM treinamento.users
  WHERE (
    unit_code = _unit_code OR 
    _unit_code = ANY(unit_codes)
  )
    AND role = 'Franqueado'
    AND active = true
  LIMIT 1;
  
  RETURN franchisee_id;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.force_close_turma_enrollments(p_turma_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_turma_record RECORD;
BEGIN
  SELECT * INTO v_turma_record FROM treinamento.turmas WHERE id = p_turma_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma not found';
  END IF;
  
  IF NOT (treinamento.is_admin(p_user_id) OR v_turma_record.responsavel_user_id = p_user_id) THEN
    RAISE EXCEPTION 'Access denied. Only admins or responsible professors can close enrollments.';
  END IF;

  UPDATE treinamento.turmas
  SET 
    status = 'encerrada', 
    updated_at = now()
  WHERE id = p_turma_id;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.get_email_by_phone(p_phone text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM treinamento.users
  WHERE phone = p_phone
    AND active = true
  LIMIT 1;
  
  RETURN v_email;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.get_franchisee_position(p_unit_code text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_fase_loja TEXT;
BEGIN
  SELECT fase_loja INTO v_fase_loja
  FROM treinamento.unidades
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
$function$;

CREATE OR REPLACE FUNCTION treinamento.get_franchisee_unit_codes(_franchisee_id uuid)
 RETURNS text[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT COALESCE(unit_codes, ARRAY[unit_code]) 
  FROM treinamento.users 
  WHERE id = _franchisee_id 
    AND role = 'Franqueado' 
    AND active = true;
$function$;

CREATE OR REPLACE FUNCTION treinamento.get_pending_admin_approvals()
 RETURNS TABLE(id uuid, user_id uuid, name text, email text, role text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT 
    au.id,
    au.user_id,
    au.name,
    au.email,
    au.role,
    au.created_at
  FROM treinamento.admin_users au
  WHERE au.status = 'pending'
    AND au.active = true
  ORDER BY au.created_at ASC;
$function$;

CREATE OR REPLACE FUNCTION treinamento.get_professor_accessible_turmas(_professor_id uuid)
 RETURNS TABLE(turma_id uuid, turma_name text, can_view boolean, can_edit boolean, can_manage_students boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT 
    ptp.turma_id,
    t.name as turma_name,
    ptp.can_view,
    ptp.can_edit,
    ptp.can_manage_students
  FROM professor_turma_permissions ptp
  JOIN turmas t ON t.id = ptp.turma_id
  WHERE ptp.professor_id = _professor_id
    AND ptp.can_view = true
  ORDER BY t.name;
$function$;

CREATE OR REPLACE FUNCTION treinamento.get_professor_enabled_fields(_professor_id uuid, _module_name text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT COALESCE(
    (SELECT enabled_fields FROM professor_permissions WHERE professor_id = _professor_id AND module_name = _module_name),
    '{}'::jsonb
  );
$function$;

CREATE OR REPLACE FUNCTION treinamento.get_system_settings()
 RETURNS TABLE(id uuid, system_name text, system_description text, email_notifications boolean, whatsapp_notifications boolean, auto_certificate_generation boolean, certificate_template text, course_approval_required boolean, max_enrollment_per_course integer, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.system_name,
    s.system_description,
    s.email_notifications,
    s.whatsapp_notifications,
    s.auto_certificate_generation,
    s.certificate_template,
    s.course_approval_required,
    s.max_enrollment_per_course,
    s.timezone,
    s.created_at,
    s.updated_at
  FROM treinamento.system_settings s
  LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.has_professor_permission(_professor_id uuid, _module_name text, _permission_type text DEFAULT 'view'::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT 
    CASE 
      WHEN _permission_type = 'edit' THEN 
        COALESCE((SELECT can_edit FROM professor_permissions WHERE professor_id = _professor_id AND module_name = _module_name), false)
      ELSE 
        COALESCE((SELECT can_view FROM professor_permissions WHERE professor_id = _professor_id AND module_name = _module_name), false)
    END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.has_professor_turma_access(_professor_id uuid, _turma_id uuid, _permission_type text DEFAULT 'view'::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT 
    CASE 
      WHEN _permission_type = 'edit' THEN 
        COALESCE((SELECT can_edit FROM professor_turma_permissions WHERE professor_id = _professor_id AND turma_id = _turma_id), false)
      WHEN _permission_type = 'manage_students' THEN 
        COALESCE((SELECT can_manage_students FROM professor_turma_permissions WHERE professor_id = _professor_id AND turma_id = _turma_id), false)
      ELSE 
        COALESCE((SELECT can_view FROM professor_turma_permissions WHERE professor_id = _professor_id AND turma_id = _turma_id), false)
    END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.is_admin(_user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM treinamento.admin_users au
    WHERE au.user_id = _user
      AND au.active = true
      AND au.status = 'approved'
  );
$function$;

CREATE OR REPLACE FUNCTION treinamento.is_professor(_user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM treinamento.users u
    WHERE u.id = _user
      AND u.user_type = 'Professor'
      AND u.active = true
  );
$function$;

CREATE OR REPLACE FUNCTION treinamento.link_enrollments_on_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  
  UPDATE treinamento.enrollments 
  SET user_id = NEW.id
  WHERE student_email = user_email 
    AND user_id IS NULL;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.link_enrollments_on_user_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
BEGIN
  UPDATE treinamento.enrollments 
  SET user_id = NEW.id
  WHERE student_email = NEW.email 
    AND user_id IS NULL;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.manage_class_status(_class_id uuid, _new_status class_status)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  _class_record RECORD;
  _current_time TIMESTAMP WITH TIME ZONE := now();
BEGIN
  SELECT * INTO _class_record FROM treinamento.classes WHERE id = _class_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma não encontrada';
  END IF;
  
  IF NOT (treinamento.is_admin(auth.uid()) OR _class_record.responsible_id = auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas admins ou responsáveis podem alterar o status da turma.';
  END IF;
  
  IF _new_status = 'iniciada' THEN
    UPDATE treinamento.classes 
    SET status = _new_status, started_at = _current_time, updated_at = _current_time
    WHERE id = _class_id;
    
    INSERT INTO treinamento.class_audit_logs (class_id, action, performed_by, new_data)
    VALUES (_class_id, 'started', auth.uid(), jsonb_build_object('started_at', _current_time));
    
  ELSIF _new_status = 'encerrada' THEN
    UPDATE treinamento.classes 
    SET status = _new_status, ended_at = _current_time, updated_at = _current_time
    WHERE id = _class_id;
    
    UPDATE treinamento.courses 
    SET status = 'Pronto para virar treinamento', updated_at = _current_time
    WHERE id = _class_record.course_id;
    
    INSERT INTO treinamento.class_audit_logs (class_id, action, performed_by, new_data)
    VALUES (_class_id, 'ended', auth.uid(), jsonb_build_object('ended_at', _current_time));
    
  ELSE
    UPDATE treinamento.classes 
    SET status = _new_status, updated_at = _current_time
    WHERE id = _class_id;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.recalc_enrollment_progress(p_enrollment_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_course_id uuid;
  v_total_lessons integer;
  v_attended integer;
  v_percent integer;
BEGIN
  SELECT course_id INTO v_course_id FROM treinamento.enrollments WHERE id = p_enrollment_id;
  IF v_course_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_total_lessons FROM treinamento.lessons WHERE course_id = v_course_id;
  IF COALESCE(v_total_lessons, 0) = 0 THEN
    v_percent := 0;
  ELSE
    SELECT COUNT(*) INTO v_attended FROM treinamento.attendance WHERE enrollment_id = p_enrollment_id;
    v_percent := FLOOR((v_attended::numeric * 100) / v_total_lessons)::int;
    IF v_percent > 100 THEN v_percent := 100; END IF;
    IF v_percent < 0 THEN v_percent := 0; END IF;
  END IF;

  UPDATE treinamento.enrollments
  SET progress_percentage = v_percent, updated_at = now()
  WHERE id = p_enrollment_id;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.reject_admin_user(admin_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
BEGIN
  IF NOT treinamento.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin access required.';
  END IF;

  UPDATE treinamento.admin_users 
  SET status = 'rejected', active = false, updated_at = now()
  WHERE id = admin_user_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin user not found or already processed.';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.start_turma(p_turma_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_turma_record RECORD;
BEGIN
  SELECT * INTO v_turma_record FROM treinamento.turmas WHERE id = p_turma_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma not found';
  END IF;
  
  IF v_turma_record.status != 'agendada' THEN
    RAISE EXCEPTION 'Only scheduled turmas can be started';
  END IF;

  UPDATE treinamento.turmas
  SET 
    status = 'em_andamento', 
    start_at = now(), 
    updated_at = now()
  WHERE id = p_turma_id;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.sync_nomes_unidades()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
BEGIN
  IF NEW.unit_codes IS NOT NULL AND array_length(NEW.unit_codes, 1) > 0 THEN
    SELECT string_agg(DISTINCT u.grupo, ', ' ORDER BY u.grupo)
    INTO NEW.nomes_unidades
    FROM treinamento.unidades u
    WHERE u.codigo_grupo::text = ANY(NEW.unit_codes) AND u.grupo IS NOT NULL;
  ELSE
    NEW.nomes_unidades := NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.sync_password_on_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  old_password text;
  new_password text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    old_password := COALESCE(OLD.visible_password, '');
    new_password := COALESCE(NEW.visible_password, '');
    
    IF old_password = new_password THEN
      RETURN NEW;
    END IF;
  END IF;

  new_password := COALESCE(NEW.visible_password, '');
  
  IF LENGTH(new_password) < 6 THEN
    RAISE EXCEPTION 'A senha deve ter pelo menos 6 caracteres';
  END IF;

  RAISE NOTICE 'Password updated for user %', NEW.id;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.sync_user_password()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.trg_update_progress_on_attendance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM treinamento.recalc_enrollment_progress(NEW.enrollment_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM treinamento.recalc_enrollment_progress(OLD.enrollment_id);
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.update_collaboration_approvals_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.update_course_lessons_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE treinamento.courses 
    SET lessons_count = (
      SELECT COUNT(*) 
      FROM treinamento.lessons 
      WHERE course_id = OLD.course_id
    )
    WHERE id = OLD.course_id;
    RETURN OLD;
  ELSE
    UPDATE treinamento.courses 
    SET lessons_count = (
      SELECT COUNT(*) 
      FROM treinamento.lessons 
      WHERE course_id = NEW.course_id
    )
    WHERE id = NEW.course_id;
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.update_job_positions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.update_live_participants_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.update_nomes_unidades()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
BEGIN
  IF NEW.unit_codes IS NOT NULL AND array_length(NEW.unit_codes, 1) > 0 THEN
    SELECT array_to_string(array_agg(DISTINCT u.grupo ORDER BY u.grupo), ', ')
    INTO NEW.nomes_unidades
    FROM treinamento.unidades u
    WHERE u.id = ANY(NEW.unit_codes) AND u.grupo IS NOT NULL;
  ELSE
    NEW.nomes_unidades := NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.update_system_settings(settings_data jsonb)
 RETURNS TABLE(id uuid, system_name text, system_description text, email_notifications boolean, whatsapp_notifications boolean, auto_certificate_generation boolean, certificate_template text, course_approval_required boolean, max_enrollment_per_course integer, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_existing_id uuid;
BEGIN
  IF NOT treinamento.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin access required.';
  END IF;

  SELECT s.id INTO v_existing_id 
  FROM treinamento.system_settings s
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE treinamento.system_settings 
    SET 
      system_name = COALESCE((settings_data->>'system_name')::text, system_settings.system_name),
      system_description = COALESCE((settings_data->>'system_description')::text, system_settings.system_description),
      email_notifications = COALESCE((settings_data->>'email_notifications')::boolean, system_settings.email_notifications),
      whatsapp_notifications = COALESCE((settings_data->>'whatsapp_notifications')::boolean, system_settings.whatsapp_notifications),
      auto_certificate_generation = COALESCE((settings_data->>'auto_certificate_generation')::boolean, system_settings.auto_certificate_generation),
      certificate_template = COALESCE((settings_data->>'certificate_template')::text, system_settings.certificate_template),
      course_approval_required = COALESCE((settings_data->>'course_approval_required')::boolean, system_settings.course_approval_required),
      max_enrollment_per_course = (settings_data->>'max_enrollment_per_course')::integer,
      timezone = COALESCE((settings_data->>'timezone')::text, system_settings.timezone),
      updated_at = now()
    WHERE system_settings.id = v_existing_id;
  ELSE
    INSERT INTO treinamento.system_settings (
      system_name,
      system_description,
      email_notifications,
      whatsapp_notifications,
      auto_certificate_generation,
      certificate_template,
      course_approval_required,
      max_enrollment_per_course,
      timezone
    ) VALUES (
      COALESCE((settings_data->>'system_name')::text, 'Cresci e Perdi'),
      COALESCE((settings_data->>'system_description')::text, 'Sistema de Treinamentos'),
      COALESCE((settings_data->>'email_notifications')::boolean, true),
      COALESCE((settings_data->>'whatsapp_notifications')::boolean, true),
      COALESCE((settings_data->>'auto_certificate_generation')::boolean, true),
      COALESCE((settings_data->>'certificate_template')::text, 'default'),
      COALESCE((settings_data->>'course_approval_required')::boolean, false),
      (settings_data->>'max_enrollment_per_course')::integer,
      COALESCE((settings_data->>'timezone')::text, 'America/Sao_Paulo')
    );
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.system_name,
    s.system_description,
    s.email_notifications,
    s.whatsapp_notifications,
    s.auto_certificate_generation,
    s.certificate_template,
    s.course_approval_required,
    s.max_enrollment_per_course,
    s.timezone,
    s.created_at,
    s.updated_at
  FROM treinamento.system_settings s
  LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.upsert_unidade_from_matriz(p_id_matriz uuid, p_codigo_grupo bigint, p_grupo text, p_email text, p_telefone text, p_fase_loja text, p_etapa_loja text, p_modelo_loja text, p_endereco text, p_cidade text, p_estado text, p_uf text, p_cep text, p_created_at_matriz text, p_updated_at_matriz text, p_raw_payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  v_telefone_bigint BIGINT;
BEGIN
  BEGIN
    v_telefone_bigint := CAST(regexp_replace(p_telefone, '\D', '', 'g') AS BIGINT);
  EXCEPTION WHEN OTHERS THEN
    v_telefone_bigint := NULL;
  END;

  INSERT INTO treinamento.unidades (
    id, id_matriz, codigo_grupo, grupo, email, telefone, fase_loja, etapa_loja,
    modelo_loja, endereco, cidade, estado, uf, cep, raw_payload_matriz,
    sincronizado_em, created_at, updated_at
  )
  VALUES (
    p_codigo_grupo::TEXT, p_id_matriz, p_codigo_grupo, p_grupo, p_email, v_telefone_bigint, p_fase_loja, p_etapa_loja,
    p_modelo_loja, p_endereco, p_cidade, p_estado, p_uf, p_cep, p_raw_payload,
    NOW(), p_created_at_matriz::timestamp, p_updated_at_matriz::timestamp
  )
  ON CONFLICT (codigo_grupo)
  DO UPDATE SET
    id = EXCLUDED.id,
    id_matriz = EXCLUDED.id_matriz,
    grupo = EXCLUDED.grupo,
    email = EXCLUDED.email,
    telefone = EXCLUDED.telefone,
    fase_loja = EXCLUDED.fase_loja,
    etapa_loja = EXCLUDED.etapa_loja,
    modelo_loja = EXCLUDED.modelo_loja,
    endereco = EXCLUDED.endereco,
    cidade = EXCLUDED.cidade,
    estado = EXCLUDED.estado,
    uf = EXCLUDED.uf,
    cep = EXCLUDED.cep,
    raw_payload_matriz = EXCLUDED.raw_payload_matriz,
    sincronizado_em = NOW(),
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

  -- This table does not exist in the provided schema, commenting out.
  -- INSERT INTO treinamento.sync_audit_log (entity_type, entity_id, operation, raw_data)
  -- VALUES ('unidade', p_id_matriz, 'UPSERT_FROM_MATRIZ', p_raw_payload);
END;
$function$;

CREATE OR REPLACE FUNCTION treinamento.user_can_access_turma(_user_id uuid, _turma_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT 
    treinamento.is_admin(_user_id) OR
    EXISTS (
      SELECT 1 FROM treinamento.turmas t 
      WHERE t.id = _turma_id 
      AND t.responsavel_user_id = _user_id
    ) OR
    EXISTS (
      SELECT 1 FROM treinamento.enrollments e 
      WHERE e.turma_id = _turma_id 
      AND e.user_id = _user_id
    );
$function$;

CREATE OR REPLACE FUNCTION treinamento.user_can_access_turma_enrollments(_user_id uuid, _turma_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
  SELECT 
    treinamento.is_admin(_user_id) OR
    EXISTS (
      SELECT 1 FROM treinamento.turmas t 
      WHERE t.id = _turma_id 
      AND t.responsavel_user_id = _user_id
    );
$function$;

CREATE OR REPLACE FUNCTION treinamento.validate_unit_codes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'treinamento', 'public'
AS $function$
DECLARE
  invalid_codes text[];
BEGIN
  IF NEW.unit_codes IS NOT NULL AND array_length(NEW.unit_codes, 1) > 0 THEN
    SELECT array_agg(code)
    INTO invalid_codes
    FROM unnest(NEW.unit_codes) AS code
    WHERE code NOT IN (SELECT id FROM treinamento.unidades);
    
    IF invalid_codes IS NOT NULL AND array_length(invalid_codes, 1) > 0 THEN
      RAISE EXCEPTION 'Código(s) de unidade inválido(s): %. Cadastro não aprovado.', 
        array_to_string(invalid_codes, ', ');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
