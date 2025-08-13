import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UUID = string;

export interface SelfEnrollmentInput {
  course_id: UUID;
}

export interface MarkAttendanceInput {
  enrollment_id: UUID;
  lesson_id: UUID;
}

export interface RequestCertificateInput {
  enrollment_id: UUID;
  course_id: UUID;
}

export const useSelfEnroll = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: SelfEnrollmentInput) => {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp.user) {
        throw new Error('É necessário estar autenticado para se inscrever.');
      }
      const userId = userResp.user.id;

      // Busca dados do usuário logado
      const { data: userData, error: userDataErr } = await supabase
        .from('users')
        .select('name, email, phone, unit_code')
        .eq('id', userId)
        .maybeSingle();

      if (userDataErr) {
        console.error('Erro ao buscar dados do usuário:', userDataErr);
        throw new Error('Erro ao carregar dados do usuário.');
      }

      if (!userData) {
        throw new Error('Dados do usuário não encontrados.');
      }

      // Evita duplicidade: mesmo user no mesmo curso
      const { data: existing, error: dupErr } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', input.course_id)
        .eq('user_id', userId)
        .maybeSingle();

      if (dupErr) {
        console.error('Erro ao verificar duplicidade de inscrição:', dupErr);
        throw dupErr;
      }
      if (existing?.id) {
        throw new Error('Você já está inscrito neste curso.');
      }

      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          course_id: input.course_id,
          student_name: userData.name,
          student_email: userData.email,
          student_phone: userData.phone,
          user_id: userId,
          status: 'Ativo',
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Erro ao criar autoinscrição:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalida qualquer query relacionada a enrollments
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'enrollments',
      });
      toast({
        title: 'Inscrição realizada!',
        description: 'Você foi inscrito no curso com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Não foi possível inscrever',
        description: error?.message ?? 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ enrollment_id, lesson_id }: MarkAttendanceInput) => {
      // Garante que há um usuário autenticado e captura seu id
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp.user) {
        throw new Error('É necessário estar autenticado para marcar presença.');
      }
      const userId = userResp.user.id;

      const { error } = await supabase
        .from('attendance')
        .insert([{
          enrollment_id,
          lesson_id,
          attendance_type: 'manual',
          user_id: userId,
        }]);

      if (error) {
        console.error('Erro ao marcar presença:', error);
        throw error;
      }
    },
    onSuccess: async (_data, variables) => {
      // Recalcula o progresso no banco imediatamente
      try {
        await supabase.rpc('recalc_enrollment_progress', { p_enrollment_id: variables.enrollment_id });
      } catch (e) {
        console.warn('Falha ao recalcular progresso via RPC (seguindo com invalidate):', e);
      }

      // Invalida queries relacionadas para refletir imediatamente
      queryClient.invalidateQueries({
        predicate: (q) => {
          if (!Array.isArray(q.queryKey)) return false;
          const key0 = q.queryKey[0];
          return (
            key0 === 'attendance' ||
            key0 === 'enrollments' ||
            key0 === 'my-enrollment' ||
            key0 === 'my-enrollments'
          );
        },
      });
      toast({
        title: 'Presença confirmada!',
        description: 'Sua presença foi registrada para a aula.',
      });
    },
    onError: (error: any) => {
      const msg = String(error?.message ?? '');
      const already = msg.includes('duplicate key') || msg.includes('unique constraint');
      toast({
        title: already ? 'Presença já registrada' : 'Erro ao marcar presença',
        description: already ? 'Você já confirmou presença nesta aula.' : msg,
        variant: already ? 'default' : 'destructive',
      });
    },
  });
};

export const useMyCertificate = (enrollmentId?: UUID) => {
  return useQuery({
    queryKey: ['certificate', enrollmentId],
    enabled: Boolean(enrollmentId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('enrollment_id', enrollmentId!)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar certificado:', error);
        throw error;
      }

      return data;
    },
  });
};

export const useRequestCertificate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ enrollment_id, course_id }: RequestCertificateInput) => {
      // Garante que há um usuário autenticado e captura seu id
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp.user) {
        throw new Error('É necessário estar autenticado para solicitar certificado.');
      }
      const userId = userResp.user.id;

      const { data, error } = await supabase
        .from('certificates')
        .insert([{
          enrollment_id,
          course_id,
          status: 'active',
          user_id: userId,
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Erro ao solicitar certificado:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'certificate',
      });
      toast({
        title: 'Certificado solicitado!',
        description: 'Sua solicitação foi registrada.',
      });
    },
    onError: (error: any) => {
      const msg = String(error?.message ?? '');
      const already = msg.includes('duplicate key') || msg.includes('unique constraint');
      toast({
        title: already ? 'Certificado já solicitado' : 'Erro ao solicitar certificado',
        description: already ? 'Já existe um certificado vinculado a esta matrícula.' : msg,
        variant: already ? 'default' : 'destructive',
      });
    },
  });
};
