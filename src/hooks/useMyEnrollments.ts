import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MyEnrollmentCourse {
  id: string;
  name: string;
  lessons_count?: number | null;
  generates_certificate?: boolean | null;
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
            .select("id, name, lessons_count, generates_certificate")
            .in("id", courseIds);
          if (coursesErr) throw coursesErr;
          (coursesData ?? []).forEach((c) => {
            coursesMap[c.id as string] = c as unknown as MyEnrollmentCourse;
          });
        }

        return list.map((e) => ({
          ...e,
          course: e.course_id ? coursesMap[e.course_id] : null,
        })) as MyEnrollment[];
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
