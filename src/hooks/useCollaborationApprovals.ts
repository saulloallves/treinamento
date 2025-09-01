import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CollaborationApproval {
  id: string;
  collaborator_id: string;
  franchisee_id: string | null;
  unit_code: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
  collaborator_name: string;
  collaborator_email: string;
  collaborator_role?: string;
}

// Hook para buscar aprovações pendentes por unit_code (para franqueados)
export const useUnitCollaborationApprovals = (unitCode: string) => {
  return useQuery({
    queryKey: ['unit-collaboration-approvals', unitCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_approvals')
        .select(`
          id,
          collaborator_id,
          franchisee_id,
          unit_code,
          status,
          created_at,
          users!collaboration_approvals_collaborator_id_fkey(name, email, role)
        `)
        .eq('unit_code', unitCode)
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(approval => ({
        id: approval.id,
        collaborator_id: approval.collaborator_id,
        franchisee_id: approval.franchisee_id,
        unit_code: approval.unit_code,
        status: approval.status,
        created_at: approval.created_at,
        collaborator_name: (approval.users as any)?.name || 'Nome não informado',
        collaborator_email: (approval.users as any)?.email || 'Email não informado',
        collaborator_role: (approval.users as any)?.role || 'Colaborador',
      })) || [];
    },
    enabled: !!unitCode,
  });
};

// Hook para contagem de aprovações pendentes por unit_code
export const useUnitApprovalCount = (unitCode: string) => {
  return useQuery({
    queryKey: ['unit-approval-count', unitCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_approvals')
        .select('id', { count: 'exact' })
        .eq('unit_code', unitCode)
        .eq('status', 'pendente');

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!unitCode,
  });
};

// Hook para aprovar/rejeitar colaborador
export const useApproveCollaborator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ approvalId, approve }: { approvalId: string, approve: boolean }) => {
      const { error } = await supabase.rpc('approve_collaborator', {
        _approval_id: approvalId,
        _approve: approve
      });

      if (error) throw error;
      return { approvalId, approve };
    },
    onSuccess: (result, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['unit-collaboration-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['unit-approval-count'] });
      queryClient.invalidateQueries({ queryKey: ['pending-collaborator-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['unidade-colaborators'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      toast({
        title: variables.approve ? "Colaborador aprovado!" : "Colaborador rejeitado!",
        description: variables.approve 
          ? "O colaborador já pode acessar o sistema." 
          : "O colaborador foi rejeitado e não terá acesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar aprovação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para criar colaborador via admin (dispara notificação)
export const useCreateCollaborator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (collaboratorData: {
      name: string;
      email: string;
      password: string;
      unitCode: string;
      position?: string;
    }) => {
      // 1. Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: collaboratorData.email,
        password: collaboratorData.password,
        user_metadata: {
          full_name: collaboratorData.name,
          user_type: 'Aluno',
          role: 'Colaborador',
          unit_code: collaboratorData.unitCode
        },
        email_confirm: true
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // 2. Criar registro na tabela users
      const { error: userError } = await supabase.from('users').insert([{
        id: authData.user.id,
        name: collaboratorData.name,
        email: collaboratorData.email,
        user_type: 'Aluno',
        role: 'Colaborador',
        unit_code: collaboratorData.unitCode,
        position: collaboratorData.position,
        approval_status: 'pendente',
        active: true,
      }]);

      if (userError) throw userError;

      // 3. Disparar notificação para franqueado
      const { error: notificationError } = await supabase.functions.invoke('notify-franchisee', {
        body: {
          collaboratorId: authData.user.id,
          collaboratorName: collaboratorData.name,
          unitCode: collaboratorData.unitCode
        }
      });

      if (notificationError) {
        console.warn('Erro ao enviar notificação:', notificationError);
        // Não falha a operação, apenas avisa
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['unidade-colaborators'] });
      queryClient.invalidateQueries({ queryKey: ['unit-collaboration-approvals'] });
      
      toast({
        title: "Colaborador criado com sucesso!",
        description: "O franqueado da unidade foi notificado para aprovar o acesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar colaborador",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
};