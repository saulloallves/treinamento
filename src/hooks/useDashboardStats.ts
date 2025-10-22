import { useQuery } from "@tanstack/react-query";
import { matriz, treinamento } from "@/integrations/supabase/helpers";

export interface DashboardStats {
  usersActive: number;
  coursesAvailable: number;
  certificatesIssued: number;
  completionRate: number; // 0-100
  unitsActive: number;
  whatsappDispatches: number;
  lessonsScheduled: number;
  attendancesThisMonth: number;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard_stats"],
    queryFn: async () => {
      try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setMilliseconds(-1);

      const [
        usersActiveRes,
        coursesRes,
        certificatesRes,
        unitsActiveRes,
        whatsappRes,
        lessonsRes,
        attendanceRes,
        enrollmentsRes,
      ] = await Promise.all([
        treinamento.users().select("*", { count: "exact", head: true }).eq("active", true),
        treinamento.courses().select("*", { count: "exact", head: true }).eq("status", "Ativo"),
        treinamento.certificates().select("*", { count: "exact", head: true }).eq("status", "active"),
        matriz.unidades().select("*", { count: "exact", head: true }), // <-- Use helper matriz
        treinamento.whatsapp_messages().select("*", { count: "exact", head: true }),
        treinamento.lessons().select("*", { count: "exact", head: true }).eq("status", "Ativo"),
        treinamento.attendance()
          .select("*", { count: "exact", head: true })
          .gte("confirmed_at", startOfMonth.toISOString())
          .lte("confirmed_at", endOfMonth.toISOString()),
        treinamento.enrollments().select("progress_percentage"),
      ]);

      // Handle potential errors silently with zeros
      const usersActive = usersActiveRes.count ?? 0;
      const coursesAvailable = coursesRes.count ?? 0;
      const certificatesIssued = certificatesRes.count ?? 0;
      const unitsActive = unitsActiveRes.count ?? 0;
      const whatsappDispatches = whatsappRes.count ?? 0;
      const lessonsScheduled = lessonsRes.count ?? 0;
      const attendancesThisMonth = attendanceRes.count ?? 0;

      const enrollments = enrollmentsRes.data ?? [];
      const avg = enrollments.length
        ? Math.round(
            enrollments.reduce((acc: number, e: { progress_percentage?: number | null }) => acc + (e.progress_percentage ?? 0), 0) /
              enrollments.length
          )
        : 0;

      const result = {
        usersActive,
        coursesAvailable,
        certificatesIssued,
        unitsActive,
        whatsappDispatches,
        lessonsScheduled,
        attendancesThisMonth,
        completionRate: avg,
      };
      
      return result;
      } catch (error) {
        console.error('useDashboardStats - Error:', error);
        throw error;
      }
    },
  });
};
