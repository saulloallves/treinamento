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

      // 2) Verifica se é admin
      const { data: isAdminData } = await supabase.rpc('is_admin', { _user: userResp.user.id });
      const isAdmin = !!isAdminData;
      
      // Se não é admin, deve seguir regras de aluno
      let enrolledCourseIds: string[] = [];
      if (!isAdmin) {
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', userResp.user.id);
        enrolledCourseIds = Array.from(new Set((enrollmentsData ?? []).map((e: any) => e.course_id).filter(Boolean)));
        
        console.log('useUpcomingLessons - Student mode:', { 
          isAdmin, 
          enrolledCourseIds 
        });
        
        if (enrolledCourseIds.length === 0) return [];
      }

      // 3) Busca aulas futuras (com ou sem data de início definida)
      const nowIso = new Date().toISOString();
      let lessonsQuery = supabase
        .from('lessons')
        .select('id,title,course_id,zoom_start_time,zoom_join_url,status,created_at')
        .eq('status', 'Ativo')
        .order('zoom_start_time', { ascending: true, nullsFirst: false });

      if (!isAdmin) {
        lessonsQuery = lessonsQuery.in('course_id', enrolledCourseIds);
      }

      const lessonsRes = await lessonsQuery;

      const lessons = (lessonsRes.data as any[]) ?? [];
      if (lessons.length === 0) return [];

      // Filtrar apenas aulas futuras
      const now = new Date();
      console.log('Current time:', now.toISOString());
      
      const filteredLessons = lessons.filter((lesson: any) => {
        // Se não tem zoom_start_time, verificar se created_at é futuro ou recente (aulas de streaming próprio)
        if (!lesson.zoom_start_time) {
          const createdAt = new Date(lesson.created_at);
          const isRecent = now.getTime() - createdAt.getTime() < (7 * 24 * 60 * 60 * 1000); // Últimos 7 dias
          console.log('Lesson without zoom_start_time (streaming):', lesson.title, 'Created:', createdAt.toISOString(), 'Is recent:', isRecent);
          return isRecent;
        }
        
        // Se tem zoom_start_time, verificar se é futura
        const lessonStart = new Date(lesson.zoom_start_time);
        const isFuture = now < lessonStart;
        console.log('Lesson:', lesson.title, 'Start:', lessonStart.toISOString(), 'Is future:', isFuture);
        return isFuture;
      });

      if (filteredLessons.length === 0) return [];

      const lessonIds = filteredLessons.map((l) => l.id);

      // 4) Busca contagem de presença por aula (participantes)
      const attendanceRes = await supabase
        .from("attendance")
        .select("lesson_id")
        .in("lesson_id", lessonIds);

      // 5) Busca nomes dos cursos envolvidos
      const courseIds = Array.from(new Set(filteredLessons.map((l: any) => l.course_id).filter(Boolean)));
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

      return filteredLessons.map((l) => {
        const dtSrc = (l as any).zoom_start_time ?? (l as any).created_at;
        
        // Extract date and time directly from string to avoid timezone conversion
        let dateStr = "—";
        let timeStr = "—";
        
        if (dtSrc) {
          // Direct string manipulation to avoid timezone conversion
          const dateMatch = dtSrc.match(/^(\d{4})-(\d{2})-(\d{2})/);
          const timeMatch = dtSrc.match(/T(\d{2}):(\d{2})/);
          
          if (dateMatch) {
            const [, year, month, day] = dateMatch;
            dateStr = `${day}/${month}/${year}`;
          }
          
          if (timeMatch) {
            const [, hour, minute] = timeMatch;
            timeStr = `${hour}:${minute}`;
          }
        }
        
        return {
          id: l.id,
          title: l.title,
          course: courseNameById.get(l.course_id) ?? "—",
          course_id: l.course_id,
          date: dateStr,
          time: timeStr,
          participants: countsByLesson.get(l.id) ?? 0,
          joinUrl: (l as any).zoom_join_url ?? undefined,
        } as UpcomingLessonItem;
      });
    },
  });
};
