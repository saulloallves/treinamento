import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  question_order: number;
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
          options:test_question_options (
            id,
            option_text,
            score_value,
            option_order,
            created_at
          )
        `)
        .eq("test_id", testId)
        .order("question_order", { ascending: true });

      if (error) throw error;
      return data as TestQuestion[];
    },
    enabled: !!testId,
  });

  const createQuestion = useMutation({
    mutationFn: async (questionData: CreateQuestionData) => {
      // First create the question
      const { data: question, error: questionError } = await supabase
        .from("test_questions")
        .insert([{
          test_id: questionData.test_id,
          question_text: questionData.question_text,
          question_order: questionData.question_order,
          image_urls: questionData.image_urls,
        }])
        .select()
        .single();

      if (questionError) throw questionError;

      // Then create the options
      const optionsWithQuestionId = questionData.options.map(option => ({
        ...option,
        question_id: question.id,
      }));

      const { error: optionsError } = await supabase
        .from("test_question_options")
        .insert(optionsWithQuestionId);

      if (optionsError) throw optionsError;

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
      // Update question
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
        const optionsWithQuestionId = options.map(option => ({
          ...option,
          question_id: id,
        }));

        await supabase
          .from("test_question_options")
          .insert(optionsWithQuestionId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      // Options will be deleted automatically due to foreign key cascade
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