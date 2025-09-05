import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProfessorPermission {
  id: string;
  professor_id: string;
  module_name: string;
  can_view: boolean;
  can_edit: boolean;
  enabled_fields: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export const SYSTEM_MODULES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'courses', label: 'Cursos' },
  { value: 'lessons', label: 'Aulas' },
  { value: 'turmas', label: 'Turmas' },
  { value: 'enrollments', label: 'Inscrições' },
  { value: 'attendance', label: 'Presença' },
  { value: 'progress', label: 'Progresso' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'certificates', label: 'Certificados' },
  { value: 'communication', label: 'Comunicação' },
  { value: 'settings', label: 'Configurações' }
];

export const MODULE_FIELDS = {
  dashboard: ['analytics', 'reports', 'statistics'],
  courses: ['create', 'edit', 'delete', 'publish'],
  lessons: ['create', 'edit', 'delete', 'schedule'],
  turmas: ['create', 'edit', 'delete', 'manage_students'],
  enrollments: ['create', 'edit', 'delete', 'approve'],
  attendance: ['mark', 'edit', 'reports'],
  progress: ['view', 'edit', 'reports'],
  quiz: ['create', 'edit', 'delete', 'grade'],
  certificates: ['generate', 'edit', 'approve'],
  communication: ['send', 'broadcast', 'manage'],
  settings: ['system', 'users', 'permissions']
};

export const useProfessorPermissions = (professorId?: string) => {
  return useQuery({
    queryKey: ["professor-permissions", professorId],
    queryFn: async () => {
      if (!professorId) return [];

      const { data, error } = await supabase
        .from('professor_permissions')
        .select('*')
        .eq('professor_id', professorId)
        .order('module_name');

      if (error) {
        console.error('Error fetching professor permissions:', error);
        throw error;
      }

      return data as ProfessorPermission[];
    },
    enabled: !!professorId
  });
};

export const useUpdateProfessorPermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (permissions: {
      professorId: string;
      moduleName: string;
      canView: boolean;
      canEdit: boolean;
      enabledFields: Record<string, boolean>;
    }) => {
      const { data, error } = await supabase
        .from('professor_permissions')
        .upsert({
          professor_id: permissions.professorId,
          module_name: permissions.moduleName,
          can_view: permissions.canView,
          can_edit: permissions.canEdit,
          enabled_fields: permissions.enabledFields,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'professor_id,module_name'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["professor-permissions", variables.professorId] 
      });
      toast.success("Permissões atualizadas com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar permissões", {
        description: error.message
      });
    },
  });
};

export const useBulkUpdateProfessorPermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      professorId: string;
      permissions: Array<{
        moduleName: string;
        canView: boolean;
        canEdit: boolean;
        enabledFields: Record<string, boolean>;
      }>;
    }) => {
      const permissionsToUpsert = data.permissions.map(permission => ({
        professor_id: data.professorId,
        module_name: permission.moduleName,
        can_view: permission.canView,
        can_edit: permission.canEdit,
        enabled_fields: permission.enabledFields,
        updated_at: new Date().toISOString()
      }));

      const { data: result, error } = await supabase
        .from('professor_permissions')
        .upsert(permissionsToUpsert, {
          onConflict: 'professor_id,module_name'
        })
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["professor-permissions", variables.professorId] 
      });
      toast.success("Todas as permissões foram atualizadas com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar permissões", {
        description: error.message
      });
    },
  });
};