
import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCourses } from '@/hooks/useCourses';
import { useSelfEnroll } from '@/hooks/useStudentPortal';
import { useMyEnrollments } from '@/hooks/useMyEnrollments';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUserPosition } from '@/hooks/useCourseAccess';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SelfEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SelfEnrollDialog = ({ open, onOpenChange }: SelfEnrollDialogProps) => {
  const [courseId, setCourseId] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const { data: courses = [] } = useCourses();
  const { data: myEnrollments = [] } = useMyEnrollments();
  const { data: currentUser } = useCurrentUser();
  const selfEnroll = useSelfEnroll();

  // Buscar turmas com inscrições abertas
  const { data: availableTurmas = [] } = useQuery({
    queryKey: ['available-turmas-for-enrollment'],
    queryFn: async () => {
      const now = new Date();
      console.log('[SelfEnroll] Buscando turmas... Data/hora atual:', now.toISOString());
      
      // Buscar turmas agendadas ou em andamento
      const { data, error } = await supabase
        .from('turmas')
        .select('course_id, enrollment_open_at, enrollment_close_at, status')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .in('status', ['agendada', 'em_andamento'] as any); // Cast necessário para o TypeScript

      if (error) {
        console.error('[SelfEnroll] Error fetching available turmas:', error);
        return [];
      }

      console.log('[SelfEnroll] Turmas encontradas no banco:', data);

      // Filtrar turmas com janela de inscrição aberta
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filtered = (data || []).filter((turma: any) => {
        console.log('[SelfEnroll] Verificando turma:', {
          course_id: turma.course_id,
          enrollment_open_at: turma.enrollment_open_at,
          enrollment_close_at: turma.enrollment_close_at,
          status: turma.status
        });

        // Se não há datas definidas, considerar como sempre aberta
        if (!turma.enrollment_open_at && !turma.enrollment_close_at) {
          console.log('[SelfEnroll] ✅ Turma sem datas de inscrição - sempre aberta');
          return true;
        }
        
        // Verificar se está dentro da janela de inscrições
        const openAt = turma.enrollment_open_at ? new Date(turma.enrollment_open_at) : null;
        const closeAt = turma.enrollment_close_at ? new Date(turma.enrollment_close_at) : null;
        
        console.log('[SelfEnroll] Comparação de datas:', {
          now: now.toISOString(),
          openAt: openAt?.toISOString(),
          closeAt: closeAt?.toISOString()
        });
        
        const isAfterOpen = !openAt || now >= openAt;
        const isBeforeClose = !closeAt || now <= closeAt;
        
        console.log('[SelfEnroll] Resultado:', {
          isAfterOpen,
          isBeforeClose,
          allowed: isAfterOpen && isBeforeClose
        });
        
        return isAfterOpen && isBeforeClose;
      });

      console.log('[SelfEnroll] Turmas com inscrições abertas:', filtered);
      return filtered;
    },
    enabled: open, // Só busca quando o diálogo está aberto
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    try {
      await selfEnroll.mutateAsync({
        course_id: courseId,
        phone: phone.trim() || undefined,
      });

      // Só limpa e fecha se não houve erro
      setCourseId('');
      setPhone('');
      onOpenChange(false);
    } catch (error) {
      // O erro já é tratado pelo onError do mutation
      console.error('[SelfEnroll] Erro ao inscrever:', error);
    }
  };

  // Inicializar telefone com o valor do usuário atual quando o dialog abrir
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && currentUser?.phone) {
      setPhone(currentUser.phone);
    } else if (!newOpen) {
      setPhone('');
    }
    onOpenChange(newOpen);
  };

  // Filtrar cursos com base em acesso e permissões
  const availableCourses = useMemo(() => {
    if (!currentUser) return [];
    
    const enrolledCourseIds = new Set(myEnrollments.map(enrollment => enrollment.course_id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coursesWithOpenEnrollment = new Set(availableTurmas.map((turma: any) => turma.course_id));
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Array.isArray(courses) ? courses : []).filter((course: any) => {
      // Filtros básicos
      if (course.status !== 'Ativo' || enrolledCourseIds.has(course.id) || !coursesWithOpenEnrollment.has(course.id)) {
        return false;
      }
      
      // Verificar acesso baseado no public_target do curso
      const userRole = currentUser.role;
      const publicTarget = course.public_target;
      
      // Se o curso é para "ambos", sempre permite (Franqueados E Colaboradores)
      if (publicTarget === 'ambos') {
        return true;
      }
      
      // Se o curso é para "franqueado", apenas Franqueados podem se inscrever
      if (publicTarget === 'franqueado') {
        return userRole === 'Franqueado';
      }
      
      // Se o curso é para "colaborador", apenas Colaboradores podem se inscrever
      if (publicTarget === 'colaborador') {
        return userRole === 'Colaborador';
      }
      
      // Se não tem public_target definido, permite para todos
      return true;
    });
  }, [courses, myEnrollments, availableTurmas, currentUser]);

  // Dados para debug
  const enrolledCourseIds = new Set(myEnrollments.map(enrollment => enrollment.course_id));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coursesWithOpenEnrollment = new Set(availableTurmas.map((turma: any) => turma.course_id));

  // Debug: log para verificar
  console.log('=== DEBUG AUTOINSCRIÇÃO ===');
  console.log('Usuário atual:', currentUser);
  console.log('Todos os cursos:', courses);
  console.log('Cursos inscritos:', Array.from(enrolledCourseIds));
  console.log('Turmas com inscrições abertas:', availableTurmas);
  console.log('Cursos disponíveis após filtro:', availableCourses);
  console.log('=========================');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-blue" />
            Autoinscrição em Curso
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Curso *
            </label>
            {availableCourses.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted">
                {coursesWithOpenEnrollment.size === 0 
                  ? "Nenhum curso está com inscrições abertas no momento."
                  : "Nenhum curso disponível para inscrição. Você já está inscrito em todos os cursos com inscrições abertas."
                }
              </div>
            ) : (
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Telefone WhatsApp *
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Para receber informações automáticas sobre o curso
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={!courseId || !phone.trim() || availableCourses.length === 0 || selfEnroll.isPending}
            >
              {selfEnroll.isPending ? 'Inscrevendo...' : 'Confirmar Inscrição'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SelfEnrollDialog;
