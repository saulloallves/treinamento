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
      const { data, error } = await supabase.rpc('get_system_settings');

      if (error) {
        console.error('Error fetching settings:', error);
        // Retorna configurações padrão se não existir
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

      // Retorna primeira configuração do RPC ou configurações padrão
      return data?.[0] || {
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
    },
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<SystemSettings>) => {
      const { data, error } = await supabase.rpc('update_system_settings', {
        settings_data: settings
      });

      if (error) throw error;
      return data?.[0];
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