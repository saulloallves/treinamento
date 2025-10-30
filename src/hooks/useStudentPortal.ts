import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isWithinLessonAccessWindow } from '@/lib/dateUtils';

type UUID = string;

export interface SelfEnrollmentInput {
  course_id: UUID;
  phone?: string;
}

export interface MarkAttendanceInput {
  enrollment_id: UUID;
  lesson_id: UUID;
  attendance_keyword?: string;
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

      // Usar o telefone do input ou o do usuário cadastrado
      const phoneToUse = input.phone || userData.phone;

      // Verificar se o usuário já está inscrito neste curso
      const { data: existing, error: dupErr } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', input.course_id)
        .maybeSingle();

      if (dupErr) {
        console.error('Erro ao verificar duplicidade de inscrição:', dupErr);
        throw dupErr;
      }
      if (existing?.id) {
        throw new Error('Você já está inscrito neste curso.');
      }

      // Buscar uma turma disponível para o curso com inscrições abertas
      const now = new Date().toISOString();
      console.log('[useSelfEnroll] Buscando turma para course_id:', input.course_id, 'em:', now);
      
      const { data: turmas, error: turmaErr } = await supabase
        .from('turmas')
        .select('id, enrollment_open_at, enrollment_close_at, status')
        .eq('course_id', input.course_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .in('status', ['agendada', 'em_andamento'] as any);

      if (turmaErr) {
        console.error('[useSelfEnroll] Erro ao buscar turma:', turmaErr);
        throw turmaErr;
      }

      console.log('[useSelfEnroll] Turmas encontradas:', turmas);

      // Filtrar turmas com inscrições abertas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const turmasAbertas = (turmas || []).filter((t: any) => {
        // Se não há datas definidas, considerar como sempre aberta
        if (!t.enrollment_open_at && !t.enrollment_close_at) {
          console.log('[useSelfEnroll] Turma sem datas - sempre aberta:', t.id);
          return true;
        }

        const nowDate = new Date(now);
        const openAt = t.enrollment_open_at ? new Date(t.enrollment_open_at) : null;
        const closeAt = t.enrollment_close_at ? new Date(t.enrollment_close_at) : null;

        const isAfterOpen = !openAt || nowDate >= openAt;
        const isBeforeClose = !closeAt || nowDate <= closeAt;

        console.log('[useSelfEnroll] Verificando turma:', {
          turma_id: t.id,
          nowDate: nowDate.toISOString(),
          openAt: openAt?.toISOString(),
          closeAt: closeAt?.toISOString(),
          isAfterOpen,
          isBeforeClose,
          allowed: isAfterOpen && isBeforeClose
        });

        return isAfterOpen && isBeforeClose;
      });

      console.log('[useSelfEnroll] Turmas com inscrições abertas:', turmasAbertas);

      const turma = turmasAbertas[0];

      if (!turma?.id) {
        throw new Error('Não há turmas com inscrições abertas para este curso no momento.');
      }

      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          course_id: input.course_id,
          student_name: userData.name,
          student_email: userData.email,
          student_phone: phoneToUse,
          unit_code: userData.unit_code,
          user_id: userId,
          turma_id: turma.id,
          status: 'Ativo',
        }])
        .select()
        .maybeSingle();

      // Se um telefone foi fornecido no input e é diferente do cadastrado, atualizar
      if (input.phone && input.phone !== userData.phone) {
        await supabase
          .from('users')
          .update({ phone: input.phone })
          .eq('id', userId);
      }

      if (error) {
        console.error('Erro ao criar autoinscrição:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas a enrollments e cursos
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['available-courses'] });
      queryClient.invalidateQueries({ queryKey: ['available-turmas-for-enrollment'] });
      
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
    mutationFn: async ({ enrollment_id, lesson_id, attendance_keyword }: MarkAttendanceInput) => {
      // Garante que há um usuário autenticado e captura seu id
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp.user) {
        throw new Error('É necessário estar autenticado para marcar presença.');
      }
      const userId = userResp.user.id;

      // Buscar dados da aula para verificar se requer palavra-chave
      const { data: lesson, error: lessonErr } = await supabase
        .from('lessons')
        .select('attendance_keyword, status, title, lesson_date')
        .eq('id', lesson_id)
        .single();

      if (lessonErr) {
        console.error('Erro ao buscar dados da aula:', lessonErr);
        throw new Error('Não foi possível verificar os dados da aula.');
      }

      // NOVA VALIDAÇÃO: Verificar se está dentro da janela de acesso (15 minutos)
      if (lesson.lesson_date) {
        const canAccess = isWithinLessonAccessWindow(lesson.lesson_date, 15);

        if (!canAccess) {
          throw new Error(
            'O prazo para marcar presença nesta aula expirou. ' +
            'Você pode acessar até 15 minutos após o horário de início.'
          );
        }
      }

      // Verificar se aula requer palavra-chave (aulas ativas sempre requerem)
      const requiresKeyword = lesson.status === 'Ativo' || lesson.attendance_keyword;

      if (requiresKeyword) {
        if (!attendance_keyword) {
          throw new Error('Esta aula requer uma palavra-chave para confirmação de presença.');
        }

        const expectedKeyword = lesson.attendance_keyword || 'Cresci e Perdi 2025';

        // Normalizar palavras-chave: lowercase, trim e remover espaços extras
        const normalizeKeyword = (str: string) =>
          str.trim().toLowerCase().replace(/\s+/g, ' ');

        const providedKeyword = normalizeKeyword(attendance_keyword);
        const requiredKeyword = normalizeKeyword(expectedKeyword);

        if (providedKeyword !== requiredKeyword) {
          throw new Error('Palavra-chave incorreta. Verifique com o professor e tente novamente.');
        }
      }

      // Buscar turma_id do enrollment
      const { data: enrollment, error: enrollmentErr } = await supabase
        .from('enrollments')
        .select('turma_id')
        .eq('id', enrollment_id)
        .single();

      if (enrollmentErr || !enrollment?.turma_id) {
        throw new Error('Não foi possível encontrar a turma desta inscrição.');
      }

      const { error } = await supabase
        .from('attendance')
        .insert([{
          enrollment_id,
          lesson_id,
          attendance_type: 'manual',
          user_id: userId,
          turma_id: enrollment.turma_id,
          typed_keyword: attendance_keyword, // Store the typed keyword
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

      // Buscar turma_id do enrollment
      const { data: enrollment, error: enrollmentErr } = await supabase
        .from('enrollments')
        .select('turma_id')
        .eq('id', enrollment_id)
        .single();

      if (enrollmentErr || !enrollment?.turma_id) {
        throw new Error('Não foi possível encontrar a turma desta inscrição.');
      }

      const { data, error } = await supabase
        .from('certificates')
        .insert([{
          enrollment_id,
          course_id,
          status: 'active',
          user_id: userId,
          turma_id: enrollment.turma_id,
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
