import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ProfessorDashboardStats {
  averageStudentProgress: number;
  totalActiveStudents: number;
  activeCourses: number;
  averageAttendanceRate: number;
  pendingTasks: {
    evaluationsToCorrect: number;
    pendingFeedback: number;
    total: number;
  };
}

export const useProfessorDashboard = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["professor-dashboard", user?.id],
    queryFn: async (): Promise<ProfessorDashboardStats> => {
      if (!user?.id) throw new Error("User not authenticated");

      // Get professor's turmas
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select(`
          id,
          name,
          code,
          status,
          course_id,
          courses (
            id,
            name
          )
        `)
        .eq('responsavel_user_id', user.id)
        .in('status', ['agendada', 'em_andamento']);

      if (turmasError) throw turmasError;

      // Get enrollments for professor's turmas
      const turmaIds = turmas?.map(t => t.id) || [];
      let enrollments: any[] = [];
      let averageProgress = 0;
      
      if (turmaIds.length > 0) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('turma_id, progress_percentage, user_id')
          .in('turma_id', turmaIds);

        if (enrollmentsError) throw enrollmentsError;
        enrollments = enrollmentsData || [];

        // Calculate average progress
        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0);
        averageProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
      }

      // Get active courses count
      const { data: courses, error: coursesError } = await supabase
        .from('turmas')
        .select('course_id')
        .eq('responsavel_user_id', user.id)
        .in('status', ['agendada', 'em_andamento']);

      if (coursesError) throw coursesError;
      const uniqueCourseIds = [...new Set(courses?.map(c => c.course_id) || [])];
      const activeCourses = uniqueCourseIds.length;

      // Calculate total active students and attendance rate
      const totalActiveStudents = enrollments.length;
      let averageAttendanceRate = 0;

      if (turmaIds.length > 0) {
        // Get attendance data for calculating attendance rate
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('turma_id, user_id')
          .in('turma_id', turmaIds);

        if (attendanceData && attendanceData.length > 0 && totalActiveStudents > 0) {
          // Calculate unique students who attended at least once
          const studentsWithAttendance = new Set(attendanceData.map(a => a.user_id)).size;
          averageAttendanceRate = Math.round((studentsWithAttendance / totalActiveStudents) * 100);
        }
      }

      // Mock pending tasks for now (would need more complex queries for real data)
      const pendingTasks = {
        evaluationsToCorrect: 0,
        pendingFeedback: 0,
        total: 0
      };

      return {
        averageStudentProgress: averageProgress,
        totalActiveStudents,
        activeCourses,
        averageAttendanceRate,
        pendingTasks
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};