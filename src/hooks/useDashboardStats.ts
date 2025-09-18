import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        supabase.from("users").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "Ativo"),
        supabase.from("certificates").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("unidades").select("*", { count: "exact", head: true }),
        supabase.from("whatsapp_dispatches").select("*", { count: "exact", head: true }),
        supabase.from("lessons").select("*", { count: "exact", head: true }).eq("status", "Ativo"),
        supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .gte("confirmed_at", startOfMonth.toISOString())
          .lte("confirmed_at", endOfMonth.toISOString()),
        supabase.from("enrollments").select("progress_percentage"),
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
            enrollments.reduce((acc: number, e: any) => acc + (e.progress_percentage ?? 0), 0) /
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
