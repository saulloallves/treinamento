-- Recalculate enrollment progress based on attendance records and total lessons
CREATE OR REPLACE FUNCTION public.recalc_enrollment_progress(p_enrollment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_id uuid;
  v_total_lessons integer;
  v_attended integer;
  v_percent integer;
BEGIN
  SELECT course_id INTO v_course_id FROM public.enrollments WHERE id = p_enrollment_id;
  IF v_course_id IS NULL THEN
    RETURN;
  END IF;

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

-- Trigger function to call recalculation on attendance changes
CREATE OR REPLACE FUNCTION public.trg_update_progress_on_attendance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Ensure fresh triggers
DROP TRIGGER IF EXISTS update_progress_after_attendance_ins ON public.attendance;
DROP TRIGGER IF EXISTS update_progress_after_attendance_del ON public.attendance;

CREATE TRIGGER update_progress_after_attendance_ins
AFTER INSERT ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.trg_update_progress_on_attendance();

CREATE TRIGGER update_progress_after_attendance_del
AFTER DELETE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.trg_update_progress_on_attendance();