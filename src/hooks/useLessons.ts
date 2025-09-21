
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { hasLessonFinished, isLessonUpcoming } from '@/lib/dateUtils';

export interface Lesson {
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
  // Zoom fields (when aula é ao vivo)
  zoom_meeting_id?: string | null;
  zoom_start_url?: string | null;
  zoom_join_url?: string | null;
  zoom_start_time?: string | null;
  professor_name?: string; // Compat: string única para UI antiga
  professor_names?: string[]; // Nomes múltiplos de professores
  courses?: {
    name: string;
    tipo?: string;
  };
  lesson_sessions?: Array<{
    turma_id: string;
    turmas?: {
      responsavel_name?: string | null;
      responsavel_user?: { id: string; name: string | null } | null;
    } | null;
  }>;
}

export interface LessonInput {
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  content?: string;
  duration_minutes: number;
  order_index: number;
  status?: string;
  zoom_start_time?: string;
  attendance_keyword?: string;
}

export const useLessons = (filterType: 'all' | 'upcoming' | 'archived' = 'all') => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['lessons', filterType],
    queryFn: async () => {
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
          *,
          courses (
            name,
            tipo,
            instructor
          ),
          lesson_sessions (
            turma_id,
            turmas (
              responsavel_name,
              responsavel_user:users!responsavel_user_id (id, name)
            )
          )
        `)
        .order('zoom_start_time', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching lessons:', error);
        toast({
          title: "Erro ao carregar aulas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Simple filtering logic
      let filteredLessons = lessons;
      
      if (filterType === 'upcoming') {
        // Show only active lessons with future dates
        filteredLessons = lessons.filter((lesson: any) => {
          if (lesson.status !== 'Ativo') return false;
          
          // If no zoom_start_time, show in upcoming (needs scheduling)
          if (!lesson.zoom_start_time) return true;
          
          // Check if lesson date is in the future
          const now = new Date();
          const lessonStart = new Date(lesson.zoom_start_time);
          
          // Show if lesson hasn't started yet
          return now < lessonStart;
        });
      } else if (filterType === 'archived') {
        // Show lessons that have passed their scheduled date
        filteredLessons = lessons.filter((lesson: any) => {
          // Archive inactive lessons
          if (lesson.status !== 'Ativo') return true;
          
          // If no zoom_start_time, don't archive (needs scheduling)
          if (!lesson.zoom_start_time) return false;
          
          // Check if lesson has passed
          const now = new Date();
          const lessonStart = new Date(lesson.zoom_start_time);
          
          // Archive if lesson has already started/passed
          return now >= lessonStart;
        });
      }

      // Enriquecer com professor (preferir sessão -> turma) e suportar múltiplos nomes
      const lessonsWithProfessor = await Promise.all(
        filteredLessons.map(async (lesson: any) => {
          const namesSet = new Map<string, string>();

          // 1) Preferir professores das turmas vinculadas via lesson_sessions
          const sessionNames: string[] = (lesson.lesson_sessions || [])
            .flatMap((s: any) => {
              const raw = s?.turmas?.responsavel_user?.name || s?.turmas?.responsavel_name;
              if (!raw) return [] as string[];
              return String(raw).split(/,|\/|\se\s|\s&\s|;|\+/).map((t) => t.trim()).filter(Boolean);
            });
          sessionNames.forEach((n) => namesSet.set(n.trim().toLowerCase(), n.trim()));

          // 2) Fallback: se é curso ao vivo, buscar última turma ativa do curso
          if (namesSet.size === 0 && lesson.courses?.tipo === 'ao_vivo' && lesson.course_id) {
            const { data: turma } = await supabase
              .from('turmas')
              .select(`
                responsavel_name,
                responsavel_user:users!responsavel_user_id(id, name)
              `)
              .eq('course_id', lesson.course_id)
              .in('status', ['agendada', 'em_andamento'])
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            const n = turma?.responsavel_user?.name || turma?.responsavel_name;
            if (n) namesSet.set(n.trim().toLowerCase(), n.trim());
          }

          // 3) Fallback final: usar course.instructor (pode conter múltiplos nomes)
          if (namesSet.size === 0 && lesson.courses?.tipo === 'ao_vivo' && lesson.courses?.instructor) {
            const raw = String(lesson.courses.instructor);
            raw.split(/,|\/|\se\s|\s&\s|;|\+/).map(s => s.trim()).filter(Boolean)
              .forEach((n) => namesSet.set(n.toLowerCase(), n));
          }

          const names = Array.from(namesSet.values());
          if (names.length > 0) {
            return { ...lesson, professor_names: names, professor_name: names.join(', ') };
          }

          return lesson;
        })
      );

      return lessonsWithProfessor as Lesson[];
    }
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lessonData: LessonInput) => {
      // Anti-duplicação: verifica se já existe aula com mesmo curso + título (normalizado) + ordem
      const title = (lessonData.title || '').trim();
      const { data: existing, error: existErr } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', lessonData.course_id)
        .eq('title', title)
        .eq('order_index', lessonData.order_index)
        .maybeSingle();
      if (existErr) throw existErr;

      if (existing?.id) {
        const { data, error } = await supabase
          .from('lessons')
          .update({ ...lessonData, title, created_by: (await supabase.auth.getUser()).data.user?.id })
          .eq('id', existing.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('lessons')
        .insert([{ ...lessonData, title, created_by: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Aula criada com sucesso!",
        description: "A nova aula foi adicionada à lista.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar aula",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...lessonData }: Lesson) => {
      // Sanitize payload: only send real table columns
      const allowedKeys: Array<keyof Lesson> = [
        'course_id',
        'title',
        'description',
        'video_url',
        'content',
        'duration_minutes',
        'order_index',
        'status',
        'zoom_meeting_id',
        'zoom_start_url',
        'zoom_join_url',
        'zoom_start_time',
        'attendance_keyword',
      ];

      const payload: Record<string, any> = {};
      for (const key of allowedKeys) {
        if (key in lessonData) {
          payload[key as string] = (lessonData as any)[key as string];
        }
      }
      payload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('lessons')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating lesson:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Aula atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar aula",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      // Primeiro, deletar todos os registros de attendance relacionados a esta aula
      const { error: attendanceError } = await supabase
        .from('attendance')
        .delete()
        .eq('lesson_id', lessonId);

      if (attendanceError) {
        console.error('Error deleting attendance records:', attendanceError);
        throw attendanceError;
      }

      // Segundo, deletar todos os quizzes relacionados a esta aula
      const { error: quizError } = await supabase
        .from('quiz')
        .delete()
        .eq('lesson_id', lessonId);

      if (quizError) {
        console.error('Error deleting quiz records:', quizError);
        throw quizError;
      }

      // Depois, deletar a aula
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) {
        console.error('Error deleting lesson:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Aula excluída com sucesso!",
        description: "A aula foi removida da lista.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir aula",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};
