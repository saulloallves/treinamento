import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QuizDetailedResponse {
  quizId: string;
  quizName: string;
  question: string;
  correctAnswer: string;
  responses: Array<{
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    selectedAnswer: string;
    isCorrect: boolean;
    answeredAt: string;
  }>;
}

export const useQuizDetailedData = (turmaId: string, quizName: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["quiz-detailed-data", turmaId, quizName],
    queryFn: async () => {
      if (!turmaId || !quizName) throw new Error("Turma ID and Quiz name are required");

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

      // Buscar todas as respostas do quiz específico
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
        .eq("quiz.quiz_name", quizName)
        .order("answered_at", { ascending: false });

      if (quizError) throw quizError;

      // Buscar dados dos usuários para nomes
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", userIds);

      if (usersError) throw usersError;

      // Agrupar por quiz/pergunta
      const quizDetailsMap: Record<string, QuizDetailedResponse> = {};

      (quizData || []).forEach((response: any) => {
        const quizId = response.quiz?.id;
        const question = response.quiz?.question || 'Pergunta não encontrada';
        const correctAnswer = response.quiz?.correct_answer || '';
        const quizName = response.quiz?.quiz_name || 'Quiz sem nome';

        if (!quizId) return;

        const key = `${quizId}-${question}`;
        
        if (!quizDetailsMap[key]) {
          quizDetailsMap[key] = {
            quizId,
            quizName,
            question,
            correctAnswer,
            responses: []
          };
        }

        const user = users?.find(u => u.id === response.user_id);
        const enrollment = enrollments?.find(e => e.user_id === response.user_id);
        const studentName = user?.name || enrollment?.student_name || 'Nome não encontrado';
        const studentEmail = user?.email || enrollment?.student_email || 'Email não encontrado';

        quizDetailsMap[key].responses.push({
          id: response.id,
          studentId: response.user_id,
          studentName,
          studentEmail,
          selectedAnswer: response.selected_answer,
          isCorrect: response.is_correct || false,
          answeredAt: response.answered_at
        });
      });

      return Object.values(quizDetailsMap);
    },
    enabled: enabled && !!turmaId && !!quizName,
  });
};