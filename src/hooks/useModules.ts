import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Module {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ModuleInput {
  course_id: string;
  name: string;
  description?: string;
  order_index: number;
  status?: string;
}

export const useModules = (courseId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      let query = supabase
        .from('modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching modules:', error);
        toast({
          title: "Erro ao carregar módulos",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Module[];
    },
    enabled: !!courseId,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (moduleData: ModuleInput) => {
      const { data, error } = await supabase
        .from('modules')
        .insert([{
          ...moduleData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating module:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({
        title: "Módulo criado com sucesso!",
        description: "O novo módulo foi adicionado ao curso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar módulo",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...moduleData }: Module) => {
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating module:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({
        title: "Módulo atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar módulo",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) {
        console.error('Error deleting module:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['recorded-lessons'] });
      toast({
        title: "Módulo excluído com sucesso!",
        description: "O módulo e suas aulas foram removidos.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir módulo",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};