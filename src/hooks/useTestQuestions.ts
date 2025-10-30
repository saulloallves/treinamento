import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  question_order: number;
  question_type: 'multiple_choice' | 'essay';
  max_score?: number;
  image_urls?: string[];
  created_at: string;
  options?: TestQuestionOption[];
}

export interface TestQuestionOption {
  id?: string;
  question_id?: string;
  option_text: string;
  score_value: number;
  option_order: number;
  created_at?: string;
}

export interface CreateQuestionData {
  test_id: string;
  question_text: string;
  question_order: number;
  question_type: 'multiple_choice' | 'essay';
  max_score?: number;
  image_urls?: string[];
  options: Omit<TestQuestionOption, 'id' | 'question_id' | 'created_at'>[];
}

export const useTestQuestions = (testId?: string | null) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["test-questions", testId],
    queryFn: async () => {
      if (!testId) return [];

      const { data, error } = await supabase
        .from("test_questions")
        .select(`
          *,
          test_question_options (*)
        `)
        .eq("test_id", testId)
        .order("question_order", { ascending: true });

      if (error) throw error;
      
      return data?.map(question => ({
        ...question,
        options: question.test_question_options || []
      })) as TestQuestion[];
    },
    enabled: !!testId,
  });

  const createQuestion = useMutation({
    mutationFn: async (questionData: CreateQuestionData) => {
      // Validar alternativas antes de criar
      if (questionData.question_type === 'multiple_choice') {
        const validOptions = questionData.options.filter(opt =>
          opt.option_text && opt.option_text.trim().length > 0
        );

        if (validOptions.length < 2) {
          throw new Error('Questões de múltipla escolha precisam de pelo menos 2 alternativas');
        }

        // Verificar pontuações duplicadas
        const scores = validOptions.map(o => o.score_value);
        const uniqueScores = new Set(scores);
        if (scores.length !== uniqueScores.size) {
          throw new Error('Cada alternativa deve ter uma pontuação única');
        }

        questionData.options = validOptions;
      }

      // Create the question first
      const { data: question, error: questionError } = await supabase
        .from("test_questions")
        .insert({
          test_id: questionData.test_id,
          question_text: questionData.question_text,
          question_order: questionData.question_order,
          question_type: questionData.question_type,
          max_score: questionData.max_score,
          image_urls: questionData.image_urls || []
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Create the options only if it's a multiple choice question
      if (questionData.question_type === 'multiple_choice' && questionData.options.length > 0) {
        const optionsToInsert = questionData.options.map((option, index) => ({
          question_id: question.id,
          option_text: option.option_text.trim(),
          score_value: option.score_value,
          option_order: index + 1
        }));

        const { error: optionsError } = await supabase
          .from("test_question_options")
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;
      }

      return question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
    },
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ 
      id, 
      options, 
      ...updates 
    }: { id: string; options?: TestQuestionOption[] } & Partial<TestQuestion>) => {
      
      // If the question type is being changed to 'essay', we must delete all associated options.
      if (updates.question_type === 'essay') {
        const { error: deleteError } = await supabase
          .from("test_question_options")
          .delete()
          .eq("question_id", id);
        if (deleteError) throw deleteError;
      }
      // If options are provided and it's not an essay question, update/replace them.
      else if (options && updates.question_type !== 'essay') {
        // Filtrar apenas opções válidas
        const validOptions = options.filter(opt =>
          opt.option_text && opt.option_text.trim().length > 0
        );

        if (validOptions.length < 2) {
          throw new Error('Questões de múltipla escolha precisam de pelo menos 2 alternativas');
        }

        // Verificar pontuações duplicadas
        const scores = validOptions.map(o => o.score_value);
        const uniqueScores = new Set(scores);
        if (scores.length !== uniqueScores.size) {
          throw new Error('Cada alternativa deve ter uma pontuação única');
        }

        // Delete existing options to ensure a clean slate
        await supabase
          .from("test_question_options")
          .delete()
          .eq("question_id", id);

        // Insert new/updated options
        if (validOptions.length > 0) {
          const optionsToInsert = validOptions.map((option, index) => ({
            question_id: id,
            option_text: option.option_text.trim(),
            score_value: option.score_value,
            option_order: index + 1
          }));

          const { error: optionsError } = await supabase
            .from("test_question_options")
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }
      }

      // Update the question itself if there are other updates
      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabase
          .from("test_questions")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // If only options were updated, we still need to return the question data
      const { data: questionData, error: questionError } = await supabase
        .from("test_questions")
        .select()
        .eq("id", id)
        .single();

      if (questionError) throw questionError;
      return questionData;
    },
    onSuccess: () => {
      // Delay the invalidation to prevent UI flicker
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
      }, 500);
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      // Delete options first (cascade)
      await supabase
        .from("test_question_options")
        .delete()
        .eq("question_id", id);

      // Delete the question
      const { error } = await supabase
        .from("test_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
    },
  });

  return {
    data,
    isLoading,
    error,
    createQuestion: createQuestion.mutateAsync,
    updateQuestion: updateQuestion.mutateAsync,
    deleteQuestion: deleteQuestion.mutateAsync,
  };
};