import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export const useTurmaEnrollment = (courseId: string) => {
  const { data: currentUser } = useCurrentUser();

  return useQuery({
    queryKey: ['turma-enrollment', courseId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || !courseId) return null;

      // Get user's enrollment in this course with turma info
      const { data: enrollment, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          turma:turmas(
            id,
            name,
            code,
            status,
            completion_deadline,
            start_at,
            end_at,
            responsavel_name,
            responsavel_user:users!responsavel_user_id(name, email)
          )
        `)
        .eq('course_id', courseId)
        .eq('user_id', currentUser.id)
        .not('turma_id', 'is', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching turma enrollment:', error);
        throw error;
      }

      return enrollment;
    },
    enabled: !!currentUser?.id && !!courseId
  });
};