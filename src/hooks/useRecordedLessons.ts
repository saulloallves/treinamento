import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecordedLesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  video_file_path?: string;
  duration_minutes: number;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface RecordedLessonInput {
  module_id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  video_file_path?: string;
  duration_minutes: number;
  order_index: number;
  status?: string;
}

export const useRecordedLessons = (courseId?: string, moduleId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['recorded-lessons', courseId, moduleId],
    queryFn: async () => {
      let query = supabase
        .from('recorded_lessons')
        .select('*')
        .order('order_index', { ascending: true });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      
      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recorded lessons:', error);
        toast({
          title: "Erro ao carregar aulas gravadas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as RecordedLesson[];
    },
    enabled: !!(courseId || moduleId),
  });
};

export const useCreateRecordedLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lessonData: RecordedLessonInput) => {
      const { data, error } = await supabase
        .from('recorded_lessons')
        .insert([{
          ...lessonData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating recorded lesson:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recorded-lessons'] });
      toast({
        title: "Aula gravada criada com sucesso!",
        description: "A nova aula foi adicionada ao módulo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar aula gravada",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateRecordedLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...lessonData }: RecordedLesson) => {
      const { data, error } = await supabase
        .from('recorded_lessons')
        .update(lessonData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating recorded lesson:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recorded-lessons'] });
      toast({
        title: "Aula gravada atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar aula gravada",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteRecordedLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('recorded_lessons')
        .delete()
        .eq('id', lessonId);

      if (error) {
        console.error('Error deleting recorded lesson:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recorded-lessons'] });
      toast({
        title: "Aula gravada excluída com sucesso!",
        description: "A aula foi removida do módulo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir aula gravada",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUploadVideo = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, fileName }: { file: File; fileName: string }) => {
      // First attempt with proper contentType
      const contentType = file.type || 'application/octet-stream';
      
      try {
        const { data, error } = await supabase.storage
          .from('course-videos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType,
            duplex: 'half'
          });

        if (error) {
          // If we get "Invalid key" error, try with a more restrictive filename
          if (error.message.includes('Invalid key') || error.message.includes('invalid')) {
            console.log('Retrying upload with restrictive filename due to:', error.message);
            
            const { createRestrictiveFileName } = await import('@/lib/storageUtils');
            const restrictiveFileName = fileName.split('/')[0] + '/' + createRestrictiveFileName(fileName);
            
            const retryResult = await supabase.storage
              .from('course-videos')
              .upload(restrictiveFileName, file, {
                cacheControl: '3600',
                upsert: false,
                contentType,
                duplex: 'half'
              });
              
            if (retryResult.error) {
              throw retryResult.error;
            }
            
            // Get public URL for retry
            const { data: { publicUrl } } = supabase.storage
              .from('course-videos')
              .getPublicUrl(retryResult.data.path);

            return { path: retryResult.data.path, publicUrl };
          }
          
          throw error;
        }

        // Get public URL for successful first attempt
        const { data: { publicUrl } } = supabase.storage
          .from('course-videos')
          .getPublicUrl(data.path);

        return { path: data.path, publicUrl };
      } catch (uploadError) {
        console.error('Error uploading video:', uploadError);
        throw uploadError;
      }
    },
    onError: (error: any) => {
      // Check for size limit errors first
      if (error.message?.includes('maximum allowed size') || error.message?.includes('exceeded')) {
        toast({
          title: "Arquivo muito grande",
          description: "O vídeo excede o limite permitido. Aumente o limite global no Dashboard do Supabase (Storage > Settings) ou envie um arquivo menor.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Erro ao fazer upload do vídeo",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};