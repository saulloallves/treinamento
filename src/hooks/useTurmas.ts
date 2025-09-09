import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Turma {
  id: string;
  course_id: string;
  name?: string;
  code?: string;
  responsavel_user_id: string;
  status: 'agendada' | 'inscricoes_abertas' | 'inscricoes_encerradas' | 'em_andamento' | 'encerrada' | 'cancelada';
  start_at?: string;
  end_at?: string;
  enrollment_open_at?: string;
  enrollment_close_at?: string;
  completion_deadline: string;
  capacity?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  responsavel_user?: {
    id: string;
    name: string;
    email: string;
  };
  enrollments_count?: number;
}

export interface TurmaInput {
  course_id: string;
  name?: string;
  code?: string;
  responsavel_user_id?: string;
  responsavel_name?: string;
  completion_deadline: string;
  enrollment_open_at?: string;
  enrollment_close_at?: string;
  capacity?: number;
}

export const useTurmas = (courseId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['turmas', courseId],
    queryFn: async () => {
      let query = supabase
        .from('turmas')
        .select(`
          *,
          responsavel_user:users!responsavel_user_id(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching turmas:', error);
        toast({
          title: "Erro ao carregar turmas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Get enrollment count for each turma
      const turmasWithCounts = await Promise.all(
        (data || []).map(async (turma) => {
          const { count } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('turma_id', turma.id);
          
          return {
            ...turma,
            enrollments_count: count || 0
          };
        })
      );

      return turmasWithCounts as Turma[];
    }
  });
};

export const useCreateTurma = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (turmaData: TurmaInput) => {
      let finalTurmaData: any = { ...turmaData };
      
      // If responsavel_name is provided but responsavel_user_id is not,
      // we'll use responsavel_name and set responsavel_user_id to null
      if (turmaData.responsavel_name && !turmaData.responsavel_user_id) {
        finalTurmaData.responsavel_user_id = null;
      }

      const { data, error } = await supabase
        .from('turmas')
        .insert([{
          ...finalTurmaData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating turma:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast({
        title: "Turma criada com sucesso!",
        description: "A nova turma foi adicionada à lista.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar turma",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateTurma = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...turmaData }: Partial<Turma> & { id: string }) => {
      const { data, error } = await supabase
        .from('turmas')
        .update(turmaData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating turma:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast({
        title: "Turma atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar turma",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useStartTurma = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (turmaId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('start_turma', {
        p_turma_id: turmaId,
        p_user_id: user.user.id
      });

      if (error) {
        console.error('Error starting turma:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast({
        title: "Turma iniciada com sucesso!",
        description: "A turma está agora em andamento.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao iniciar turma",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useConcludeTurma = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (turmaId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('conclude_turma', {
        p_turma_id: turmaId,
        p_user_id: user.user.id
      });

      if (error) {
        console.error('Error concluding turma:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['transformation_kanban'] });
      toast({
        title: "Turma encerrada com sucesso!",
        description: "A turma foi encerrada e adicionada ao Kanban de Transformação.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao encerrar turma",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useEnrollInTurma = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ turmaId, studentId, courseId }: { turmaId: string, studentId: string, courseId: string }) => {
      // First, get student details
      const { data: student, error: studentError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Create enrollment with turma_id - the backend will validate enrollment window
      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          course_id: courseId,
          turma_id: turmaId,
          user_id: studentId,
          student_name: student.name,
          student_email: student.email,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error enrolling in turma:', error);
        
        // Provide specific error messages for enrollment window issues
        if (error.code === '42501' || error.message.includes('can_enroll_in_turma')) {
          throw new Error('Não é possível se inscrever nesta turma. Verifique se as inscrições estão abertas e se você atende aos critérios.');
        }
        
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast({
        title: "Aluno inscrito com sucesso!",
        description: "O aluno foi inscrito na turma.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao inscrever aluno",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useTurmasForEnrollment = (courseId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['turmas-enrollment', courseId],
    queryFn: async () => {
      let query = supabase
        .from('turmas')
        .select(`
          *,
          responsavel_user:users!responsavel_user_id(id, name, email)
        `)
        .eq('course_id', courseId)
        .in('status', ['agendada', 'inscricoes_abertas', 'em_andamento']) // Include turmas that can accept enrollments
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching enrollment turmas:', error);
        toast({
          title: "Erro ao carregar turmas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Get enrollment count for each turma
      const turmasWithCounts = await Promise.all(
        (data || []).map(async (turma) => {
          const { count } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('turma_id', turma.id);
          
          return {
            ...turma,
            enrollments_count: count || 0
          };
        })
      );

      return turmasWithCounts as Turma[];
    },
    enabled: !!courseId
  });
};

export const useForceCloseEnrollments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (turmaId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('force_close_turma_enrollments', {
        p_turma_id: turmaId,
        p_user_id: user.user.id
      });

      if (error) {
        console.error('Error force closing enrollments:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast({
        title: "Inscrições encerradas com sucesso!",
        description: "As inscrições da turma foram fechadas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao encerrar inscrições",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};