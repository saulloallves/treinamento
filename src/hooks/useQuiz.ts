/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuizContext {
  courseId?: string;
  lessonId?: string; 
  turmaId?: string;
}

export const useQuiz = (context?: QuizContext) => {
  const queryClient = useQueryClient();

  // Buscar todas as perguntas do quiz (apenas ativas - não inativas/arquivadas)
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
        .neq("status", "inativo" as any)
        .order("quiz_name", { ascending: true })
        .order("order_index", { ascending: true });

      // Apply filters based on context
      if (context?.courseId) {
        query = query.eq("course_id", context.courseId as any);
      }
      if (context?.lessonId) {
        query = query.eq("lesson_id", context.lessonId as any);
      }
      if (context?.turmaId) {
        query = query.eq("turma_id", context.turmaId as any);
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

  // Deletar pergunta (soft-delete usando status inativo)
  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quiz")
        .update({ status: "inativo" } as any)
        .eq("id", id as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions"] });
      toast.success("Pergunta arquivada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao arquivar pergunta", {
        description: error.message,
      });
    },
  });

  // Atualizar status de um quiz inteiro (todas as perguntas)
  const updateQuizStatus = useMutation({
    mutationFn: async ({ quizName, lessonId, turmaId, status }: { quizName: string; lessonId: string; turmaId: string | null; status: string }) => {
      let query = supabase
        .from('quiz')
        .update({ status } as any)
        .eq('quiz_name', quizName as any)
        .eq('lesson_id', lessonId as any);

      if (turmaId) {
        query = query.eq('turma_id', turmaId as any);
      } else {
        query = query.is('turma_id', null);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions"] });
      toast.success(`Quiz ${variables.status === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar status do quiz", {
        description: error.message,
      });
    }
  });

  return {
    data,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    updateQuizStatus,
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
        .eq("lesson_id", lessonId as any)
        .order("order_index", { ascending: true });

      // If turmaId is provided, get both general quizzes and turma-specific quizzes (only active for students)
      if (turmaId) {
        query = query.or(`turma_id.is.null,turma_id.eq.${turmaId}`)
                    .eq("status", "ativo" as any);
      } else {
        // If no turmaId provided, get only general quizzes (no turma_id) that are active
        query = query.is("turma_id", null)
                    .eq("status", "ativo" as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
};