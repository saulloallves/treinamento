import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LessonWithSchedule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  order_index: number;
  status: string;
  zoom_start_time: string;
  zoom_meeting_id?: string;
  zoom_join_url?: string;
  attendance_keyword?: string;
  created_at: string;
  updated_at: string;
  course_name: string;
}

export const useLessonsWithSchedule = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['lessons-with-schedule'],
    queryFn: async () => {
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
          *,
          courses!inner(name)
        `)
        .not('zoom_start_time', 'is', null)
        .eq('status', 'Ativo')
        .gte('zoom_start_time', new Date().toISOString())
        .order('zoom_start_time', { ascending: true });

      if (error) {
        console.error('Error fetching lessons with schedule:', error);
        toast({
          title: "Erro ao carregar aulas agendadas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return lessons.map(lesson => ({
        ...lesson,
        course_name: lesson.courses.name
      })) as LessonWithSchedule[];
    }
  });
};