/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treinamento } from '@/integrations/supabase/helpers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await treinamento.collaboration_approvals()
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
      const { count, error } = await treinamento.collaboration_approvals()
        .select('*', { count: 'exact', head: true })
        .eq('unit_code', unitCode)
        .eq('status', 'pendente');

      if (error) throw error;
      return count || 0;
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
      // First, approve/reject in database
      const { error: approveError } = await supabase.rpc('approve_collaborator', {
        _approval_id: approvalId,
        _approve: approve
      });

      if (approveError) throw approveError;

      // If approved, handle WhatsApp group management
      if (approve) {
        // Get approval details
        const { data: approval } = await supabase
          .from('collaboration_approvals')
          .select('unit_code, collaborator_id')
          .eq('id', approvalId)
          .single();

        if (!approval) return { approvalId, approve };

        // Get unit details
        const { data: unit } = await supabase
          .from('unidades')
          .select('id, grupo, id_grupo_colab')
          .eq('id', approval.unit_code)
          .single();

        if (!unit) return { approvalId, approve };

        let grupoColaborador = unit.id_grupo_colab;

        // Verificar se já existe um grupo de colaboradores para esta unidade
        if (!grupoColaborador || grupoColaborador === '') {
          console.log(`Grupo de colaboradores não existe para unidade ${approval.unit_code}. Criando novo grupo...`);
          try {
            const { data: groupData } = await supabase.functions.invoke('create-collaborator-group', {
              body: {
                unit_code: approval.unit_code,
                grupo: unit.grupo
              }
            });

            if (groupData?.groupId) {
              grupoColaborador = groupData.groupId;
              console.log(`Grupo criado com sucesso! ID: ${grupoColaborador}`);
            }
          } catch (error) {
            console.error('Error creating collaborator group:', error);
          }
        } else {
          console.log(`Grupo de colaboradores já existe para unidade ${approval.unit_code}. Usando grupo existente: ${grupoColaborador}`);
        }

        // Adicionar todos os colaboradores aprovados ao grupo (incluindo o novo aprovado)
        if (grupoColaborador && grupoColaborador !== '') {
          const { data: collaborators } = await treinamento
            .from('users')
            .select('phone, name')
            .eq('unit_code', approval.unit_code)
            .eq('role', 'Colaborador')
            .eq('approval_status', 'aprovado')
            .eq('active', true)
            .not('phone', 'is', null);

          if (collaborators && collaborators.length > 0) {
            console.log(`Adicionando ${collaborators.length} colaborador(es) ao grupo ${grupoColaborador}`);
            for (const collaborator of collaborators) {
              try {
                console.log(`Adicionando colaborador ${collaborator.name} (${collaborator.phone}) ao grupo...`);
                await supabase.functions.invoke('add-collaborator-to-group', {
                  body: {
                    groupId: grupoColaborador,
                    phone: collaborator.phone,
                    name: collaborator.name
                  }
                });
                console.log(`✅ Colaborador ${collaborator.name} adicionado com sucesso ao grupo!`);
              } catch (error) {
                console.error(`❌ Erro ao adicionar colaborador ${collaborator.name} ao grupo:`, error);
              }
            }
          }
        }
      }

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
      // 1. Verificar se o usuário já existe no auth
      let authData;
      let userId;
      
      try {
        // Primeiro tenta criar o usuário
        const createResult = await supabase.auth.admin.createUser({
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

        if (createResult.error && createResult.error.message.includes('already been registered')) {
          // Usuário já existe no auth, buscar o ID
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          if (!existingUsers.users) {
            throw new Error("Erro ao buscar usuários existentes");
          }
          
          const existingUser = existingUsers.users.find((u: any) => 
            u.email?.toLowerCase() === collaboratorData.email.toLowerCase()
          );
          
          if (!existingUser) {
            throw new Error("Usuário não encontrado");
          }
          
          userId = existingUser.id;
          console.log('Using existing auth user:', userId);
        } else if (createResult.error) {
          throw createResult.error;
        } else {
          authData = createResult;
          userId = authData.user?.id;
          if (!userId) throw new Error("Erro ao criar usuário");
        }
      } catch (error) {
        console.error('Error in user creation/verification:', error);
        throw error;
      }

      // 2. Verificar se já existe registro na tabela users
      const { data: existingUserRecord } = await treinamento.users()
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingUserRecord) {
        // 3. Criar registro na tabela users
        const { error: userError } = await treinamento.users().insert([{
          id: userId,
          name: collaboratorData.name,
          email: collaboratorData.email,
          user_type: 'Aluno',
          role: 'Colaborador',
          unit_code: collaboratorData.unitCode,
          position: collaboratorData.position,
          approval_status: 'pendente',
          active: true,
        }]);

        if (userError) {
          console.error('Error creating user record:', userError);
          throw userError;
        }
      } else {
        console.log('User record already exists, updating status to pendente');
        // Atualizar status para pendente se o usuário já existir
        const { error: updateError } = await treinamento.users()
          .update({
            approval_status: 'pendente',
            name: collaboratorData.name,
            unit_code: collaboratorData.unitCode,
            position: collaboratorData.position,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user record:', updateError);
          throw updateError;
        }
      }

      // 4. Disparar notificação para franqueado
      const { error: notificationError } = await supabase.functions.invoke('notify-franchisee', {
        body: {
          collaboratorId: userId,
          collaboratorName: collaboratorData.name,
          collaboratorEmail: collaboratorData.email,
          collaboratorPosition: collaboratorData.position,
          unitCode: collaboratorData.unitCode
        }
      });

      if (notificationError) {
        console.warn('Erro ao enviar notificação:', notificationError);
        // Não falha a operação, apenas avisa
      }

      return { id: userId };
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

// Hook para criar grupo de colaboradores manualmente
export const useCreateCollaboratorGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ unitCode, grupo }: { unitCode: string; grupo: string }) => {
      const { data, error } = await supabase.functions.invoke('create-collaborator-group', {
        body: {
          unit_code: unitCode,
          grupo: grupo
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-info'] });
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
      
      toast({
        title: "Grupo criado com sucesso!",
        description: `Grupo ${data.groupName} criado no WhatsApp.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar grupo",
        description: error.message || "Ocorreu um erro ao criar o grupo no WhatsApp.",
        variant: "destructive",
      });
    },
  });
};