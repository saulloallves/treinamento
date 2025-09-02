import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface StudentProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  watch_time_minutes: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useStudentProgress = (courseId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar ou criar matrícula para o usuário neste curso
  const ensureEnrollment = async () => {
    if (!user?.id) return null;

    // Primeiro, verificar se já existe matrícula
    const { data: existingEnrollment, error: existingError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .single();

    if (existingEnrollment) {
      return existingEnrollment.id;
    }

    // Se não existe, criar uma nova matrícula
    if (existingError?.code === 'PGRST116') { // No rows returned
      const { data: userData } = await supabase
        .from('users')
        .select('name, email, phone')
        .eq('id', user.id)
        .single();

      const { data: newEnrollment, error: createError } = await supabase
        .from('enrollments')
        .insert([{
          course_id: courseId,
          user_id: user.id,
          student_name: userData?.name || 'Estudante',
          student_email: userData?.email || '',
          student_phone: userData?.phone || '',
          status: 'Ativo'
        }])
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating enrollment:', createError);
        return null;
      }

      return newEnrollment.id;
    }

    console.error('Error checking enrollment:', existingError);
    return null;
  };

  // Buscar progresso do estudante para este curso
  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['student-progress', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const enrollmentId = await ensureEnrollment();
      if (!enrollmentId) return [];

      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('enrollment_id', enrollmentId);

      if (error) {
        console.error('Error fetching student progress:', error);
        return [];
      }

      return data as StudentProgress[];
    },
    enabled: !!user?.id && !!courseId,
  });

  // Mutation para atualizar progresso
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      lessonId, 
      status, 
      watchTimeMinutes = 0 
    }: { 
      lessonId: string; 
      status: 'in_progress' | 'completed';
      watchTimeMinutes?: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Garantir que existe matrícula para o usuário
      const enrollmentId = await ensureEnrollment();
      if (!enrollmentId) {
        throw new Error('Could not create or find enrollment');
      }

      // Verificar se já existe progresso para esta aula
      const { data: existingProgress } = await supabase
        .from('student_progress')
        .select('id')
        .eq('enrollment_id', enrollmentId)
        .eq('lesson_id', lessonId)
        .single();

      const progressData = {
        enrollment_id: enrollmentId,
        lesson_id: lessonId,
        status,
        watch_time_minutes: watchTimeMinutes,
        ...(status === 'completed' && { completed_at: new Date().toISOString() })
      };

      if (existingProgress) {
        // Atualizar progresso existente
        const { data, error } = await supabase
          .from('student_progress')
          .update(progressData)
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar novo progresso
        const { data, error } = await supabase
          .from('student_progress')
          .insert([progressData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress', courseId, user?.id] });
    },
    onError: (error: any) => {
      console.error('Error updating student progress:', error);
      toast({
        title: "Erro ao salvar progresso",
        description: "Não foi possível salvar o progresso da aula.",
        variant: "destructive",
      });
    }
  });

  // Função para marcar aula como completada
  const markLessonCompleted = (lessonId: string) => {
    updateProgressMutation.mutate({
      lessonId,
      status: 'completed'
    });
  };

  // Função para marcar aula como em progresso
  const markLessonInProgress = (lessonId: string, watchTimeMinutes: number = 0) => {
    updateProgressMutation.mutate({
      lessonId,
      status: 'in_progress',
      watchTimeMinutes
    });
  };

  // Função para verificar se uma aula foi completada
  const isLessonCompleted = (lessonId: string): boolean => {
    return progressData.some(progress => 
      progress.lesson_id === lessonId && progress.status === 'completed'
    );
  };

  // Função para obter aulas completadas
  const getCompletedLessons = (): string[] => {
    return progressData
      .filter(progress => progress.status === 'completed')
      .map(progress => progress.lesson_id);
  };

  return {
    progressData,
    isLoading,
    markLessonCompleted,
    markLessonInProgress,
    isLessonCompleted,
    getCompletedLessons,
    isUpdating: updateProgressMutation.isPending
  };
};