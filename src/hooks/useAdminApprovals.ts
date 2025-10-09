import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PendingAdmin {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export const usePendingAdminApprovals = () => {
  return useQuery({
    queryKey: ['pending-admin-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_pending_admin_approvals');
      
      if (error) {
        console.error('Error fetching pending admin approvals:', error);
        throw error;
      }
      
      return data as PendingAdmin[];
    }
  });
};

export const useApproveAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (adminUserId: string) => {
      const { error } = await supabase.rpc('approve_admin_user', {
        admin_user_id: adminUserId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-admin-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Admin aprovado com sucesso!",
        description: "O usuário agora tem acesso administrativo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aprovar admin",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useRejectAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (adminUserId: string) => {
      const { error } = await supabase.rpc('reject_admin_user', {
        admin_user_id: adminUserId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-admin-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Admin rejeitado",
        description: "A solicitação de acesso administrativo foi rejeitada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao rejeitar admin",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};