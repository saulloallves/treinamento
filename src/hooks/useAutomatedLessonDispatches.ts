import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AutomatedLessonDispatch {
  id: string;
  lesson_id: string;
  dispatch_type: '2_hours_before' | '30_minutes_before';
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AutomatedDispatchInput {
  lesson_id: string;
  dispatch_type: '2_hours_before' | '30_minutes_before';
  message_template: string;
  is_active?: boolean;
}

export const useAutomatedLessonDispatches = (lessonId?: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['automated-lesson-dispatches', lessonId],
    queryFn: async () => {
      let query = supabase
        .from('automated_lesson_dispatches')
        .select('*')
        .order('dispatch_type', { ascending: true });

      if (lessonId) {
        query = query.eq('lesson_id', lessonId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching automated dispatches:', error);
        toast({
          title: "Erro ao carregar disparos automáticos",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as AutomatedLessonDispatch[];
    },
    enabled: true
  });
};

export const useCreateAutomatedDispatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dispatchData: AutomatedDispatchInput) => {
      const { data, error } = await supabase
        .from('automated_lesson_dispatches')
        .upsert({
          ...dispatchData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating automated dispatch:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-lesson-dispatches'] });
      toast({
        title: "Disparo automático configurado",
        description: "A configuração foi salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error in automated dispatch mutation:', error);
      toast({
        title: "Erro ao configurar disparo",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAutomatedDispatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutomatedLessonDispatch> & { id: string }) => {
      const { data, error } = await supabase
        .from('automated_lesson_dispatches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating automated dispatch:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-lesson-dispatches'] });
      toast({
        title: "Configuração atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating automated dispatch:', error);
      toast({
        title: "Erro ao atualizar configuração",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAutomatedDispatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automated_lesson_dispatches')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting automated dispatch:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-lesson-dispatches'] });
      toast({
        title: "Configuração removida",
        description: "O disparo automático foi desabilitado.",
      });
    },
    onError: (error) => {
      console.error('Error deleting automated dispatch:', error);
      toast({
        title: "Erro ao remover configuração",
        description: "Não foi possível desabilitar o disparo automático.",
        variant: "destructive",
      });
    },
  });
};