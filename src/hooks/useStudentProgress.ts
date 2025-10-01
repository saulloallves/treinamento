import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsProfessor } from '@/hooks/useIsProfessor';

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
  const { data: isAdmin = false } = useIsAdmin(user?.id);
  const { data: isProfessor = false } = useIsProfessor(user?.id);

  // Buscar ou criar matrícula para o usuário neste curso
  const ensureEnrollment = async () => {
    if (!user?.id) {
      console.log('❌ Usuário não autenticado para ensureEnrollment');
      return null;
    }

    console.log('🔍 Buscando matrícula para usuário:', user.id, 'curso:', courseId);

    // Primeiro, verificar se já existe matrícula - usar maybeSingle para evitar erro
    const { data: existingEnrollment, error: existingError } = await supabase
      .from('enrollments')
      .select('id, student_name, student_email')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) // Pegar a mais recente se houver duplicatas
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error('❌ Erro ao buscar matrícula existente:', existingError);
      return null;
    }

    if (existingEnrollment) {
      console.log('✅ Matrícula encontrada:', existingEnrollment.id);
      return existingEnrollment.id;
    }

    // Se não existe, criar uma nova matrícula
    console.log('📝 Criando nova matrícula...');
    const { data: userData } = await supabase
      .from('users')
      .select('name, email, phone')
      .eq('id', user.id)
      .maybeSingle();

    // Buscar uma turma disponível para o curso
    const { data: turma, error: turmaErr } = await supabase
      .from('turmas')
      .select('id')
      .eq('course_id', courseId)
      .eq('status', 'agendada')
      .limit(1)
      .maybeSingle();

    if (turmaErr) {
      console.error('Erro ao buscar turma:', turmaErr);
      throw turmaErr;
    }

    if (!turma?.id) {
      throw new Error('Não há turmas disponíveis para este curso no momento.');
    }

    const { data: newEnrollment, error: createError } = await supabase
      .from('enrollments')
      .insert([{
        course_id: courseId,
        user_id: user.id,
        student_name: userData?.name || 'Estudante',
        student_email: userData?.email || '',
        student_phone: userData?.phone || '',
        turma_id: turma.id,
        status: 'Ativo'
      }])
      .select('id')
      .single();

    if (createError) {
      console.error('❌ Erro ao criar matrícula:', createError);
      return null;
    }

    console.log('✅ Nova matrícula criada:', newEnrollment.id);
    return newEnrollment.id;
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
      
      // Admins e professores não têm progresso de aula
      if (isAdmin || isProfessor) {
        console.log('⏭️ Admin/Professor - progresso não será salvo');
        return null;
      }

      // Garantir que existe matrícula para o usuário
      const enrollmentId = await ensureEnrollment();
      if (!enrollmentId) {
        throw new Error('Could not create or find enrollment');
      }

      console.log('🎯 Atualizando progresso - Aula:', lessonId, 'Status:', status, 'Tempo:', watchTimeMinutes);

      // Verificar se já existe progresso para esta aula - usar maybeSingle para evitar erro
      const { data: existingProgress, error: progressError } = await supabase
        .from('student_progress')
        .select('id, status, watch_time_minutes')
        .eq('enrollment_id', enrollmentId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (progressError) {
        console.error('❌ Erro ao buscar progresso existente:', progressError);
        throw progressError;
      }

      const progressData = {
        enrollment_id: enrollmentId,
        lesson_id: lessonId,
        status,
        watch_time_minutes: watchTimeMinutes,
        ...(status === 'completed' && { completed_at: new Date().toISOString() })
      };

      if (existingProgress) {
        console.log('⏫ Atualizando progresso existente:', existingProgress.id);
        // Atualizar progresso existente, mas manter o maior tempo assistido
        const finalWatchTime = Math.max(existingProgress.watch_time_minutes || 0, watchTimeMinutes);
        const finalProgressData = { 
          ...progressData, 
          watch_time_minutes: finalWatchTime 
        };
        
        const { data, error } = await supabase
          .from('student_progress')
          .update(finalProgressData)
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar progresso:', error);
          throw error;
        }
        
        console.log('✅ Progresso atualizado com sucesso:', data.id);
        return data;
      } else {
        console.log('➕ Criando novo registro de progresso');
        // Criar novo progresso
        const { data, error } = await supabase
          .from('student_progress')
          .insert([progressData])
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao criar progresso:', error);
          throw error;
        }
        
        console.log('✅ Progresso criado com sucesso:', data.id);
        return data;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Progresso salvo com sucesso na base:', data.id);
      // Salvar último progresso no localStorage para recuperação
      if (typeof window !== 'undefined') {
        localStorage.setItem(`lastProgress_${courseId}`, JSON.stringify({
          lessonId: data.lesson_id,
          status: data.status,
          timestamp: new Date().toISOString()
        }));
      }
      queryClient.invalidateQueries({ queryKey: ['student-progress', courseId, user?.id] });
    },
    onError: (error: any) => {
      // Não mostrar erro para admins e professores
      if (isAdmin || isProfessor) {
        console.log('⏭️ Admin/Professor - erro de progresso ignorado');
        return;
      }
      
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

  // Função para recuperar último progresso do localStorage
  const getLastProgress = () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(`lastProgress_${courseId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Função para marcar aula como completada manualmente
  const markLessonCompletedManually = (lessonId: string) => {
    console.log('👆 Marcação manual de aula completada:', lessonId);
    markLessonCompleted(lessonId);
  };

  return {
    progressData,
    isLoading,
    markLessonCompleted,
    markLessonInProgress,
    markLessonCompletedManually,
    isLessonCompleted,
    getCompletedLessons,
    getLastProgress,
    isUpdating: updateProgressMutation.isPending
  };
};