
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  // Zoom fields (when aula é ao vivo)
  zoom_meeting_id?: string | null;
  zoom_start_url?: string | null;
  zoom_join_url?: string | null;
  zoom_start_time?: string | null;
  courses?: {
    name: string;
  };
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
}

export const useLessons = (futureOnly: boolean = false) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['lessons', futureOnly],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select(`
          *,
          courses (
            name
          )
        `);

      // Se futureOnly for true, filtrar apenas aulas futuras
      if (futureOnly) {
        const nowIso = new Date().toISOString();
        query = query
          .not('zoom_start_time', 'is', null)
          .gt('zoom_start_time', nowIso)
          .order('zoom_start_time', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lessons:', error);
        toast({
          title: "Erro ao carregar aulas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Lesson[];
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
      const { data, error } = await supabase
        .from('lessons')
        .update(lessonData)
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
