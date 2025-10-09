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

      // Buscar os códigos de unidade do franqueado
      const { data: franchiseeData, error: franchiseeError } = await supabase
        .from('users')
        .select('unit_code, unit_codes')
        .eq('id', user.id)
        .eq('role', 'Franqueado')
        .single();

      if (franchiseeError) throw franchiseeError;
      if (!franchiseeData) return [];

      // Combinar unit_code e unit_codes em um array único
      const unitCodes = [
        ...(franchiseeData.unit_codes || []),
        ...(franchiseeData.unit_code ? [franchiseeData.unit_code] : [])
      ].filter((code, index, self) => code && self.indexOf(code) === index); // Remove duplicatas

      if (unitCodes.length === 0) return [];

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

      // Buscar os códigos de unidade do franqueado
      const { data: franchiseeData, error: franchiseeError } = await supabase
        .from('users')
        .select('unit_code, unit_codes')
        .eq('id', user.id)
        .eq('role', 'Franqueado')
        .single();

      if (franchiseeError) throw franchiseeError;
      if (!franchiseeData) return 0;

      // Combinar unit_code e unit_codes em um array único
      const unitCodes = [
        ...(franchiseeData.unit_codes || []),
        ...(franchiseeData.unit_code ? [franchiseeData.unit_code] : [])
      ].filter((code, index, self) => code && self.indexOf(code) === index);

      if (unitCodes.length === 0) return 0;

      // Contar aprovações pendentes
      const { count, error } = await supabase
        .from('collaboration_approvals')
        .select('*', { count: 'exact', head: true })
        .in('unit_code', unitCodes)
        .eq('status', 'pendente');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });
};
