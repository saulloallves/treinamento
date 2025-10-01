import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TestStats {
  totalTests: number;
  activeTests: number;
  draftTests: number;
  archivedTests: number;
  totalSubmissions: number;
  averagePassRate: number;
  todaySubmissions: number;
}

export const useTestStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["test-stats"],
    queryFn: async () => {
      // Get basic test counts - only from active turmas
      const { data: testsData, error: testsError } = await supabase
        .from("tests")
        .select(`
          status,
          turma_id,
          turmas!inner(status)
        `)
        .neq("turmas.status", "encerrada");

      if (testsError) throw testsError;

      // Get submission stats - only from active turmas
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("test_submissions")
        .select(`
          submitted_at,
          passed,
          test_id,
          tests!inner(
            turma_id,
            turmas!inner(status)
          )
        `)
        .neq("tests.turmas.status", "encerrada");

      if (submissionsError) throw submissionsError;

      // Calculate stats
      const totalTests = testsData?.length || 0;
      const activeTests = testsData?.filter(t => t.status === 'active').length || 0;
      const draftTests = testsData?.filter(t => t.status === 'draft').length || 0;
      const archivedTests = testsData?.filter(t => t.status === 'archived').length || 0;
      
      const totalSubmissions = submissionsData?.length || 0;
      const passedSubmissions = submissionsData?.filter(s => s.passed).length || 0;
      const averagePassRate = totalSubmissions > 0 ? (passedSubmissions / totalSubmissions) * 100 : 0;

      // Today's submissions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySubmissions = submissionsData?.filter(s => {
        if (!s.submitted_at) return false;
        const submissionDate = new Date(s.submitted_at);
        return submissionDate >= today;
      }).length || 0;

      const stats: TestStats = {
        totalTests,
        activeTests,
        draftTests,
        archivedTests,
        totalSubmissions,
        averagePassRate: Math.round(averagePassRate * 10) / 10,
        todaySubmissions
      };

      return stats;
    },
  });

  return {
    data,
    isLoading,
    error,
  };
};