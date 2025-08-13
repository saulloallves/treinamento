import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface UpcomingLessonItem {
  id: string;
  title: string;
  course: string;
  course_id: string;
  date: string; // dd/MM/yyyy
  time: string; // HH:mm
  participants: number;
  joinUrl?: string;
}

export const useUpcomingLessons = () => {
  return useQuery<UpcomingLessonItem[]>({
    queryKey: ["upcoming_lessons"],
    queryFn: async () => {
      // 1) Obtém o usuário logado
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp.user) {
        return [];
      }

      // 2) Verifica se é admin e coleta cursos do usuário quando necessário
      const { data: isAdminData } = await supabase.rpc('is_admin', { _user: userResp.user.id });
      const isAdmin = !!isAdminData;

      let enrolledCourseIds: string[] = [];
      if (!isAdmin) {
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', userResp.user.id);
        enrolledCourseIds = Array.from(new Set((enrollmentsData ?? []).map((e: any) => e.course_id).filter(Boolean)));
        if (enrolledCourseIds.length === 0) return [];
      }

      // 3) Busca aulas futuras (apenas com data de início definida)
      const nowIso = new Date().toISOString();
      let lessonsQuery = supabase
        .from('lessons')
        .select('id,title,course_id,zoom_start_time,zoom_join_url,status,created_at')
        .eq('status', 'Ativo')
        .not('zoom_start_time', 'is', null)
        .gt('zoom_start_time', nowIso)
        .order('zoom_start_time', { ascending: true });

      if (!isAdmin) {
        lessonsQuery = lessonsQuery.in('course_id', enrolledCourseIds);
      }

      const lessonsRes = await lessonsQuery;

      const lessons = (lessonsRes.data as any[]) ?? [];
      if (lessons.length === 0) return [];

      const lessonIds = lessons.map((l) => l.id);

      // 4) Busca contagem de presença por aula (participantes)
      const attendanceRes = await supabase
        .from("attendance")
        .select("lesson_id")
        .in("lesson_id", lessonIds);

      // 5) Busca nomes dos cursos envolvidos
      const courseIds = Array.from(new Set(lessons.map((l: any) => l.course_id).filter(Boolean)));
      const coursesRes = await supabase
        .from('courses')
        .select('id,name')
        .in('id', courseIds);

      const countsByLesson = new Map<string, number>();
      for (const a of ((attendanceRes.data as any[]) ?? [])) {
        countsByLesson.set(a.lesson_id, (countsByLesson.get(a.lesson_id) ?? 0) + 1);
      }

      const courseNameById = new Map<string, string>();
      for (const c of ((coursesRes as any).data as any[]) ?? []) {
        courseNameById.set(c.id, c.name);
      }

      return lessons.map((l) => {
        const dtSrc = (l as any).zoom_start_time ?? (l as any).created_at;
        const dt = dtSrc ? new Date(dtSrc) : new Date();
        return {
          id: l.id,
          title: l.title,
          course: courseNameById.get(l.course_id) ?? "—",
          course_id: l.course_id,
          date: format(dt, "dd/MM/yyyy", { locale: ptBR }),
          time: format(dt, "HH:mm", { locale: ptBR }),
          participants: countsByLesson.get(l.id) ?? 0,
          joinUrl: (l as any).zoom_join_url ?? undefined,
        } as UpcomingLessonItem;
      });
    },
  });
};
