import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MyEnrollmentCourse {
  id: string;
  name: string;
  lessons_count?: number | null;
  generates_certificate?: boolean | null;
  tipo?: string | null;
}

export interface MyEnrollment {
  id: string;
  course_id: string;
  progress_percentage: number;
  status: string;
  created_at: string;
  student_name?: string | null;
  student_email?: string | null;
  student_phone?: string | null;
  course?: MyEnrollmentCourse | null;
}

export const useMyEnrollments = (): UseQueryResult<MyEnrollment[], Error> => {
  const { toast } = useToast();

  return useQuery<MyEnrollment[]>({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      try {
        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userResp.user) {
          throw new Error("É necessário estar autenticado para listar suas inscrições.");
        }
        const userId = userResp.user.id;

        const { data: enrollments, error } = await supabase
          .from("enrollments")
          .select("id, course_id, progress_percentage, status, created_at, student_name, student_email, student_phone")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const list = enrollments ?? [];
        const courseIds = Array.from(new Set(list.map((e) => e.course_id).filter(Boolean)));

        let coursesMap: Record<string, MyEnrollmentCourse> = {};
        if (courseIds.length > 0) {
          const { data: coursesData, error: coursesErr } = await supabase
            .from("courses")
            .select("id, name, lessons_count, generates_certificate, tipo")
            .in("id", courseIds);
          if (coursesErr) throw coursesErr;
          (coursesData ?? []).forEach((c) => {
            coursesMap[c.id as string] = c as unknown as MyEnrollmentCourse;
          });
        }

        // Calcula o progresso real baseado no tipo de curso
        const enrichedEnrollments = await Promise.all(
          list.map(async (e) => {
            const courseInfo = e.course_id ? coursesMap[e.course_id] : null;
            let realProgress = e.progress_percentage ?? 0;
            
            if (courseInfo?.tipo === 'gravado') {
              // Para cursos gravados, usa student_progress
              const { data: progressData } = await supabase
                .from('student_progress')
                .select('status')
                .eq('enrollment_id', e.id);
              
              const completedLessons = (progressData || []).filter(p => p.status === 'completed').length;
              const { data: totalLessonsData } = await supabase
                .from('recorded_lessons')
                .select('id')
                .eq('course_id', e.course_id);
              
              const totalLessons = (totalLessonsData || []).length;
              realProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
              
            } else {
              // Para cursos ao vivo, usa attendance
              const { data: attendanceData } = await supabase
                .from('attendance')
                .select('id')
                .eq('enrollment_id', e.id);
              
              const attended = (attendanceData || []).length;
              const totalLessons = Math.max(0, Number(courseInfo?.lessons_count ?? 0));
              realProgress = totalLessons > 0
                ? Math.max(0, Math.min(100, Math.floor((attended * 100) / totalLessons)))
                : (e.progress_percentage ?? 0);
            }
            
            return {
              ...e,
              progress_percentage: realProgress,
              course: courseInfo,
            } as MyEnrollment;
          })
        );

        return enrichedEnrollments;
      } catch (err: any) {
        toast({
          title: "Erro ao carregar inscrições",
          description: err?.message ?? "Tente novamente mais tarde.",
          variant: "destructive",
        });
        throw err;
      }
    },
    staleTime: 1000 * 60,
  });
};
