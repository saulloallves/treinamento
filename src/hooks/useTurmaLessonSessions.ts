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

      const now = new Date();
      const nowISO = now.toISOString();
      
      // Buscar lesson_sessions agendadas
      const { data: sessions, error: sessionsError } = await supabase
        .from('lesson_sessions')
        .select(`
          id,
          lesson_id,
          turma_id,
          scheduled_at,
          status,
          lessons!inner(id, title, description, duration_minutes)
        `)
        .eq('turma_id', turmaId)
        .eq('status', 'agendada')
        .gte('scheduled_at', nowISO)
        .order('scheduled_at', { ascending: true });

      if (sessionsError) {
        console.error('Error fetching turma lesson sessions:', sessionsError);
      }

      // Buscar turma para pegar o course_id
      const { data: turma, error: turmaError } = await supabase
        .from('turmas')
        .select('course_id')
        .eq('id', turmaId)
        .single();

      if (turmaError) {
        console.error('Error fetching turma:', turmaError);
        return (sessions || []) as TurmaLessonSession[];
      }

      // Buscar lessons do curso com zoom_start_time futuro
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, description, zoom_start_time, duration_minutes')
        .eq('course_id', turma.course_id)
        .eq('status', 'Ativo')
        .not('zoom_start_time', 'is', null)
        .gte('zoom_start_time', nowISO)
        .order('zoom_start_time', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching lessons with schedule:', lessonsError);
      }

      // Combinar resultados
      const result: TurmaLessonSession[] = [];

      // Adicionar lesson_sessions
      if (sessions) {
        result.push(...sessions.map(s => ({
          id: s.id,
          lesson_id: s.lesson_id,
          turma_id: s.turma_id,
          scheduled_at: s.scheduled_at,
          status: s.status,
          lessons: {
            id: s.lessons.id,
            title: s.lessons.title,
            description: s.lessons.description
          }
        })));
      }

      // Adicionar lessons com zoom_start_time que ainda não terminaram
      if (lessons) {
        for (const lesson of lessons) {
          // Verificar se não há lesson_session para essa aula
          const hasSession = sessions?.some(s => s.lesson_id === lesson.id);
          if (!hasSession) {
            // Verificar se a aula ainda não terminou (considerando duração)
            const lessonStart = new Date(lesson.zoom_start_time);
            const lessonDuration = lesson.duration_minutes || 60;
            const lessonEnd = new Date(lessonStart.getTime() + lessonDuration * 60000);
            
            if (now <= lessonEnd) {
              result.push({
                id: `lesson-${lesson.id}`, // ID único para diferenciar
                lesson_id: lesson.id,
                turma_id: turmaId,
                scheduled_at: lesson.zoom_start_time,
                status: 'agendada',
                lessons: {
                  id: lesson.id,
                  title: lesson.title,
                  description: lesson.description
                }
              });
            }
          }
        }
      }

      // Ordenar por scheduled_at
      result.sort((a, b) => 
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      );

      return result;
    }
  });
};
