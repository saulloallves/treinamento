import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuiz = () => {
  const queryClient = useQueryClient();

  // Buscar todas as perguntas do quiz
  const { data, isLoading, error } = useQuery({
    queryKey: ["quiz-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
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
          )
        `)
        .order("order_index", { ascending: true });

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

  return {
    data,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
};

// Hook separado para buscar perguntas por aula
export const useQuestionsByLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ["quiz-lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
};