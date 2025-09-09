import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, addDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface UpcomingLesson {
  id: string;
  title: string;
  turmaName: string;
  courseName: string;
  scheduledAt: string;
  formattedDate: string;
  formattedTime: string;
  expectedParticipants: number;
  joinUrl?: string;
  startUrl?: string;
  zoomMeetingId?: string;
}

export const useProfessorUpcomingLessons = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["professor-upcoming-lessons", user?.id],
    queryFn: async (): Promise<UpcomingLesson[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const now = new Date();
      const nextWeek = addDays(now, 7);

      // First, try to get lesson sessions for professor's turmas in the next 7 days
      const { data: sessions, error: sessionsError } = await supabase
        .from('lesson_sessions')
        .select(`
          id,
          scheduled_at,
          join_url,
          start_url,
          zoom_meeting_id,
          status,
          lessons (
            id,
            title
          ),
          turmas (
            id,
            name,
            code,
            responsavel_user_id,
            courses (
              id,
              name
            )
          )
        `)
        .gte('scheduled_at', startOfDay(now).toISOString())
        .lte('scheduled_at', endOfDay(nextWeek).toISOString())
        .eq('status', 'agendada')
        .order('scheduled_at', { ascending: true });

      if (sessionsError) throw sessionsError;

      let upcomingLessons: UpcomingLesson[] = [];

      // Process lesson sessions if available
      if (sessions && sessions.length > 0) {
        // Filter only sessions from turmas where the user is responsible
        const professorSessions = sessions.filter(session => 
          session.turmas?.responsavel_user_id === user.id
        );

        for (const session of professorSessions) {
          if (!session.turmas || !session.lessons) continue;

          // Count expected participants (enrolled students)
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('id')
            .eq('turma_id', session.turmas.id)
            .eq('status', 'Ativo');

          const expectedParticipants = enrollments?.length || 0;

          upcomingLessons.push({
            id: session.id,
            title: session.lessons.title,
            turmaName: session.turmas.name || session.turmas.code || 'Turma',
            courseName: session.turmas.courses?.name || 'Curso',
            scheduledAt: session.scheduled_at,
            formattedDate: format(new Date(session.scheduled_at), "dd 'de' MMMM", { locale: ptBR }),
            formattedTime: format(new Date(session.scheduled_at), "HH:mm", { locale: ptBR }),
            expectedParticipants,
            joinUrl: session.join_url,
            startUrl: session.start_url,
            zoomMeetingId: session.zoom_meeting_id
          });
        }
      }

      // If no lesson sessions found, fallback to lessons with zoom_start_time
      if (upcomingLessons.length === 0) {
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select(`
            id,
            title,
            zoom_start_time,
            zoom_join_url,
            zoom_start_url,
            zoom_meeting_id,
            course_id,
            courses (
              id,
              name
            )
          `)
          .not('zoom_start_time', 'is', null)
          .gte('zoom_start_time', startOfDay(now).toISOString())
          .lte('zoom_start_time', endOfDay(nextWeek).toISOString())
          .eq('status', 'Ativo')
          .order('zoom_start_time', { ascending: true });

        if (lessonsError) throw lessonsError;

        if (lessons && lessons.length > 0) {
          // Get professor's turmas
          const { data: professorTurmas } = await supabase
            .from('turmas')
            .select('id, name, code, course_id, responsavel_user_id')
            .eq('responsavel_user_id', user.id);

          const professorTurmaIds = professorTurmas?.map(t => t.id) || [];
          const professorCourseIds = professorTurmas?.map(t => t.course_id) || [];

          for (const lesson of lessons) {
            // Check if this lesson belongs to a course the professor teaches
            if (!professorCourseIds.includes(lesson.course_id)) continue;

            // Find the turma for this course
            const turma = professorTurmas?.find(t => t.course_id === lesson.course_id);
            if (!turma) continue;

            // Count expected participants
            const { data: enrollments } = await supabase
              .from('enrollments')
              .select('id')
              .eq('turma_id', turma.id)
              .eq('status', 'Ativo');

            const expectedParticipants = enrollments?.length || 0;

            upcomingLessons.push({
              id: lesson.id,
              title: lesson.title,
              turmaName: turma.name || turma.code || 'Turma',
              courseName: lesson.courses?.name || 'Curso',
              scheduledAt: lesson.zoom_start_time,
              formattedDate: format(new Date(lesson.zoom_start_time), "dd 'de' MMMM", { locale: ptBR }),
              formattedTime: format(new Date(lesson.zoom_start_time), "HH:mm", { locale: ptBR }),
              expectedParticipants,
              joinUrl: lesson.zoom_join_url,
              startUrl: lesson.zoom_start_url,
              zoomMeetingId: lesson.zoom_meeting_id
            });
          }
        }
      }

      return upcomingLessons;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};