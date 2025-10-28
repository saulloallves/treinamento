import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FranchiseeApproval {
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

// Hook para buscar todas as aprovações de todas as unidades de um franqueado
export const useFranchiseeApprovals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['franchisee-approvals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Buscar os códigos de unidade do franqueado a partir da tabela 'users'
      const { data: franchiseeData, error: franchiseeError } = await supabase
        .from('users')
        .select('unit_code, unit_codes, id')
        // @ts-expect-error - Supabase type inference issue
        .eq('id', user.id)
        // @ts-expect-error - Supabase type inference issue
        .eq('role', 'Franqueado')
        .single();

      if (franchiseeError) throw franchiseeError;
      if (!franchiseeData) return [];

      // Combina unit_code e unit_codes em um array único e sem duplicatas
      // @ts-expect-error - Supabase type inference issue
      const unitCodes = [
        // @ts-expect-error - Supabase type inference issue
        ...(franchiseeData.unit_codes || []),
        // @ts-expect-error - Supabase type inference issue
        ...(franchiseeData.unit_code ? [franchiseeData.unit_code] : [])
      ].filter((code, index, self) => code && self.indexOf(code) === index);

      if (unitCodes.length === 0) return [];

      console.log('🔍 Buscando aprovações para unit_codes:', unitCodes);

      // Buscar aprovações para todos os códigos de unidade
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
        .in('unit_code', unitCodes)
        // @ts-expect-error - Supabase type inference issue
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar collaboration_approvals:', error);
        throw error;
      }

      // @ts-expect-error - Supabase type inference issue
      const approvalsFromTable = data?.map(approval => ({
        // @ts-expect-error - Supabase type inference issue
        id: approval.id,
        // @ts-expect-error - Supabase type inference issue
        collaborator_id: approval.collaborator_id,
        // @ts-expect-error - Supabase type inference issue
        franchisee_id: approval.franchisee_id,
        // @ts-expect-error - Supabase type inference issue
        unit_code: approval.unit_code,
        // @ts-expect-error - Supabase type inference issue
        status: approval.status,
        // @ts-expect-error - Supabase type inference issue
        created_at: approval.created_at,
        // @ts-expect-error - Supabase type inference issue
        collaborator_name: (approval.users as any)?.name || 'Nome não informado',
        // @ts-expect-error - Supabase type inference issue
        collaborator_email: (approval.users as any)?.email || 'Email não informado',
        // @ts-expect-error - Supabase type inference issue
        collaborator_role: (approval.users as any)?.role || 'Colaborador',
      })) || [];

      console.log('✅ Aprovações encontradas em collaboration_approvals:', approvalsFromTable.length);

      // FALLBACK: Buscar também usuários pendentes diretamente da tabela users
      // que NÃO têm registro em collaboration_approvals
      const { data: pendingUsers, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role, unit_code, created_at')
        .in('unit_code', unitCodes)
        // @ts-expect-error - Supabase type inference issue
        .eq('role', 'Colaborador')
        // @ts-expect-error - Supabase type inference issue
        .eq('approval_status', 'pendente')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.warn('⚠️ Erro ao buscar users pendentes:', usersError);
      } else {
        console.log('📋 Usuários pendentes encontrados em users:', pendingUsers?.length || 0);
      }

      // Filtrar usuários que NÃO estão em collaboration_approvals
      const existingCollaboratorIds = new Set(approvalsFromTable.map(a => a.collaborator_id));
      // @ts-expect-error - Supabase type inference issue
      const usersWithoutApproval = (pendingUsers || [])
        // @ts-expect-error - Supabase type inference issue
        .filter(user => !existingCollaboratorIds.has(user.id))
        // @ts-expect-error - Supabase type inference issue
        .map(user => ({
          // @ts-expect-error - Supabase type inference issue
          id: `temp-${user.id}`, // ID temporário para diferenciar
          // @ts-expect-error - Supabase type inference issue
          collaborator_id: user.id,
          // @ts-expect-error - Supabase type inference issue
          franchisee_id: franchiseeData.id || null,
          // @ts-expect-error - Supabase type inference issue
          unit_code: user.unit_code || '',
          status: 'pendente' as const,
          // @ts-expect-error - Supabase type inference issue
          created_at: user.created_at,
          // @ts-expect-error - Supabase type inference issue
          collaborator_name: user.name || 'Nome não informado',
          // @ts-expect-error - Supabase type inference issue
          collaborator_email: user.email || 'Email não informado',
          // @ts-expect-error - Supabase type inference issue
          collaborator_role: user.role || 'Colaborador',
          _fromUsersTable: true, // Flag para identificar origem
        }));

      console.log('🔄 Usuários sem registro em collaboration_approvals:', usersWithoutApproval.length);

      // Combinar ambas as fontes
      const allApprovals = [...approvalsFromTable, ...usersWithoutApproval];
      console.log('🎯 Total de aprovações pendentes:', allApprovals.length);

      return allApprovals;
    },
    enabled: !!user?.id,
  });
};

// Hook para contagem de aprovações pendentes do franqueado
export const useFranchiseeApprovalCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['franchisee-approval-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Buscar os códigos de unidade do franqueado a partir da tabela 'users'
      const { data: franchiseeData, error: franchiseeError } = await supabase
        .from('users')
        .select('unit_code, unit_codes')
        // @ts-expect-error - Supabase type inference issue
        .eq('id', user.id)
        // @ts-expect-error - Supabase type inference issue
        .eq('role', 'Franqueado')
        .single();

      if (franchiseeError) throw franchiseeError;
      if (!franchiseeData) return 0;

      // Combina unit_code e unit_codes em um array único e sem duplicatas
      // @ts-expect-error - Supabase type inference issue
      const unitCodes = [
        // @ts-expect-error - Supabase type inference issue
        ...(franchiseeData.unit_codes || []),
        // @ts-expect-error - Supabase type inference issue
        ...(franchiseeData.unit_code ? [franchiseeData.unit_code] : [])
      ].filter((code, index, self) => code && self.indexOf(code) === index);

      if (unitCodes.length === 0) return 0;

      // Contar aprovações pendentes
      const { count, error } = await supabase
        .from('collaboration_approvals')
        .select('*', { count: 'exact', head: true })
        .in('unit_code', unitCodes)
        // @ts-expect-error - Supabase type inference issue
        .eq('status', 'pendente');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });
};
