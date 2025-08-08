
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppDispatch {
  id: string;
  type: 'curso' | 'aula';
  item_id: string;
  item_name: string;
  recipients_count: number;
  message: string;
  sent_date: string;
  status: string;
  delivered_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface DispatchInput {
  type: 'curso' | 'aula';
  item_id: string;
  item_name: string;
  recipients_count: number;
  message: string;
  delivered_count?: number;
  failed_count?: number;
}

export const useWhatsAppDispatches = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['whatsapp_dispatches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_dispatches')
        .select('*')
        .order('sent_date', { ascending: false });

      if (error) {
        console.error('Error fetching WhatsApp dispatches:', error);
        toast({
          title: "Erro ao carregar histórico de disparos",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as WhatsAppDispatch[];
    }
  });
};

export const useCreateWhatsAppDispatch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (dispatchData: DispatchInput) => {
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('whatsapp_dispatches')
        .insert([{
          ...dispatchData,
          created_by: user.data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating WhatsApp dispatch:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp_dispatches'] });
      toast({
        title: "Disparo registrado com sucesso!",
        description: "O histórico foi atualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar disparo",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};
