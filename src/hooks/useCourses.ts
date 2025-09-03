
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Course {
  id: string;
  name: string;
  description?: string;
  theme: string[];
  public_target: string;
  mandatory: boolean;
  has_quiz: boolean;
  generates_certificate: boolean;
  lessons_count: number;
  status: string;
  tipo: 'ao_vivo' | 'gravado';
  instructor?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseInput {
  name: string;
  description?: string;
  theme: string[];
  public_target: string;
  has_quiz: boolean;
  generates_certificate: boolean;
  tipo: 'ao_vivo' | 'gravado';
  instructor?: string;
  status?: string;
}

export const useCourses = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: "Erro ao carregar cursos",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Course[];
    }
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseData: CourseInput) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...courseData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating course:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Curso criado com sucesso!",
        description: "O novo curso foi adicionado à lista.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar curso",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...courseData }: Course) => {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating course:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Curso atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar curso",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        console.error('Error deleting course:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Curso excluído com sucesso!",
        description: "O curso foi removido da lista.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir curso",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};
