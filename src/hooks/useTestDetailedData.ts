import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TestDetailedResponse {
  testId: string;
  testName: string;
  submissions: Array<{
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    passed: boolean;
    submittedAt: string;
    timeTaken: number;
    attemptNumber: number;
    responses: Array<{
      questionId: string;
      questionText: string;
      selectedOptionText: string;
      scoreObtained: number;
      maxScore: number;
    }>;
  }>;
}

export const useTestDetailedData = (turmaId: string, testName: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["test-detailed-data", turmaId, testName],
    queryFn: async () => {
      if (!turmaId || !testName) throw new Error("Turma ID and Test name are required");

      // Buscar enrollments para obter estudantes da turma
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          user_id,
          student_name,
          student_email
        `)
        .eq("turma_id", turmaId)
        .eq("status", "Ativo");

      if (enrollmentsError) throw enrollmentsError;

      if (!enrollments || enrollments.length === 0) {
        return [];
      }

      const userIds = enrollments.map(e => e.user_id).filter(Boolean);

      // Buscar submissões do teste específico
      const { data: testSubmissions, error: testError } = await supabase
        .from("test_submissions")
        .select(`
          *,
          test:test_id (
            id,
            name,
            turma_id,
            passing_percentage
          )
        `)
        .in("user_id", userIds)
        .eq("test.turma_id", turmaId)
        .eq("test.name", testName)
        .eq("status", "completed")
        .order("submitted_at", { ascending: false });

      if (testError) throw testError;

      // Buscar dados dos usuários para nomes
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", userIds);

      if (usersError) throw usersError;

      // Buscar respostas detalhadas para cada submissão
      const submissionIds = testSubmissions?.map(sub => sub.id) || [];
      
      const { data: testResponses, error: responsesError } = await supabase
        .from("test_responses")
        .select(`
          *,
          question:question_id (
            question_text,
            max_score
          ),
          selected_option:selected_option_id (
            option_text
          )
        `)
        .in("test_id", testSubmissions?.map(sub => sub.test_id) || [])
        .in("user_id", userIds);

      if (responsesError) throw responsesError;

      // Agrupar por teste
      const testDetailsMap: Record<string, TestDetailedResponse> = {};

      (testSubmissions || []).forEach((submission: any) => {
        const testId = submission.test?.id;
        const testName = submission.test?.name || 'Teste sem nome';

        if (!testId) return;

        if (!testDetailsMap[testId]) {
          testDetailsMap[testId] = {
            testId,
            testName,
            submissions: []
          };
        }

        const user = users?.find(u => u.id === submission.user_id);
        const enrollment = enrollments?.find(e => e.user_id === submission.user_id);
        const studentName = user?.name || enrollment?.student_name || 'Nome não encontrado';
        const studentEmail = user?.email || enrollment?.student_email || 'Email não encontrado';

        // Buscar respostas para esta submissão
        const submissionResponses = (testResponses || [])
          .filter((resp: any) => resp.user_id === submission.user_id && resp.test_id === testId)
          .map((resp: any) => ({
            questionId: resp.question_id,
            questionText: resp.question?.question_text || 'Pergunta não encontrada',
            selectedOptionText: resp.selected_option?.option_text || 'Não respondido',
            scoreObtained: resp.score_obtained,
            maxScore: resp.question?.max_score || 0
          }));

        testDetailsMap[testId].submissions.push({
          id: submission.id,
          studentId: submission.user_id,
          studentName,
          studentEmail,
          totalScore: submission.total_score,
          maxPossibleScore: submission.max_possible_score,
          percentage: submission.percentage,
          passed: submission.passed,
          submittedAt: submission.submitted_at,
          timeTaken: submission.time_taken_minutes || 0,
          attemptNumber: submission.attempt_number,
          responses: submissionResponses
        });
      });

      return Object.values(testDetailsMap);
    },
    enabled: enabled && !!turmaId && !!testName,
  });
};