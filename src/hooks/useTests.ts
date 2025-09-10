import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Test {
  id: string;
  name: string;
  description?: string;
  course_id: string;
  turma_id: string;
  passing_percentage: number;
  max_attempts: number;
  time_limit_minutes?: number;
  status: 'draft' | 'active' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
  courses?: { name: string };
  turmas?: { name: string };
  _count?: {
    test_questions: number;
    test_submissions: number;
  };
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  question_order: number;
  image_urls?: string[];
  created_at: string;
  test_question_options: TestQuestionOption[];
}

export interface TestQuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  score_value: number;
  option_order: number;
  created_at: string;
}

export interface TestSubmission {
  id: string;
  test_id: string;
  user_id: string;
  attempt_number: number;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  passed: boolean;
  status: 'in_progress' | 'completed' | 'expired';
  started_at: string;
  submitted_at?: string;
  time_taken_minutes?: number;
  users?: { name: string; email: string };
}

export const useTests = (turmaId?: string) => {
  return useQuery({
    queryKey: ['tests', turmaId],
    queryFn: async () => {
      let query = supabase
        .from('tests')
        .select(`
          *,
          courses(name),
          turmas(name)
        `)
        .order('created_at', { ascending: false });

      if (turmaId) {
        query = query.eq('turma_id', turmaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Test[];
    },
  });
};

export const useTest = (testId: string) => {
  return useQuery({
    queryKey: ['test', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select(`
          *,
          courses(name),
          turmas(name),
          test_questions(
            *,
            test_question_options(*)
          )
        `)
        .eq('id', testId)
        .single();

      if (error) throw error;
      return data as Test & { test_questions: TestQuestion[] };
    },
    enabled: !!testId,
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (testData: {
      name: string;
      description?: string;
      course_id: string;
      turma_id: string;
      passing_percentage: number;
      max_attempts: number;
      time_limit_minutes?: number;
      status: 'draft' | 'active' | 'archived';
    }) => {
      const { data, error } = await supabase
        .from('tests')
        .insert([testData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast({
        title: "Sucesso",
        description: "Teste criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar teste: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...testData }: Partial<Test> & { id: string }) => {
      const { data, error } = await supabase
        .from('tests')
        .update(testData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['test'] });
      toast({
        title: "Sucesso",
        description: "Teste atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar teste: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (testId: string) => {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast({
        title: "Sucesso",
        description: "Teste excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir teste: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useTestSubmissions = (testId: string) => {
  return useQuery({
    queryKey: ['test-submissions', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_submissions')
        .select(`
          *,
          users!inner(name, email)
        `)
        .eq('test_id', testId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!testId,
  });
};