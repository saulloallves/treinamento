-- Migration: Create triggers for automated functionality
-- This migration creates all triggers after tables and functions are established
-- PHASE 8: Create triggers

-- Trigger for updated_at column automation
CREATE OR REPLACE FUNCTION treinamento.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables that have this column
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON treinamento.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON treinamento.admin_users
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON treinamento.courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON treinamento.courses
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON treinamento.enrollments;
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON treinamento.enrollments
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON treinamento.lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON treinamento.lessons
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_updated_at_column();

DROP TRIGGER IF EXISTS update_turmas_updated_at ON treinamento.turmas;
CREATE TRIGGER update_turmas_updated_at
  BEFORE UPDATE ON treinamento.turmas
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON treinamento.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON treinamento.users
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_updated_at_column();

DROP TRIGGER IF EXISTS update_collaboration_approvals_updated_at ON treinamento.collaboration_approvals;
CREATE TRIGGER update_collaboration_approvals_updated_at
  BEFORE UPDATE ON treinamento.collaboration_approvals
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_collaboration_approvals_updated_at();

DROP TRIGGER IF EXISTS update_job_positions_updated_at ON treinamento.job_positions;
CREATE TRIGGER update_job_positions_updated_at
  BEFORE UPDATE ON treinamento.job_positions
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_job_positions_updated_at();

DROP TRIGGER IF EXISTS update_live_participants_updated_at ON treinamento.live_participants;
CREATE TRIGGER update_live_participants_updated_at
  BEFORE UPDATE ON treinamento.live_participants
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_live_participants_updated_at();

-- Trigger for linking enrollments when user is created
DROP TRIGGER IF EXISTS trigger_link_enrollments_on_user_creation ON treinamento.users;
CREATE TRIGGER trigger_link_enrollments_on_user_creation
  AFTER INSERT ON treinamento.users
  FOR EACH ROW EXECUTE FUNCTION treinamento.link_enrollments_on_user_creation();

-- Trigger for filling enrollment unit_code
DROP TRIGGER IF EXISTS trigger_fill_enrollment_unit_code ON treinamento.enrollments;
CREATE TRIGGER trigger_fill_enrollment_unit_code
  BEFORE INSERT OR UPDATE ON treinamento.enrollments
  FOR EACH ROW EXECUTE FUNCTION treinamento.fill_enrollment_unit_code();

-- Trigger for updating course lessons count
DROP TRIGGER IF EXISTS trigger_update_course_lessons_count_insert ON treinamento.lessons;
CREATE TRIGGER trigger_update_course_lessons_count_insert
  AFTER INSERT ON treinamento.lessons
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_course_lessons_count();

DROP TRIGGER IF EXISTS trigger_update_course_lessons_count_delete ON treinamento.lessons;
CREATE TRIGGER trigger_update_course_lessons_count_delete
  AFTER DELETE ON treinamento.lessons
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_course_lessons_count();

-- Trigger for updating progress on attendance
DROP TRIGGER IF EXISTS trigger_update_progress_on_attendance_insert ON treinamento.attendance;
CREATE TRIGGER trigger_update_progress_on_attendance_insert
  AFTER INSERT ON treinamento.attendance
  FOR EACH ROW EXECUTE FUNCTION treinamento.trg_update_progress_on_attendance();

DROP TRIGGER IF EXISTS trigger_update_progress_on_attendance_delete ON treinamento.attendance;
CREATE TRIGGER trigger_update_progress_on_attendance_delete
  AFTER DELETE ON treinamento.attendance
  FOR EACH ROW EXECUTE FUNCTION treinamento.trg_update_progress_on_attendance();

-- Trigger for syncing unit names
DROP TRIGGER IF EXISTS trigger_sync_nomes_unidades ON treinamento.users;
CREATE TRIGGER trigger_sync_nomes_unidades
  BEFORE INSERT OR UPDATE ON treinamento.users
  FOR EACH ROW EXECUTE FUNCTION treinamento.sync_nomes_unidades();

-- Trigger for updating unit names when unidades change
DROP TRIGGER IF EXISTS trigger_update_nomes_unidades ON treinamento.unidades;
CREATE TRIGGER trigger_update_nomes_unidades
  AFTER UPDATE ON treinamento.unidades
  FOR EACH ROW EXECUTE FUNCTION treinamento.update_nomes_unidades();

-- Trigger for validating unit codes
DROP TRIGGER IF EXISTS trigger_validate_unit_codes ON treinamento.users;
CREATE TRIGGER trigger_validate_unit_codes
  BEFORE INSERT OR UPDATE ON treinamento.users
  FOR EACH ROW EXECUTE FUNCTION treinamento.validate_unit_codes();

-- Trigger for password synchronization
DROP TRIGGER IF EXISTS trigger_sync_password_on_change ON treinamento.users;
CREATE TRIGGER trigger_sync_password_on_change
  AFTER UPDATE ON treinamento.users
  FOR EACH ROW EXECUTE FUNCTION treinamento.sync_password_on_change();

-- Class audit log triggers
DROP TRIGGER IF EXISTS trigger_class_audit_log_insert ON treinamento.classes;
CREATE TRIGGER trigger_class_audit_log_insert
  AFTER INSERT ON treinamento.classes
  FOR EACH ROW EXECUTE FUNCTION treinamento.create_class_audit_log();

DROP TRIGGER IF EXISTS trigger_class_audit_log_update ON treinamento.classes;
CREATE TRIGGER trigger_class_audit_log_update
  AFTER UPDATE ON treinamento.classes
  FOR EACH ROW EXECUTE FUNCTION treinamento.create_class_audit_log();

DROP TRIGGER IF EXISTS trigger_class_audit_log_delete ON treinamento.classes;
CREATE TRIGGER trigger_class_audit_log_delete
  AFTER DELETE ON treinamento.classes
  FOR EACH ROW EXECUTE FUNCTION treinamento.create_class_audit_log();

-- Migration completed successfully - Triggers created