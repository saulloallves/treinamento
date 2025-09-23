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

      // Create the options
      if (questionData.options && questionData.options.length > 0) {
        const optionsToInsert = questionData.options.map(option => ({
          question_id: question.id,
          option_text: option.option_text,
          score_value: option.score_value,
          option_order: option.option_order
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
      // Update the question
      const { data, error } = await supabase
        .from("test_questions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update options if provided
      if (options) {
        // Delete existing options
        await supabase
          .from("test_question_options")
          .delete()
          .eq("question_id", id);

        // Insert new options
        if (options.length > 0) {
          const optionsToInsert = options.map(option => ({
            question_id: id,
            option_text: option.option_text,
            score_value: option.score_value,
            option_order: option.option_order
          }));

          await supabase
            .from("test_question_options")
            .insert(optionsToInsert);
        }
      }

      return data;
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
