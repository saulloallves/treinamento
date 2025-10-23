import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Função que chama a edge function ORQUESTRADORA correta
const approveCollaborator = async (collaborator: { email: string }) => {
  const { error } = await supabase.functions.invoke('update-collaborator-details', {
    body: { email: collaborator.email },
  });

  if (error) {
    throw new Error(error.message);
  }
  return { success: true };
};

// Função para rejeitar um colaborador
const rejectCollaborator = async (userId: string) => {
  const { error } = await supabase
    .from('users')
    .update({ approval_status: 'rejeitado', active: false })
    .eq('id', userId);

  if (error) {
    throw new Error(`Falha ao rejeitar colaborador: ${error.message}`);
  }
  return { success: true };
};

export const useCollaborationApprovals = () => {
  const queryClient = useQueryClient();

  const approvalMutation = useMutation({
    mutationFn: approveCollaborator,
    onSuccess: () => {
      toast.success('Colaborador aprovado com sucesso!', {
        description: 'O grupo do WhatsApp será criado em instantes.',
      });
      // Invalida ambas as queries para garantir que as listas de admin e franqueado sejam atualizadas
      queryClient.invalidateQueries({ queryKey: ['pendingCollaborators'] });
      queryClient.invalidateQueries({ queryKey: ['allPendingCollaborators'] });
    },
    onError: (error: Error) => {
      toast.error('Falha na Aprovação', {
        description: error.message,
      });
    },
  });

  const rejectionMutation = useMutation({
    mutationFn: rejectCollaborator,
    onSuccess: () => {
      toast.success('Colaborador rejeitado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['pendingCollaborators'] });
      queryClient.invalidateQueries({ queryKey: ['allPendingCollaborators'] });
    },
    onError: (error: Error) => {
      toast.error('Falha ao Rejeitar', {
        description: error.message,
      });
    },
  });

  return {
    approve: approvalMutation.mutate,
    isApproving: approvalMutation.isPending,
    reject: rejectionMutation.mutate,
    isRejecting: rejectionMutation.isPending,
  };
};