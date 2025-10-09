import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobPositions } from './useJobPositions';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './use-toast';

interface CoursePositionAccess {
  id: string;
  course_id: string;
  position_code: string;
  active: boolean;
}

export const useCourseAccess = (courseId: string) => {
  const { data: jobPositions } = useJobPositions();
  
  const { data: courseAccess } = useQuery({
    queryKey: ['course-access', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_position_access')
        .select('*')
        .eq('course_id', courseId)
        .eq('active', true);

      if (error) {
        console.error('Error fetching course access:', error);
        throw error;
      }

      return data as CoursePositionAccess[];
    },
    enabled: !!courseId
  });

  // Get position names for the course
  const getPositionNames = () => {
    if (!courseAccess || !jobPositions) return [];
    
    return courseAccess
      .map(access => jobPositions.find(pos => pos.code === access.position_code))
      .filter(Boolean)
      .map(pos => pos!.name);
  };

  return {
    courseAccess,
    positionNames: getPositionNames()
  };
};

export const useCoursePositionAccess = (courseId: string) => {
  return useQuery({
    queryKey: ['course-position-access', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_position_access')
        .select('*')
        .eq('course_id', courseId)
        .eq('active', true);

      if (error) {
        console.error('Error fetching course position access:', error);
        throw error;
      }

      return data as CoursePositionAccess[];
    },
    enabled: !!courseId
  });
};

export const useManageCourseAccess = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateAccess = useMutation({
    mutationFn: async ({ courseId, positionCodes }: { courseId: string; positionCodes: string[] }) => {
      // First, deactivate all existing access for this course
      await supabase
        .from('course_position_access')
        .update({ active: false })
        .eq('course_id', courseId);

      // Then, insert or activate the new access rules
      if (positionCodes.length > 0) {
        const accessData = positionCodes.map(code => ({
          course_id: courseId,
          position_code: code,
          active: true
        }));

        const { error } = await supabase
          .from('course_position_access')
          .upsert(accessData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-access'] });
      queryClient.invalidateQueries({ queryKey: ['course-position-access'] });
      toast({
        title: "Acesso atualizado com sucesso!",
        description: "As regras de acesso ao curso foram atualizadas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar acesso",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return { updateAccess };
};

export const useUserPosition = () => {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ['user-position', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get user position from users table
      const { data, error } = await supabase
        .from('users')
        .select('position, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user position:', error);
        throw error;
      }

      return {
        ...data,
        hasFullAccess: false // Add this property for compatibility
      };
    },
    enabled: !!user
  });
};