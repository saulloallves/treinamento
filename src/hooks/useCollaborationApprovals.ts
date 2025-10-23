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
      queryClient.invalidateQueries({ queryKey: ['pendingCollaborators'] });
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

// --- ARMADILHA DE DEPURAÇÃO 1 ---
export const useCreateCollaborator = () => {
  const mutate = () => {
    const errorMessage = "ERRO DE DEPURAÇÃO: A chamada incorreta para 'useCreateCollaborator' foi encontrada! Verifique o stack trace no console para ver qual componente está chamando esta função obsoleta.";
    console.error(errorMessage, new Error().stack);
    toast.error("Erro de Desenvolvimento Detectado", {
      description: "Uma função obsoleta foi chamada. Verifique o console para mais detalhes.",
    });
  };

  return {
    mutate,
    isPending: false,
  };
};

// --- ARMADILHA DE DEPURAÇÃO 2 ---
export const useApproveCollaborator = () => {
  const mutate = () => {
    const errorMessage = "ERRO DE DEPURAÇÃO: A chamada incorreta para 'useApproveCollaborator' foi encontrada! Verifique o stack trace no console para ver qual componente está chamando esta função obsoleta.";
    console.error(errorMessage, new Error().stack);
    toast.error("Erro de Desenvolvimento Detectado", {
      description: "Uma função obsoleta 'useApproveCollaborator' foi chamada. Verifique o console.",
    });
  };

  return {
    mutate,
    isPending: false,
  };
};