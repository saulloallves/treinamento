import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface UpcomingLessonItem {
  id: string;
  title: string;
  course: string;
  date: string; // dd/MM/yyyy
  time: string; // HH:mm
  participants: number;
}

export const useUpcomingLessons = () => {
  return useQuery<UpcomingLessonItem[]>({
    queryKey: ["upcoming_lessons"],
    queryFn: async () => {
      const lessonsRes = await supabase
        .from("lessons")
        .select("id,title,course_id,zoom_start_time,status")
        .eq("status", "Ativo")
        .not("zoom_start_time", "is", null)
        .gte("zoom_start_time", new Date().toISOString())
        .order("zoom_start_time", { ascending: true })
        .limit(3);

      const lessons = (lessonsRes.data as any[]) ?? [];
      if (lessons.length === 0) return [];

      const lessonIds = lessons.map((l) => l.id);
      const courseIds = Array.from(
        new Set(lessons.map((l) => l.course_id).filter(Boolean))
      );

      const [attendanceRes, coursesRes] = await Promise.all([
        supabase
          .from("attendance")
          .select("lesson_id")
          .in("lesson_id", lessonIds),
        courseIds.length
          ? supabase
              .from("courses")
              .select("id,name")
              .in("id", courseIds)
          : Promise.resolve({ data: [] as any }),
      ]);

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
          date: format(dt, "dd/MM/yyyy", { locale: ptBR }),
          time: format(dt, "HH:mm", { locale: ptBR }),
          participants: countsByLesson.get(l.id) ?? 0,
        } as UpcomingLessonItem;
      });
    },
  });
};
