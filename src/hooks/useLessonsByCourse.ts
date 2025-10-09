import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LessonByCourse {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  content?: string;
  duration_minutes: number;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  attendance_keyword?: string;
}

export const useLessonsByCourse = (courseId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['lessons-by-course', courseId],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select('*')
        .order('order_index', { ascending: true });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data: lessons, error } = await query;

      if (error) {
        console.error('Error fetching lessons by course:', error);
        toast({
          title: "Erro ao carregar aulas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return lessons as LessonByCourse[];
    },
    enabled: !!courseId
  });
};