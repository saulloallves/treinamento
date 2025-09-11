import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTestReports = () => {
  return useQuery({
    queryKey: ["test-reports"],
    queryFn: async () => {
      // Buscar submissões de testes agrupadas por test
      const { data: submissions, error } = await supabase
        .from("test_submissions")
        .select(`
          *,
          tests:test_id (
            id,
            name,
            turmas:turma_id (
              id,
              name,
              courses:course_id (
                id,
                name
              )
            )
          ),
          users:user_id (
            id,
            name,
            unit_code
          )
        `)
        .eq("status", "completed")
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Agrupar os dados por teste
      const groupedReports = (submissions || []).reduce((acc: any[], submission: any) => {
        const testName = submission.tests?.name || "Teste Desconhecido";
        const courseName = submission.tests?.turmas?.courses?.name || "Curso Desconhecido";
        const testId = submission.tests?.id;

        let existingReport = acc.find(report => report.testId === testId);
        
        if (!existingReport) {
          existingReport = {
            testId,
            title: `Relatório - ${testName}`,
            description: `Resultados do teste "${testName}" do curso "${courseName}"`,
            tests: 1,
            students: 0,
            passRate: 0,
            totalSubmissions: 0,
            passedSubmissions: 0,
            generatedAt: submission.submitted_at
          };
          acc.push(existingReport);
        }

        existingReport.totalSubmissions++;
        if (submission.passed) {
          existingReport.passedSubmissions++;
        }
        
        // Atualizar o count de estudantes únicos
        const uniqueStudents = new Set();
        submissions
          ?.filter((s: any) => s.tests?.id === testId)
          ?.forEach((s: any) => uniqueStudents.add(s.user_id));
        
        existingReport.students = uniqueStudents.size;
        existingReport.passRate = existingReport.totalSubmissions > 0 
          ? (existingReport.passedSubmissions / existingReport.totalSubmissions) * 100 
          : 0;

        return acc;
      }, []);

      return groupedReports.slice(0, 10); // Limitar a 10 relatórios mais recentes
    },
  });
};