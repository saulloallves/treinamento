import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Class {
  id: string;
  course_id: string;
  responsible_id: string;
  name: string;
  description?: string;
  status: 'criada' | 'iniciada' | 'encerrada';
  deadline: string;
  max_students: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Dados relacionados
  course?: {
    id: string;
    name: string;
    description?: string;
    tipo: 'ao_vivo' | 'gravado';
  };
  responsible?: {
    id: string;
    name: string;
    email: string;
  };
  student_count?: number;
}

export interface ClassInput {
  course_id: string;
  responsible_id: string;
  name: string;
  description?: string;
  deadline: string;
  max_students?: number;
}

export interface StudentClass {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: 'inscrito' | 'concluido' | 'cancelado';
  completion_date?: string;
  // Dados relacionados
  student?: {
    id: string;
    name: string;
    email: string;
  };
  class?: {
    id: string;
    name: string;
    status: string;
  };
}

// Hook para listar turmas
export const useClasses = (filters?: {
  status?: 'criada' | 'iniciada' | 'encerrada';
  responsible_id?: string;
  course_id?: string;
}) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['classes', filters],
    queryFn: async () => {
      let query = supabase
        .from('classes')
        .select(`
          *,
          course:courses(id, name, description, tipo),
          responsible:users!classes_responsible_id_fkey(id, name, email),
          student_classes!inner(count)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.responsible_id) {
        query = query.eq('responsible_id', filters.responsible_id);
      }
      if (filters?.course_id) {
        query = query.eq('course_id', filters.course_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Erro ao carregar turmas",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return (data || []).map((item: any) => ({
        ...item,
        student_count: item.student_classes?.[0]?.count || 0
      })) as Class[];
    }
  });
};

// Hook para obter uma turma específica
export const useClass = (classId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      if (!classId) return null;

      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          course:courses(id, name, description, tipo),
          responsible:users!classes_responsible_id_fkey(id, name, email)
        `)
        .eq('id', classId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching class:', error);
        toast({
          title: "Erro ao carregar turma",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Class | null;
    },
    enabled: !!classId
  });
};

// Hook para criar turma
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (classData: ClassInput) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          ...classData,
          created_by: user?.user?.id
        }])
        .select(`
          *,
          course:courses(id, name, description, tipo),
          responsible:users!classes_responsible_id_fkey(id, name, email)
        `)
        .single();

      if (error) {
        console.error('Error creating class:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
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

// Hook para atualizar turma
export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...classData }: Partial<Class> & { id: string }) => {
      const { data, error } = await supabase
        .from('classes')
        .update(classData)
        .eq('id', id)
        .select(`
          *,
          course:courses(id, name, description, tipo),
          responsible:users!classes_responsible_id_fkey(id, name, email)
        `)
        .single();

      if (error) {
        console.error('Error updating class:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class'] });
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

// Hook para gerenciar status da turma
export const useManageClassStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ classId, newStatus }: { classId: string; newStatus: 'criada' | 'iniciada' | 'encerrada' }) => {
      const { error } = await supabase.rpc('manage_class_status', {
        _class_id: classId,
        _new_status: newStatus
      });

      if (error) {
        console.error('Error managing class status:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
      
      const statusMessages = {
        'iniciada': 'Turma iniciada com sucesso!',
        'encerrada': 'Turma encerrada com sucesso! O curso foi movido para "Pronto para virar treinamento".',
        'criada': 'Status da turma atualizado para criada.'
      };
      
      toast({
        title: statusMessages[variables.newStatus],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status da turma",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook para deletar turma
export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) {
        console.error('Error deleting class:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Turma excluída com sucesso!",
        description: "A turma foi removida da lista.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir turma",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook para listar inscrições de uma turma
export const useStudentClasses = (classId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['student-classes', classId],
    queryFn: async () => {
      if (!classId) return [];

      const { data, error } = await supabase
        .from('student_classes')
        .select(`
          *,
          student:users!student_classes_student_id_fkey(id, name, email),
          class:classes(id, name, status)
        `)
        .eq('class_id', classId)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.error('Error fetching student classes:', error);
        toast({
          title: "Erro ao carregar inscrições",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as StudentClass[];
    },
    enabled: !!classId
  });
};

// Hook para inscrever aluno em turma
export const useEnrollStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ classId, studentId }: { classId: string; studentId: string }) => {
      const { error } = await supabase.rpc('enroll_student_in_class', {
        _class_id: classId,
        _student_id: studentId
      });

      if (error) {
        console.error('Error enrolling student:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-classes', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Aluno inscrito com sucesso!",
        description: "O aluno foi adicionado à turma.",
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

// Hook para atualizar status de inscrição
export const useUpdateStudentClassStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      studentClassId, 
      status, 
      completionDate 
    }: { 
      studentClassId: string; 
      status: 'inscrito' | 'concluido' | 'cancelado';
      completionDate?: string;
    }) => {
      const updateData: any = { status };
      if (completionDate) {
        updateData.completion_date = completionDate;
      }

      const { error } = await supabase
        .from('student_classes')
        .update(updateData)
        .eq('id', studentClassId);

      if (error) {
        console.error('Error updating student class status:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-classes'] });
      toast({
        title: "Status da inscrição atualizado!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status da inscrição",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};