import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProfessorTurmaPermission {
  id: string;
  professor_id: string;
  turma_id: string;
  can_view: boolean;
  can_edit: boolean;
  can_manage_students: boolean;
  created_at: string;
  updated_at: string;
}

export type TurmaPermissionUpdate = {
  turmaId: string;
  canView: boolean;
  canEdit: boolean;
  canManageStudents: boolean;
};

// Fetch professor turma permissions
export const useProfessorTurmaPermissions = (professorId?: string) => {
  return useQuery({
    queryKey: ["professor-turma-permissions", professorId],
    queryFn: async () => {
      if (!professorId) return [];

      const { data, error } = await supabase
        .from("professor_turma_permissions")
        .select("*")
        .eq("professor_id", professorId);

      if (error) throw error;
      return data as ProfessorTurmaPermission[];
    },
    enabled: !!professorId,
  });
};

// Bulk update professor turma permissions
export const useBulkUpdateProfessorTurmaPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      professorId, 
      permissions 
    }: { 
      professorId: string; 
      permissions: TurmaPermissionUpdate[] 
    }) => {
      // First, delete existing permissions for this professor
      const { error: deleteError } = await supabase
        .from("professor_turma_permissions")
        .delete()
        .eq("professor_id", professorId);

      if (deleteError) throw deleteError;

      // Then insert the new permissions (only for turmas with view permission)
      const permissionsToInsert = permissions
        .filter(p => p.canView) // Only insert permissions where canView is true
        .map(p => ({
          professor_id: professorId,
          turma_id: p.turmaId,
          can_view: p.canView,
          can_edit: p.canEdit,
          can_manage_students: p.canManageStudents,
        }));

      if (permissionsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("professor_turma_permissions")
          .insert(permissionsToInsert);

        if (insertError) throw insertError;
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["professor-turma-permissions", variables.professorId] 
      });
      toast.success("Permissões de turmas atualizadas com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating professor turma permissions:", error);
      toast.error("Erro ao atualizar permissões de turmas");
    },
  });
};

// Check if professor has access to specific turma
export const useCheckProfessorTurmaAccess = (professorId?: string, turmaId?: string) => {
  return useQuery({
    queryKey: ["professor-turma-access", professorId, turmaId],
    queryFn: async () => {
      if (!professorId || !turmaId) return false;

      const { data, error } = await supabase.rpc('has_professor_turma_access', {
        _professor_id: professorId,
        _turma_id: turmaId,
        _permission_type: 'view'
      });

      if (error) throw error;
      return data;
    },
    enabled: !!professorId && !!turmaId,
  });
};

// Get all accessible turmas for a professor
export const useProfessorAccessibleTurmas = (professorId?: string) => {
  return useQuery({
    queryKey: ["professor-accessible-turmas", professorId],
    queryFn: async () => {
      if (!professorId) return [];

      const { data, error } = await supabase.rpc('get_professor_accessible_turmas', {
        _professor_id: professorId
      });

      if (error) throw error;
      return data;
    },
    enabled: !!professorId,
  });
};