import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsProfessor } from "@/hooks/useIsProfessor";

export interface ProfessorAccess {
  canView: (module: string) => boolean;
  canEdit: (module: string) => boolean;
  hasField: (module: string, field: string) => boolean;
  isLoading: boolean;
}

export const useProfessorAccess = (): ProfessorAccess => {
  const { user } = useAuth();
  const { data: isProfessor = false } = useIsProfessor(user?.id);

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["professor-access", user?.id],
    queryFn: async () => {
      if (!user?.id || !isProfessor) return [];

      const { data, error } = await supabase
        .from('professor_permissions')
        .select('*')
        .eq('professor_id', user.id);

      if (error) {
        console.error('Error fetching professor access:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id && isProfessor,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const canView = (module: string): boolean => {
    const permission = permissions.find(p => p.module_name === module);
    return permission?.can_view || false;
  };

  const canEdit = (module: string): boolean => {
    const permission = permissions.find(p => p.module_name === module);
    return permission?.can_edit || false;
  };

  const hasField = (module: string, field: string): boolean => {
    const permission = permissions.find(p => p.module_name === module);
    return permission?.enabled_fields?.[field] || false;
  };

  return {
    canView,
    canEdit,
    hasField,
    isLoading
  };
};

// Hook para verificar acesso baseado em RLS usando função do banco
export const useCheckProfessorPermission = (module: string, permissionType: 'view' | 'edit' = 'view') => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["professor-permission-check", user?.id, module, permissionType],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase.rpc('has_professor_permission', {
        _professor_id: user.id,
        _module_name: module,
        _permission_type: permissionType
      });

      if (error) {
        console.error('Error checking professor permission:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};