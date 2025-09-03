-- Add enrollment window fields to turmas table
ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS enrollment_open_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS enrollment_close_at TIMESTAMP WITH TIME ZONE;

-- Function to validate if user can enroll in turma
CREATE OR REPLACE FUNCTION public.can_enroll_in_turma(p_user UUID, p_turma UUID)
RETURNS BOOLEAN AS $$
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

  -- Allow enrollment only in 'agendada' or 'em_andamento' status for now
  -- Will be enhanced with enrollment window logic later
  IF v_status NOT IN ('agendada', 'em_andamento') THEN
    RETURN FALSE;
  END IF;

  -- Check enrollment window if dates are set
  IF v_open IS NOT NULL AND v_close IS NOT NULL THEN
    IF NOT (v_now >= v_open AND v_now < v_close) THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Check capacity
  IF v_capacity IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_count
    FROM enrollments e
    WHERE e.turma_id = p_turma;
    IF v_current_count >= v_capacity THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- 1 turma per live course per user
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to open enrollments automatically
CREATE OR REPLACE FUNCTION public.advance_turmas_open(p_now TIMESTAMPTZ)
RETURNS VOID AS $$
BEGIN
  -- For now, just log the function call - will be enhanced with status updates
  RAISE NOTICE 'Advance turmas open called at %', p_now;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to close enrollments automatically  
CREATE OR REPLACE FUNCTION public.advance_turmas_close(p_now TIMESTAMPTZ)
RETURNS VOID AS $$
BEGIN
  -- For now, just log the function call - will be enhanced with status updates
  RAISE NOTICE 'Advance turmas close called at %', p_now;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to force close enrollments
CREATE OR REPLACE FUNCTION public.force_close_turma_enrollments(p_turma_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_turma_record RECORD;
BEGIN
  -- Get turma details
  SELECT * INTO v_turma_record FROM public.turmas WHERE id = p_turma_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma not found';
  END IF;
  
  -- Check permissions
  IF NOT (is_admin(p_user_id) OR v_turma_record.responsavel_user_id = p_user_id) THEN
    RAISE EXCEPTION 'Access denied. Only admins or responsible professors can close enrollments.';
  END IF;

  -- For now, just update the status to 'encerrada'
  UPDATE public.turmas
  SET 
    status = 'encerrada', 
    updated_at = now()
  WHERE id = p_turma_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;