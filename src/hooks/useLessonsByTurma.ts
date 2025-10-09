import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface LessonByTurma {
  id: string;
  title: string;
  course_name: string;
  course_id: string;
  turma_name: string;
  turma_id: string;
  date: string; // dd/MM/yyyy
  time: string; // HH:mm
  participants: number;
  joinUrl?: string;
  zoom_start_time: string;
}

export interface TurmaWithLessons {
  id: string;
  name: string;
  code: string;
  course_name: string;
  course_id: string;
  course_type: 'ao_vivo' | 'gravado';
  status: string;
  completion_deadline: string;
  upcoming_lessons_count: number;
  next_lesson?: {
    title: string;
    date: string;
    time: string;
  };
}

export const useLessonsByTurma = () => {
  return useQuery<TurmaWithLessons[]>({
    queryKey: ["lessons_by_turma"],
    queryFn: async () => {
      // 1) Obtém o usuário logado
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp.user) {
        return [];
      }

      // 2) Busca as inscrições do usuário para obter as turmas (apenas turmas ativas)
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          turma_id,
          turma:turmas!inner(
            id,
            name,
            code,
            status,
            completion_deadline,
            course:courses(
              id,
              name,
              tipo
            )
          )
        `)
        .eq('user_id', userResp.user.id)
        .not('turma_id', 'is', null)
        .in('turma.status', ['agendada', 'em_andamento', 'inscricoes_abertas']);

      if (enrollmentsError) {
        console.error('Erro ao buscar inscrições:', enrollmentsError);
        return [];
      }

      if (!enrollments || enrollments.length === 0) {
        return [];
      }

      // 3) Para cada turma, buscar as próximas aulas
      const nowIso = new Date().toISOString();
      const turmasWithLessons: TurmaWithLessons[] = [];

      for (const enrollment of enrollments) {
        const turma = (enrollment as any).turma;
        if (!turma) continue;

        // Buscar aulas futuras da turma
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title, course_id, zoom_start_time, zoom_join_url, status')
          .eq('course_id', enrollment.course_id)
          .eq('status', 'Ativo')
          .not('zoom_start_time', 'is', null)
          .gt('zoom_start_time', nowIso)
          .order('zoom_start_time', { ascending: true });

        if (lessonsError) {
          console.error('Erro ao buscar aulas:', lessonsError);
          continue;
        }

        const upcomingLessons = lessons || [];
        let nextLesson = undefined;

        if (upcomingLessons.length > 0) {
          const firstLesson = upcomingLessons[0];
          const dt = new Date(firstLesson.zoom_start_time);
          nextLesson = {
            title: firstLesson.title,
            date: format(dt, "dd/MM/yyyy", { locale: ptBR }),
            time: format(dt, "HH:mm", { locale: ptBR }),
          };
        }

        turmasWithLessons.push({
          id: turma.id,
          name: turma.name || `Turma ${turma.code}`,
          code: turma.code || '',
          course_name: turma.course?.name || 'Curso não informado',
          course_id: enrollment.course_id,
          course_type: turma.course?.tipo || 'ao_vivo',
          status: turma.status || 'agendada',
          completion_deadline: turma.completion_deadline,
          upcoming_lessons_count: upcomingLessons.length,
          next_lesson: nextLesson,
        });
      }

      return turmasWithLessons;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useTurmaLessons = (turmaId: string | undefined) => {
  return useQuery<LessonByTurma[]>({
    queryKey: ["turma_lessons", turmaId],
    queryFn: async () => {
      if (!turmaId) return [];

      // 1) Obtém o usuário logado
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp.user) {
        return [];
      }

      // 2) Verifica se o usuário está inscrito na turma e se ela está ativa
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          turma:turmas!inner(
            id,
            name,
            code,
            status,
            course:courses(name)
          )
        `)
        .eq('user_id', userResp.user.id)
        .eq('turma_id', turmaId)
        .in('turma.status', ['agendada', 'em_andamento', 'inscricoes_abertas'])
        .single();

      if (enrollmentError || !enrollment) {
        console.error('Usuário não está inscrito nesta turma:', enrollmentError);
        return [];
      }

      const turma = (enrollment as any).turma;

      // 3) Busca aulas futuras da turma
      const nowIso = new Date().toISOString();
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, course_id, zoom_start_time, zoom_join_url, status')
        .eq('course_id', enrollment.course_id)
        .eq('status', 'Ativo')
        .not('zoom_start_time', 'is', null)
        .gt('zoom_start_time', nowIso)
        .order('zoom_start_time', { ascending: true });

      if (lessonsError) {
        console.error('Erro ao buscar aulas:', lessonsError);
        return [];
      }

      const lessonIds = (lessons || []).map(l => l.id);

      // 4) Busca contagem de presença por aula
      let attendanceCounts: Record<string, number> = {};
      if (lessonIds.length > 0) {
        const { data: attendanceData } = await supabase
          .from("attendance")
          .select("lesson_id")
          .in("lesson_id", lessonIds);

        attendanceData?.forEach(a => {
          attendanceCounts[a.lesson_id] = (attendanceCounts[a.lesson_id] || 0) + 1;
        });
      }

      return (lessons || []).map(lesson => {
        const dt = new Date(lesson.zoom_start_time);
        return {
          id: lesson.id,
          title: lesson.title,
          course_name: turma?.course?.name || 'Curso',
          course_id: lesson.course_id,
          turma_name: turma?.name || `Turma ${turma?.code}`,
          turma_id: turmaId,
          date: format(dt, "dd/MM/yyyy", { locale: ptBR }),
          time: format(dt, "HH:mm", { locale: ptBR }),
          participants: attendanceCounts[lesson.id] || 0,
          joinUrl: lesson.zoom_join_url || undefined,
          zoom_start_time: lesson.zoom_start_time,
        };
      });
    },
    enabled: !!turmaId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};