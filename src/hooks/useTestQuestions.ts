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

      // For now, return empty array until Supabase types are updated
      // This will be replaced with proper queries once the tables are properly typed
      return [] as TestQuestion[];
    },
    enabled: !!testId,
  });

  const createQuestion = useMutation({
    mutationFn: async (questionData: CreateQuestionData) => {
      // Placeholder implementation
      console.log('Creating question:', questionData);
      return { id: 'temp-id', ...questionData };
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
      // Placeholder implementation
      console.log('Updating question:', id, updates, options);
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      // Placeholder implementation
      console.log('Deleting question:', id);
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
