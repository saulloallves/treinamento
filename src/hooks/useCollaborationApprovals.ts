/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treinamento } from '@/integrations/supabase/helpers';
import { useToast } from '@/hooks/use-toast';
import { supabase, supabasePublic } from '@/integrations/supabase/client';

const treinamentoQuery = treinamento as any;
const supabaseQuery = supabase as any;
const supabasePublicQuery = supabasePublic as any;

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
      const { data, error } = await (treinamentoQuery.collaboration_approvals() as any)
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

      const approvals = (data ?? []) as any[];
      return approvals.map((approval: any) => ({
        id: approval.id,
        collaborator_id: approval.collaborator_id,
        franchisee_id: approval.franchisee_id,
        unit_code: approval.unit_code,
        status: approval.status,
        created_at: approval.created_at,
        collaborator_name: approval.users?.name || 'Nome não informado',
        collaborator_email: approval.users?.email || 'Email não informado',
        collaborator_role: approval.users?.role || 'Colaborador',
      }));
    },
    enabled: !!unitCode,
  });
};

// Hook para contagem de aprovações pendentes por unit_code
export const useUnitApprovalCount = (unitCode: string) => {
  return useQuery({
    queryKey: ['unit-approval-count', unitCode],
    queryFn: async () => {
      const { count, error } = await (treinamentoQuery.collaboration_approvals() as any)
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

      // Se aprovado, lida com a lógica de criação ou adição a grupo do WhatsApp
      if (approve) {
        // Busca os detalhes da aprovação para obter o ID do colaborador e o código da unidade
        const { data: approval, error: approvalError } = await supabaseQuery
          .from('collaboration_approvals')
          .select('unit_code, collaborator_id')
          .eq('id', approvalId)
          .single();

        if (approvalError) throw new Error(`Erro ao buscar dados da aprovação: ${approvalError.message}`);
        if (!approval) return { approvalId, approve };

        // Busca os detalhes da unidade no schema 'public'
        const { data: unit, error: unitError } = await supabasePublicQuery
          .from('unidades')
          .select('group_name')
          .eq('group_code', (approval as any).unit_code)
          .single();

        if (unitError) throw new Error(`Erro ao buscar dados da unidade: ${unitError.message}`);
        if (!unit) return { approvalId, approve };

        const approvalData = approval as { unit_code: string; collaborator_id: string };
        const unitCode = approvalData.unit_code;
        const collaboratorId = approvalData.collaborator_id;

        const sanitizePhone = (value?: string | null) => {
          if (!value) return null;
          const digits = value.replace(/\D/g, '');
          if (!digits) return null;
          return digits.startsWith('55') ? digits : `55${digits}`;
        };

        const defaultPhones = ['5511940477721', '5519993808900', '5519993808685'];
        const phoneSet = new Set<string>(defaultPhones);

        const { data: collaboratorUser } = await supabaseQuery
          .from('users')
          .select('phone')
          .eq('id', collaboratorId)
          .maybeSingle();

        const collaboratorPhone = sanitizePhone(collaboratorUser?.phone ?? null);
        if (collaboratorPhone) {
          phoneSet.add(collaboratorPhone);
        }

        const { data: franchiseeUsers } = await supabaseQuery
          .from('users')
          .select('phone')
          .eq('unit_code', unitCode)
          .eq('role', 'Franqueado')
          .eq('active', true)
          .not('phone', 'is', null);

        if (franchiseeUsers) {
          franchiseeUsers.forEach(user => {
            const phone = sanitizePhone((user as { phone: string | null }).phone);
            if (phone) {
              phoneSet.add(phone);
            }
          });
        }

        // A lógica de verificação de grupo existente foi movida para a Edge Function
        console.log(`Tentando criar grupo para a unidade ${unitCode}...`);
        try {
          const { error: groupError } = await supabase.functions.invoke('create-collaborator-group', {
            body: {
              unit_code: unitCode,
              grupo: unit.group_name,
              phones: Array.from(phoneSet)
            }
          });
          if (groupError) throw new Error(`Erro ao criar o grupo no WhatsApp: ${groupError.message}`);
        
        } catch (error) {
          console.error("Erro durante a invocação da função de criação de grupo:", error);
          toast({
            title: "Aviso: Falha ao criar grupo no WhatsApp",
            description: "O colaborador foi aprovado, mas a criação do grupo falhou. Verifique os logs.",
            variant: "destructive",
          });
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
      queryClient.invalidateQueries({ queryKey: ['franchisee-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['franchisee-approval-count'] });
      queryClient.invalidateQueries({ queryKey: ['approved-collaborators'] });
      queryClient.invalidateQueries({ queryKey: ['units-info'] });

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
  const { error: userError } = await (treinamento.users() as any).insert([{
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
  const { error: updateError } = await (treinamento.users() as any)
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
      const sanitizePhone = (value?: string | null) => {
        if (!value) return null;
        const digits = value.replace(/\D/g, '');
        if (!digits) return null;
        return digits.startsWith('55') ? digits : `55${digits}`;
      };

      const defaultPhones = ['5511940477721', '5519993808900', '5519993808685'];
      const phoneSet = new Set<string>(defaultPhones);

      const { data: franchisees } = await supabaseQuery
        .from('users')
        .select('phone')
        .eq('unit_code', unitCode)
        .eq('role', 'Franqueado')
        .eq('active', true)
        .not('phone', 'is', null);

      franchisees?.forEach((user: { phone: string | null }) => {
        const phone = sanitizePhone(user.phone);
        if (phone) phoneSet.add(phone);
      });

      const { data: approvedCollaborators } = await supabaseQuery
        .from('users')
        .select('phone')
        .eq('unit_code', unitCode)
        .eq('role', 'Colaborador')
        .eq('approval_status', 'aprovado')
        .eq('active', true)
        .not('phone', 'is', null);

      approvedCollaborators?.forEach((user: { phone: string | null }) => {
        const phone = sanitizePhone(user.phone);
        if (phone) phoneSet.add(phone);
      });

      const { data, error } = await supabase.functions.invoke('create-collaborator-group', {
        body: {
          unit_code: unitCode,
          grupo: grupo,
          phones: Array.from(phoneSet)
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