import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DetailedStudentResponse {
  studentId: string;
  studentName: string;
  studentEmail: string;
  quizResponses: Array<{
    id: string;
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    answeredAt: string;
    quizName: string;
  }>;
  testSubmissions: Array<{
    id: string;
    testName: string;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    passed: boolean;
    submittedAt: string;
    timeTaken: number;
    attemptNumber: number;
  }>;
  quizStats: {
    totalAnswered: number;
    correctAnswers: number;
    accuracy: number;
  };
  testStats: {
    totalTests: number;
    averageScore: number;
    testsPass: number;
    passRate: number;
  };
}

export const useDetailedTurmaReports = (turmaId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["detailed-turma-reports", turmaId],
    queryFn: async () => {
      if (!turmaId) throw new Error("Turma ID is required");

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

      // Buscar respostas de quiz da turma
      const { data: quizData, error: quizError } = await supabase
        .from("quiz_responses")
        .select(`
          *,
          quiz:quiz_id (
            id,
            question,
            quiz_name,
            correct_answer,
            turma_id
          )
        `)
        .in("user_id", userIds)
        .eq("quiz.turma_id", turmaId)
        .order("answered_at", { ascending: false });

      if (quizError) throw quizError;

      // Buscar submissões de testes da turma
      const { data: testData, error: testError } = await supabase
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
        .order("submitted_at", { ascending: false });

      if (testError) throw testError;

      // Buscar dados dos usuários para nomes
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", userIds);

      if (usersError) throw usersError;

      // Processar dados por estudante
      const studentsData: Record<string, DetailedStudentResponse> = {};

      // Inicializar dados dos estudantes
      enrollments.forEach(enrollment => {
        if (!enrollment.user_id) return;
        
        const user = users?.find(u => u.id === enrollment.user_id);
        const studentName = user?.name || enrollment.student_name || 'Nome não encontrado';
        const studentEmail = user?.email || enrollment.student_email || 'Email não encontrado';

        studentsData[enrollment.user_id] = {
          studentId: enrollment.user_id,
          studentName,
          studentEmail,
          quizResponses: [],
          testSubmissions: [],
          quizStats: {
            totalAnswered: 0,
            correctAnswers: 0,
            accuracy: 0
          },
          testStats: {
            totalTests: 0,
            averageScore: 0,
            testsPass: 0,
            passRate: 0
          }
        };
      });

      // Processar respostas de quiz
      (quizData || []).forEach((response: any) => {
        const userId = response.user_id;
        if (!userId || !studentsData[userId]) return;

        studentsData[userId].quizResponses.push({
          id: response.id,
          question: response.quiz?.question || 'Pergunta não encontrada',
          selectedAnswer: response.selected_answer,
          correctAnswer: response.quiz?.correct_answer || '',
          isCorrect: response.is_correct || false,
          answeredAt: response.answered_at,
          quizName: response.quiz?.quiz_name || 'Quiz sem nome'
        });

        studentsData[userId].quizStats.totalAnswered++;
        if (response.is_correct) {
          studentsData[userId].quizStats.correctAnswers++;
        }
      });

      // Processar submissões de testes
      (testData || []).forEach((submission: any) => {
        const userId = submission.user_id;
        if (!userId || !studentsData[userId] || submission.status !== 'completed') return;

        studentsData[userId].testSubmissions.push({
          id: submission.id,
          testName: submission.test?.name || 'Teste sem nome',
          totalScore: submission.total_score,
          maxPossibleScore: submission.max_possible_score,
          percentage: submission.percentage,
          passed: submission.passed,
          submittedAt: submission.submitted_at,
          timeTaken: submission.time_taken_minutes || 0,
          attemptNumber: submission.attempt_number
        });

        studentsData[userId].testStats.totalTests++;
        if (submission.passed) {
          studentsData[userId].testStats.testsPass++;
        }
      });

      // Calcular estatísticas finais
      Object.keys(studentsData).forEach(userId => {
        const student = studentsData[userId];
        
        // Calcular accuracy do quiz
        if (student.quizStats.totalAnswered > 0) {
          student.quizStats.accuracy = Math.round(
            (student.quizStats.correctAnswers / student.quizStats.totalAnswered) * 100
          );
        }

        // Calcular estatísticas de testes
        if (student.testStats.totalTests > 0) {
          const totalScore = student.testSubmissions.reduce((sum, test) => sum + test.percentage, 0);
          student.testStats.averageScore = Math.round(totalScore / student.testStats.totalTests);
          student.testStats.passRate = Math.round(
            (student.testStats.testsPass / student.testStats.totalTests) * 100
          );
        }
      });

      return Object.values(studentsData).filter(student => 
        student.quizResponses.length > 0 || student.testSubmissions.length > 0
      );
    },
    enabled: enabled && !!turmaId,
  });
};