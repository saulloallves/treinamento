import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCorrectLessonCount = (courseId: string, courseType: 'ao_vivo' | 'gravado') => {
  return useQuery({
    queryKey: ['lesson-count', courseId, courseType],
    queryFn: async () => {
      if (courseType === 'gravado') {
        // Count recorded_lessons for recorded courses
        const { count, error } = await supabase
          .from('recorded_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId)
          .eq('status', 'Ativo');

        if (error) {
          console.error('Error counting recorded lessons:', error);
          throw error;
        }

        return count || 0;
      } else {
        // Count lessons for live courses
        const { count, error } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId)
          .eq('status', 'Ativo');

        if (error) {
          console.error('Error counting lessons:', error);
          throw error;
        }

        return count || 0;
      }
    },
    enabled: !!courseId
  });
};