import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TurmaLessonSession {
  id: string;
  lesson_id: string;
  turma_id: string;
  scheduled_at: string;
  status: string;
  lessons: {
    id: string;
    title: string;
    description: string | null;
  };
}

export const useTurmaLessonSessions = (turmaId: string | null) => {
  return useQuery({
    queryKey: ['turma-lesson-sessions', turmaId],
    enabled: !!turmaId,
    queryFn: async () => {
      if (!turmaId) return [];

      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('lesson_sessions')
        .select(`
          id,
          lesson_id,
          turma_id,
          scheduled_at,
          status,
          lessons!inner(id, title, description)
        `)
        .eq('turma_id', turmaId)
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Error fetching turma lesson sessions:', error);
        throw error;
      }

      return (data || []) as TurmaLessonSession[];
    }
  });
};
