
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppDispatch {
  id: string;
  type: 'curso' | 'aula' | 'turma';
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
  type: 'curso' | 'aula' | 'turma';
  item_id: string;
  item_name: string;
  turma_id?: string;
  message: string;
  recipient_mode?: 'all' | 'selected';
  recipient_ids?: string[]; // enrollment ids when mode is 'selected'
  is_scheduled?: boolean;
  scheduled_at?: string;
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
      const { data, error } = await supabase.functions.invoke('whatsapp-disparo', {
        body: dispatchData,
      });

      if (error) {
        console.error('Error creating WhatsApp dispatch:', error);
        throw error;
      }

      return data as any; // { ok, dispatch, delivered, failed, recipients_count, results }
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp_dispatches'] });
      
      if (resp?.scheduled) {
        // Handle scheduled dispatch success
        toast({
          title: 'Disparo agendado com sucesso!',
          description: `O disparo será enviado automaticamente em ${new Date(resp.scheduled_at).toLocaleString('pt-BR')}`,
        });
        return;
      }
      
      const delivered = resp?.delivered ?? 0;
      const failed = resp?.failed ?? 0;
      const firstErr = resp?.results?.find?.((r: any) => !r.ok)?.error;
      const description = failed > 0
        ? `Entregues: ${delivered} • Falhas: ${failed}${firstErr ? ` • Primeiro erro: ${String(firstErr).slice(0, 200)}` : ''}`
        : `Entregues: ${delivered} de ${resp?.recipients_count ?? 0}`;
      toast({
        title: failed > 0 ? 'Disparo concluído com falhas' : 'Disparo realizado com sucesso!',
        description,
        ...(failed > 0 ? { variant: 'destructive' as const } : {}),
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
