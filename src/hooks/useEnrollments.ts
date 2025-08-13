
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Enrollment {
  id: string;
  course_id: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  enrollment_date: string;
  status: string;
  progress_percentage: number;
  completed_lessons: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  unit_code?: string;
  courses?: {
    name: string;
  };
  units?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface EnrollmentInput {
  course_id: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  status?: string;
  unit_code: string;
}

export const useEnrollments = (courseId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['enrollments', courseId],
    queryFn: async () => {
      let query = supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data: enrollments, error } = await query;

      if (error) {
        console.error('Error fetching enrollments:', error);
        toast({
          title: "Erro ao carregar inscrições",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Buscar dados das unidades separadamente
      const unitCodes = Array.from(new Set(enrollments?.map(e => e.unit_code).filter(Boolean))) as string[];
      let unitsMap: Record<string, { id: string; name: string; code: string }> = {};
      
      if (unitCodes.length > 0) {
        const { data: units } = await supabase
          .from('units')
          .select('id, name, code')
          .in('code', unitCodes);
        
        if (units) {
          units.forEach(unit => {
            unitsMap[unit.code] = unit;
          });
        }
      }

      // Combinar dados das inscrições com dados das unidades
      const enrichedEnrollments = enrollments?.map(enrollment => ({
        ...enrollment,
        units: enrollment.unit_code ? unitsMap[enrollment.unit_code] : undefined
      })) || [];

      return enrichedEnrollments as Enrollment[];
    }
  });
};

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (enrollmentData: EnrollmentInput) => {
      // Evita duplicidade: mesmo email + curso
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_email', enrollmentData.student_email)
        .eq('course_id', enrollmentData.course_id)
        .maybeSingle();

      if (existing?.id) {
        throw new Error('Aluno já inscrito neste curso.');
      }

      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          ...enrollmentData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating enrollment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalida todas as queries relacionadas a 'enrollments' (qualquer courseId)
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'enrollments',
      });
      toast({
        title: "Inscrição criada com sucesso!",
        description: "O aluno foi inscrito no curso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar inscrição",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...enrollmentData }: Enrollment) => {
      const { data, error } = await supabase
        .from('enrollments')
        .update(enrollmentData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating enrollment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast({
        title: "Inscrição atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar inscrição",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) {
        console.error('Error deleting enrollment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast({
        title: "Inscrição excluída com sucesso!",
        description: "O aluno foi removido do curso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir inscrição",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};
