import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TestQuestion, TestQuestionOption } from "./useTests";

export const useTestQuestions = (testId: string) => {
  return useQuery({
    queryKey: ['test-questions', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_questions')
        .select(`
          *,
          test_question_options(*)
        `)
        .eq('test_id', testId)
        .order('question_order', { ascending: true });

      if (error) throw error;
      return data as TestQuestion[];
    },
    enabled: !!testId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (questionData: {
      test_id: string;
      question_text: string;
      question_order: number;
      image_urls?: string[];
      options: Array<{
        option_text: string;
        score_value: number;
        option_order: number;
      }>;
    }) => {
      const { options, ...questionInfo } = questionData;
      
      // Create question first
      const { data: question, error: questionError } = await supabase
        .from('test_questions')
        .insert([questionInfo])
        .select()
        .single();

      if (questionError) throw questionError;

      // Create options
      const optionsWithQuestionId = options.map(option => ({
        ...option,
        question_id: question.id,
      }));

      const { error: optionsError } = await supabase
        .from('test_question_options')
        .insert(optionsWithQuestionId);

      if (optionsError) throw optionsError;

      return question;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['test-questions', variables.test_id] });
      queryClient.invalidateQueries({ queryKey: ['test', variables.test_id] });
      toast({
        title: "Sucesso",
        description: "Pergunta criada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar pergunta: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (questionData: {
      id: string;
      test_id: string;
      question_text: string;
      question_order: number;
      image_urls?: string[];
      options: Array<{
        id?: string;
        option_text: string;
        score_value: number;
        option_order: number;
      }>;
    }) => {
      const { options, id, ...questionInfo } = questionData;
      
      // Update question
      const { error: questionError } = await supabase
        .from('test_questions')
        .update(questionInfo)
        .eq('id', id);

      if (questionError) throw questionError;

      // Delete existing options
      await supabase
        .from('test_question_options')
        .delete()
        .eq('question_id', id);

      // Create new options
      const optionsWithQuestionId = options.map(option => ({
        option_text: option.option_text,
        score_value: option.score_value,
        option_order: option.option_order,
        question_id: id,
      }));

      const { error: optionsError } = await supabase
        .from('test_question_options')
        .insert(optionsWithQuestionId);

      if (optionsError) throw optionsError;

      return { id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['test-questions', variables.test_id] });
      queryClient.invalidateQueries({ queryKey: ['test', variables.test_id] });
      toast({
        title: "Sucesso",
        description: "Pergunta atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar pergunta: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ questionId, testId }: { questionId: string; testId: string }) => {
      const { error } = await supabase
        .from('test_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      return { testId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['test-questions', data.testId] });
      queryClient.invalidateQueries({ queryKey: ['test', data.testId] });
      toast({
        title: "Sucesso",
        description: "Pergunta excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir pergunta: " + error.message,
        variant: "destructive",
      });
    },
  });
};