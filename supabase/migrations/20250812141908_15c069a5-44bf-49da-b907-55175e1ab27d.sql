
-- 1) ENROLLMENTS: remover políticas permissivas e restringir
drop policy if exists "Authenticated users can view all enrollments" on public.enrollments;
drop policy if exists "Authenticated users can create enrollments" on public.enrollments;
drop policy if exists "Users can update enrollments" on public.enrollments;
drop policy if exists "Users can delete enrollments" on public.enrollments;

-- Aluno pode ver as próprias matrículas (já existe política similar; mantendo por segurança)
create policy if not exists "Students can view their own enrollments"
on public.enrollments
for select
to authenticated
using (user_id = auth.uid());

-- Franqueado/Admin já tem política; garantimos visão global
create policy if not exists "Admins can view all enrollments"
on public.enrollments
for select
to authenticated
using (is_admin(auth.uid()));

-- Criador pode ver criadas por ele (mantido para painel de franqueado)
create policy if not exists "Creators can view their created enrollments"
on public.enrollments
for select
to authenticated
using (created_by = auth.uid());

-- Inserção: aluno só cria matrícula para si mesmo
create policy "Students can self-enroll"
on public.enrollments
for insert
to authenticated
with check (user_id = auth.uid());

-- Inserção: admin pode criar matrículas (ex.: manuais)
create policy "Admins can create enrollments"
on public.enrollments
for insert
to authenticated
with check (is_admin(auth.uid()));

-- Gestão: admin/franqueado pode gerenciar
create policy "Admins can manage enrollments"
on public.enrollments
for all
to authenticated
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

-- Criador pode gerenciar o que criou (para operacional)
create policy "Creators can manage their created enrollments"
on public.enrollments
for all
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());



-- 2) STUDENT_PROGRESS: restringir visibilidade e gestão ao dono/admin
drop policy if exists "Users can view all student progress" on public.student_progress;
drop policy if exists "Authenticated users can manage student progress" on public.student_progress;

create policy "Students can view their own progress"
on public.student_progress
for select
to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.id = student_progress.enrollment_id
      and e.user_id = auth.uid()
  )
);

create policy "Admins can view all student progress"
on public.student_progress
for select
to authenticated
using (is_admin(auth.uid()));

create policy "Students can manage their own progress"
on public.student_progress
for all
to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.id = student_progress.enrollment_id
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.enrollments e
    where e.id = student_progress.enrollment_id
      and e.user_id = auth.uid()
  )
);

create policy "Admins can manage all student progress"
on public.student_progress
for all
to authenticated
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));



-- 3) ATTENDANCE: privacidade, unicidade e vínculo com matrícula/aula
drop policy if exists "Anyone can view attendance" on public.attendance;
drop policy if exists "Admins can manage attendance" on public.attendance;

-- Evitar presença duplicada por aula/matrícula
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_unique'
  ) then
    alter table public.attendance
      add constraint attendance_unique unique (enrollment_id, lesson_id);
  end if;
end$$;

create policy "Students can view their own attendance"
on public.attendance
for select
to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.id = attendance.enrollment_id
      and e.user_id = auth.uid()
  )
);

create policy "Admins can view all attendance"
on public.attendance
for select
to authenticated
using (is_admin(auth.uid()));

create policy "Students can create their own attendance"
on public.attendance
for insert
to authenticated
with check (
  exists (
    select 1
    from public.enrollments e
    join public.lessons l on l.course_id = e.course_id
    where e.id = attendance.enrollment_id
      and e.user_id = auth.uid()
      and l.id = attendance.lesson_id
  )
);

create policy "Admins can manage attendance"
on public.attendance
for all
to authenticated
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));



-- 4) CERTIFICATES: privacidade e unicidade por matrícula
drop policy if exists "Anyone can view certificates" on public.certificates;
drop policy if exists "Admins can manage certificates" on public.certificates;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'certificates_unique_enrollment'
  ) then
    alter table public.certificates
      add constraint certificates_unique_enrollment unique (enrollment_id);
  end if;
end$$;

create policy "Students can view their own certificates"
on public.certificates
for select
to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.id = certificates.enrollment_id
      and e.user_id = auth.uid()
  )
);

create policy "Admins can view all certificates"
on public.certificates
for select
to authenticated
using (is_admin(auth.uid()));

create policy "Students can request certificate"
on public.certificates
for insert
to authenticated
with check (
  exists (
    select 1 from public.enrollments e
    where e.id = certificates.enrollment_id
      and e.user_id = auth.uid()
  )
);

create policy "Admins can manage certificates"
on public.certificates
for all
to authenticated
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));



-- 5) PROGRESSO AUTOMÁTICO: função + trigger para atualizar progress_percentage

create or replace function public.recalculate_enrollment_progress(_enrollment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_id uuid;
  v_total integer;
  v_completed integer;
  v_percentage integer;
begin
  select course_id into v_course_id
  from public.enrollments
  where id = _enrollment_id;

  if v_course_id is null then
    return;
  end if;

  select count(*) into v_total
  from public.lessons
  where course_id = v_course_id;

  if coalesce(v_total, 0) = 0 then
    v_percentage := 0;
  else
    select count(*) into v_completed
    from public.student_progress sp
    join public.lessons l on l.id = sp.lesson_id
    where sp.enrollment_id = _enrollment_id
      and sp.status = 'completed';

    v_percentage := floor((coalesce(v_completed,0)::numeric / v_total::numeric) * 100);
  end if;

  update public.enrollments
  set progress_percentage = coalesce(v_percentage, 0),
      updated_at = now()
  where id = _enrollment_id;
end;
$$;

create or replace function public.after_student_progress_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_enrollment_progress(old.enrollment_id);
  else
    perform public.recalculate_enrollment_progress(new.enrollment_id);
  end if;
  return null;
end;
$$;

do $$
begin
  if exists (select 1 from pg_trigger where tgname = 'trg_student_progress_change') then
    drop trigger trg_student_progress_change on public.student_progress;
  end if;
end$$;

create trigger trg_student_progress_change
after insert or update or delete on public.student_progress
for each row execute procedure public.after_student_progress_change();
