import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudentQuizData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  quizzes: Array<{
    quizName: string;
    responses: Array<{
      id: string;
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      answeredAt: string;
    }>;
    stats: {
      totalQuestions: number;
      correctAnswers: number;
      accuracy: number;
    };
  }>;
}

export const useStudentQuizData = (turmaId: string, studentId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["student-quiz-data", turmaId, studentId],
    queryFn: async () => {
      if (!turmaId || !studentId) throw new Error("Turma ID and Student ID are required");

      // Buscar dados do estudante
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select(`
          user_id,
          student_name,
          student_email
        `)
        .eq("turma_id", turmaId)
        .eq("user_id", studentId)
        .eq("status", "Ativo")
        .single();

      if (enrollmentError) throw enrollmentError;

      // Buscar dados do usuário
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("id", studentId)
        .single();

      if (userError && userError.code !== 'PGRST116') throw userError;

      const studentName = user?.name || enrollment?.student_name || 'Nome não encontrado';
      const studentEmail = user?.email || enrollment?.student_email || 'Email não encontrado';

      // Buscar todas as respostas de quiz do estudante na turma
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
        .eq("user_id", studentId)
        .eq("quiz.turma_id", turmaId)
        .order("answered_at", { ascending: false });

      if (quizError) throw quizError;

      // Agrupar por quiz
      const quizzesMap: Record<string, any> = {};

      (quizData || []).forEach((response: any) => {
        const quizName = response.quiz?.quiz_name || 'Quiz sem nome';
        
        if (!quizzesMap[quizName]) {
          quizzesMap[quizName] = {
            quizName,
            responses: [],
            stats: {
              totalQuestions: 0,
              correctAnswers: 0,
              accuracy: 0
            }
          };
        }

        quizzesMap[quizName].responses.push({
          id: response.id,
          question: response.quiz?.question || 'Pergunta não encontrada',
          selectedAnswer: response.selected_answer,
          correctAnswer: response.quiz?.correct_answer || '',
          isCorrect: response.is_correct || false,
          answeredAt: response.answered_at
        });

        quizzesMap[quizName].stats.totalQuestions++;
        if (response.is_correct) {
          quizzesMap[quizName].stats.correctAnswers++;
        }
      });

      // Calcular accuracy para cada quiz
      Object.values(quizzesMap).forEach((quiz: any) => {
        if (quiz.stats.totalQuestions > 0) {
          quiz.stats.accuracy = Math.round((quiz.stats.correctAnswers / quiz.stats.totalQuestions) * 100);
        }
      });

      return {
        studentId,
        studentName,
        studentEmail,
        quizzes: Object.values(quizzesMap)
      } as StudentQuizData;
    },
    enabled: enabled && !!turmaId && !!studentId,
  });
};