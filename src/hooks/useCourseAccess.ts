import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './use-toast';

export interface CoursePositionAccess {
  id: string;
  course_id: string;
  position_code: string;
  active: boolean;
  created_at: string;
}

// Hook para buscar acessos por cargo de um curso
export const useCoursePositionAccess = (courseId: string) => {
  return useQuery({
    queryKey: ['course-position-access', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_position_access')
        .select(`
          *,
          job_positions:position_code (
            code,
            name,
            category
          )
        `)
        .eq('course_id', courseId)
        .eq('active', true);

      if (error) {
        console.error('Error fetching course position access:', error);
        throw error;
      }

      return data;
    },
    enabled: !!courseId
  });
};

// Hook para determinar o cargo/posição do usuário atual
export const useUserPosition = () => {
  const { data: currentUser } = useCurrentUser();

  return useQuery({
    queryKey: ['user-position', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;

      // Para professores e admins, retornar acesso total
      if (currentUser.user_type === 'Professor') {
        return { position: 'ADMIN', name: 'Administrador', category: 'admin', hasFullAccess: true };
      }

      // Para franqueados, determinar pela fase da unidade
      if (currentUser.role === 'Franqueado' && currentUser.unit_code) {
        const { data: franchiseePosition, error } = await supabase.rpc(
          'get_franchisee_position',
          { p_unit_code: currentUser.unit_code }
        );

        if (error) {
          console.error('Error getting franchisee position:', error);
          throw error;
        }

        // Buscar detalhes do cargo
        const { data: positionDetails } = await supabase
          .from('job_positions')
          .select('*')
          .eq('code', franchiseePosition)
          .eq('active', true)
          .maybeSingle();

        return {
          position: franchiseePosition,
          name: positionDetails?.name || franchiseePosition,
          category: 'franqueado',
          hasFullAccess: false
        };
      }

      // Para colaboradores, mapear position para código
      if (currentUser.role === 'Colaborador' && currentUser.position) {
        const positionMapping: Record<string, string> = {
          'Atendente de Loja': 'ATEND_LOJA',
          'Mídias Sociais': 'MIDIAS_SOC',
          'Operador(a) de Caixa': 'OP_CAIXA',
          'Avaliadora': 'AVALIADORA',
          'Repositor(a)': 'REPOSITOR',
          'Líder de Loja': 'LIDER_LOJA',
          'Gerente': 'GERENTE'
        };

        const positionCode = positionMapping[currentUser.position];
        
        if (positionCode) {
          // Buscar detalhes do cargo
          const { data: positionDetails } = await supabase
            .from('job_positions')
            .select('*')
            .eq('code', positionCode)
            .eq('active', true)
            .maybeSingle();

          return {
            position: positionCode,
            name: positionDetails?.name || currentUser.position,
            category: 'colaborador',
            hasFullAccess: false
          };
        }
      }

      return null;
    },
    enabled: !!currentUser
  });
};

// Hook para verificar se usuário pode acessar um curso específico
export const useCanAccessCourse = (courseId: string) => {
  const { data: currentUser } = useCurrentUser();

  return useQuery({
    queryKey: ['can-access-course', courseId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !courseId) return false;

      const { data: canAccess, error } = await supabase.rpc(
        'can_user_access_course',
        { 
          p_user_id: currentUser.id, 
          p_course_id: courseId 
        }
      );

      if (error) {
        console.error('Error checking course access:', error);
        throw error;
      }

      return canAccess as boolean;
    },
    enabled: !!currentUser && !!courseId
  });
};

// Hook para adicionar/remover acessos por cargo a um curso
export const useManageCourseAccess = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addAccess = useMutation({
    mutationFn: async ({ courseId, positionCodes }: { courseId: string; positionCodes: string[] }) => {
      const accessData = positionCodes.map(code => ({
        course_id: courseId,
        position_code: code,
        active: true
      }));

      const { error } = await supabase
        .from('course_position_access')
        .insert(accessData);

      if (error) {
        console.error('Error adding course access:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-position-access', variables.courseId] });
      toast({
        title: "Acessos adicionados",
        description: "Os cargos foram associados ao curso com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar acessos",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const removeAccess = useMutation({
    mutationFn: async ({ courseId, positionCodes }: { courseId: string; positionCodes: string[] }) => {
      const { error } = await supabase
        .from('course_position_access')
        .delete()
        .eq('course_id', courseId)
        .in('position_code', positionCodes);

      if (error) {
        console.error('Error removing course access:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-position-access', variables.courseId] });
      toast({
        title: "Acessos removidos",
        description: "Os cargos foram desassociados do curso com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover acessos",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateAccess = useMutation({
    mutationFn: async ({ courseId, positionCodes }: { courseId: string; positionCodes: string[] }) => {
      // Primeiro, remove todos os acessos existentes
      await supabase
        .from('course_position_access')
        .delete()
        .eq('course_id', courseId);

      // Depois, adiciona os novos acessos
      if (positionCodes.length > 0) {
        const accessData = positionCodes.map(code => ({
          course_id: courseId,
          position_code: code,
          active: true
        }));

        const { error } = await supabase
          .from('course_position_access')
          .insert(accessData);

        if (error) {
          console.error('Error updating course access:', error);
          throw error;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-position-access', variables.courseId] });
      toast({
        title: "Acessos atualizados",
        description: "As permissões do curso foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar acessos",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    addAccess,
    removeAccess,
    updateAccess
  };
};