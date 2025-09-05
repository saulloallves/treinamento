import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ProfessorDashboardStats {
  averageStudentProgress: number;
  engagementByClass: Array<{
    turmaId: string;
    turmaName: string;
    enrolledStudents: number;
    activeStudents: number;
    engagementRate: number;
  }>;
  activeCourses: number;
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
        .eq('status', 'em_andamento');

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

      // Calculate engagement by class
      const engagementByClass = turmas?.map(turma => {
        const turmaEnrollments = enrollments.filter(e => e.turma_id === turma.id);
        const enrolledStudents = turmaEnrollments.length;
        const activeStudents = turmaEnrollments.filter(e => (e.progress_percentage || 0) > 0).length;
        const engagementRate = enrolledStudents > 0 ? Math.round((activeStudents / enrolledStudents) * 100) : 0;

        return {
          turmaId: turma.id,
          turmaName: turma.name || turma.code || `Turma ${turma.id.slice(0, 8)}`,
          enrolledStudents,
          activeStudents,
          engagementRate
        };
      }) || [];

      // Mock pending tasks for now (would need more complex queries for real data)
      const pendingTasks = {
        evaluationsToCorrect: 0,
        pendingFeedback: 0,
        total: 0
      };

      return {
        averageStudentProgress: averageProgress,
        engagementByClass,
        activeCourses,
        pendingTasks
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};