import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export interface TestSubmission {
  id: string;
  test_id: string;
  user_id: string;
  attempt_number: number;
  status: 'in_progress' | 'completed' | 'expired';
  total_score: number;
  max_possible_score: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  submitted_at?: string;
  time_taken_minutes?: number;
}

export interface TestResponse {
  id: string;
  test_id: string;
  question_id: string;
  user_id: string;
  selected_option_id?: string;
  score_obtained: number;
  answered_at: string;
}

export const useTestSubmission = () => {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const startTestMutation = useMutation({
    mutationFn: async (testId: string): Promise<TestSubmission> => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      // Verificar quantas tentativas já foram feitas
      const { data: existingSubmissions, error: submissionsError } = await supabase
        .from("test_submissions")
        .select("attempt_number")
        .eq("test_id", testId)
        .eq("user_id", currentUser.id)
        .order("attempt_number", { ascending: false });

      if (submissionsError) throw submissionsError;

      // Verificar limite de tentativas
      const { data: test, error: testError } = await supabase
        .from("tests")
        .select("max_attempts")
        .eq("id", testId)
        .single();

      if (testError) throw testError;

      const nextAttempt = (existingSubmissions?.[0]?.attempt_number || 0) + 1;
      
      if (test.max_attempts && nextAttempt > test.max_attempts) {
        throw new Error("Limite de tentativas excedido");
      }

      // Criar nova submission
      const { data, error } = await supabase
        .from("test_submissions")
        .insert({
          test_id: testId,
          user_id: currentUser.id,
          attempt_number: nextAttempt,
          status: 'in_progress',
          total_score: 0,
          max_possible_score: 0,
          percentage: 0,
          passed: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-tests"] });
    },
  });

  const saveResponseMutation = useMutation({
    mutationFn: async ({ 
      submissionId, 
      questionId, 
      optionId 
    }: { 
      submissionId: string; 
      questionId: string; 
      optionId: string; 
    }) => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      // Buscar submission para obter test_id
      const { data: submission, error: submissionError } = await supabase
        .from("test_submissions")
        .select("test_id")
        .eq("id", submissionId)
        .single();

      if (submissionError) throw submissionError;

      // Buscar score da opção selecionada
      const { data: option, error: optionError } = await supabase
        .from("test_question_options")
        .select("score_value")
        .eq("id", optionId)
        .single();

      if (optionError) throw optionError;

      // Verificar se já existe resposta para esta questão
      const { data: existingResponse } = await supabase
        .from("test_responses")
        .select("id")
        .eq("test_id", submission.test_id)
        .eq("question_id", questionId)
        .eq("user_id", currentUser.id)
        .single();

      if (existingResponse) {
        // Atualizar resposta existente
        const { error: updateError } = await supabase
          .from("test_responses")
          .update({
            selected_option_id: optionId,
            score_obtained: option.score_value,
            answered_at: new Date().toISOString()
          })
          .eq("id", existingResponse.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova resposta
        const { error: insertError } = await supabase
          .from("test_responses")
          .insert({
            test_id: submission.test_id,
            question_id: questionId,
            user_id: currentUser.id,
            selected_option_id: optionId,
            score_obtained: option.score_value
          });

        if (insertError) throw insertError;
      }
    },
  });

  const submitTestMutation = useMutation({
    mutationFn: async (submissionId: string): Promise<TestSubmission> => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      // Buscar submission
      const { data: submission, error: submissionError } = await supabase
        .from("test_submissions")
        .select("test_id, started_at")
        .eq("id", submissionId)
        .single();

      if (submissionError) throw submissionError;

      // Calcular pontuação total
      const { data: responses, error: responsesError } = await supabase
        .from("test_responses")
        .select("score_obtained")
        .eq("test_id", submission.test_id)
        .eq("user_id", currentUser.id);

      if (responsesError) throw responsesError;

      const totalScore = responses?.reduce((sum, r) => sum + r.score_obtained, 0) || 0;

      // Buscar pontuação máxima possível
      const { data: questions, error: questionsError } = await supabase
        .from("test_questions")
        .select(`
          test_question_options (
            score_value
          )
        `)
        .eq("test_id", submission.test_id);

      if (questionsError) throw questionsError;

      const maxPossibleScore = questions?.reduce((sum, q) => {
        const maxOptionScore = Math.max(...(q.test_question_options?.map(o => o.score_value) || [0]));
        return sum + maxOptionScore;
      }, 0) || 0;

      const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      // Buscar nota mínima para aprovação
      const { data: test, error: testError } = await supabase
        .from("tests")
        .select("passing_percentage")
        .eq("id", submission.test_id)
        .single();

      if (testError) throw testError;

      const passed = percentage >= test.passing_percentage;

      // Calcular tempo gasto
      const startTime = new Date(submission.started_at).getTime();
      const submitTime = Date.now();
      const timeTakenMinutes = Math.round((submitTime - startTime) / (1000 * 60));

      // Atualizar submission
      const { data: updatedSubmission, error: updateError } = await supabase
        .from("test_submissions")
        .update({
          status: 'completed',
          total_score: totalScore,
          max_possible_score: maxPossibleScore,
          percentage: percentage,
          passed: passed,
          submitted_at: new Date().toISOString(),
          time_taken_minutes: timeTakenMinutes
        })
        .eq("id", submissionId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedSubmission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-tests"] });
    },
  });

  const getCurrentSubmissionQuery = async (testId: string) => {
    if (!currentUser?.id) return null;

    const { data, error } = await supabase
      .from("test_submissions")
      .select("*")
      .eq("test_id", testId)
      .eq("user_id", currentUser.id)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  };

  return {
    startTest: startTestMutation.mutateAsync,
    saveResponse: saveResponseMutation.mutateAsync,
    submitTest: submitTestMutation.mutateAsync,
    getCurrentSubmission: getCurrentSubmissionQuery,
    isLoading: startTestMutation.isPending || saveResponseMutation.isPending || submitTestMutation.isPending,
  };
};