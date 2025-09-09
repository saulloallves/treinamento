import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LessonForDispatch {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  order_index: number;
  status: string;
  zoom_start_time?: string;
  zoom_meeting_id?: string;
  zoom_join_url?: string;
  attendance_keyword?: string;
  created_at: string;
  updated_at: string;
  course_name: string;
}

export const useLessonsForDispatches = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['lessons-for-dispatches'],
    queryFn: async () => {
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
          *,
          courses!inner(name)
        `)
        .eq('status', 'Ativo')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lessons for dispatches:', error);
        toast({
          title: "Erro ao carregar aulas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return lessons.map(lesson => ({
        ...lesson,
        course_name: lesson.courses.name
      })) as LessonForDispatch[];
    }
  });
};