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
      const now = new Date();
      
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
          *,
          courses!inner(name)
        `)
        .eq('status', 'Ativo')
        .not('zoom_start_time', 'is', null)
        .order('zoom_start_time', { ascending: true });

      if (error) {
        console.error('Error fetching lessons for dispatches:', error);
        toast({
          title: "Erro ao carregar aulas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Filter lessons that haven't finished yet (current time <= start time + duration)
      const activeLessons = lessons?.filter(lesson => {
        const lessonStart = new Date(lesson.zoom_start_time);
        const lessonDuration = lesson.duration_minutes || 60; // Default 60 minutes if not specified
        const lessonEnd = new Date(lessonStart.getTime() + lessonDuration * 60000); // Add duration in milliseconds
        
        return now <= lessonEnd; // Show until the lesson ends
      }) || [];

      return activeLessons.map(lesson => ({
        ...lesson,
        course_name: lesson.courses.name
      })) as LessonForDispatch[];
    }
  });
};