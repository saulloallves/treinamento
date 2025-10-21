import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QuizContext {
  courseId?: string;
  lessonId?: string; 
  turmaId?: string;
}

export const useQuiz = (context?: QuizContext) => {
  const queryClient = useQueryClient();

  // Buscar todas as perguntas do quiz
  const { data, isLoading, error } = useQuery({
    queryKey: ["quiz-questions", context],
    queryFn: async () => {
      let query = supabase
        .from("quiz")
        .select(`
          *,
          courses (
            id,
            name
          ),
          lessons (
            id,
            title
          ),
          turmas (
            id,
            name,
            code
          )
        `)
        .order("quiz_name", { ascending: true })
        .order("order_index", { ascending: true });

      // Apply filters based on context
      if (context?.courseId) {
        query = query.eq("course_id", context.courseId);
      }
      if (context?.lessonId) {
        query = query.eq("lesson_id", context.lessonId);
      }
      if (context?.turmaId) {
        query = query.eq("turma_id", context.turmaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  // Criar pergunta
  const createQuestion = useMutation({
    mutationFn: async (questionData: any) => {
      const { data, error } = await supabase
        .from("quiz")
        .insert([questionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions"] });
    },
  });

  // Atualizar pergunta
  const updateQuestion = useMutation({
    mutationFn: async ({ id, ...questionData }: any) => {
      const { data, error } = await supabase
        .from("quiz")
        .update(questionData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions"] });
    },
  });

  // Deletar pergunta
  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quiz")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions"] });
    },
  });

  // Deletar quiz completo (todas perguntas com mesmo quiz_name)
  const deleteQuiz = useMutation({
    mutationFn: async ({ quizName, turmaId }: { quizName: string; turmaId?: string }) => {
      let query = supabase
        .from("quiz")
        .delete()
        .eq("quiz_name", quizName);

      if (turmaId) {
        query = query.eq("turma_id", turmaId);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    deleteQuiz,
  };
};

// Hook separado para buscar perguntas por aula
export const useQuestionsByLesson = (lessonId: string, turmaId?: string) => {
  return useQuery({
    queryKey: ["quiz-lesson", lessonId, turmaId],
    queryFn: async () => {
      let query = supabase
        .from("quiz")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true });

      // If turmaId is provided, get both general quizzes and turma-specific quizzes (only active for students)
      if (turmaId) {
        query = query.or(`turma_id.is.null,turma_id.eq.${turmaId}`)
                    .eq("status", "ativo");
      } else {
        // If no turmaId provided, get only general quizzes (no turma_id) that are active
        query = query.is("turma_id", null)
                    .eq("status", "ativo");
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
};