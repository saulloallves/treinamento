import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Test {
  id: string;
  name: string;
  description?: string;
  course_id?: string;
  turma_id?: string;
  passing_percentage: number;
  max_attempts: number;
  time_limit_minutes?: number;
  status: 'draft' | 'active' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTestData {
  name: string;
  description?: string;
  course_id: string;
  turma_id: string;
  passing_percentage: number;
  max_attempts: number;
  time_limit_minutes?: number;
  status: 'draft' | 'active' | 'archived';
}

export const useTests = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tests")
        .select(`
          *,
          turmas:turma_id (
            id,
            name,
            code,
            course_id
          ),
          courses:course_id (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Test[];
    },
  });

  const createTest = useMutation({
    mutationFn: async (testData: CreateTestData) => {
      const { data, error } = await supabase
        .from("tests")
        .insert([testData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });

  const updateTest = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Test>) => {
      const { data, error } = await supabase
        .from("tests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });

  const deleteTest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });

  const activateTest = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("tests")
        .update({ status: "active" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    createTest: createTest.mutateAsync,
    updateTest: updateTest.mutateAsync,
    deleteTest: deleteTest.mutateAsync,
    activateTest: activateTest.mutateAsync,
  };
};