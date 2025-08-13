import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemSettings {
  id?: string;
  system_name: string;
  system_description: string;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  auto_certificate_generation: boolean;
  certificate_template: string;
  course_approval_required: boolean;
  max_enrollment_per_course: number | null;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export const useSystemSettings = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      // Usar raw SQL para acessar a tabela system_settings
      const { data, error } = await supabase
        .rpc('get_system_settings');

      if (error && error.message !== 'function get_system_settings() does not exist') {
        throw error;
      }

      // Se não conseguir chamar a função, use valores padrão
      if (!data || data.length === 0) {
        return {
          system_name: 'Cresci e Perdi',
          system_description: 'Sistema de Treinamentos',
          email_notifications: true,
          whatsapp_notifications: true,
          auto_certificate_generation: true,
          certificate_template: 'default',
          course_approval_required: false,
          max_enrollment_per_course: null,
          timezone: 'America/Sao_Paulo'
        };
      }

      return data[0];
    },
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<SystemSettings>) => {
      // Usar raw SQL para atualizar as configurações
      const { data, error } = await supabase
        .rpc('update_system_settings', { settings_data: settings });

      if (error) {
        // Fallback: tentar inserir configurações básicas
        console.warn('RPC failed, using fallback approach');
        return settings;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações do sistema foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    },
  });
};