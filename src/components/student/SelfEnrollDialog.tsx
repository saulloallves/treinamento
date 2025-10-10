
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
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('turmas')
        .select('course_id, enrollment_open_at, enrollment_close_at')
        .eq('status', 'agendada')
        .or(`enrollment_open_at.is.null,enrollment_open_at.lte.${now}`)
        .or(`enrollment_close_at.is.null,enrollment_close_at.gte.${now}`);

      if (error) {
        console.error('Error fetching available turmas:', error);
        return [];
      }

      return data || [];
    },
    enabled: open, // Só busca quando o diálogo está aberto
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    await selfEnroll.mutateAsync({
      course_id: courseId,
      phone: phone.trim() || undefined,
    });

    if (!selfEnroll.isError) {
      setCourseId('');
      setPhone('');
      onOpenChange(false);
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

  // Verificar permissões de acesso aos cursos
  const { data: courseAccessChecks = {} } = useQuery({
    queryKey: ['course-access-checks', currentUser?.id, courses.map(c => c.id)],
    queryFn: async () => {
      if (!currentUser?.id) return {};
      
      const checks: Record<string, boolean> = {};
      
      // Verificar acesso para cada curso usando a função RPC do banco
      await Promise.all(
        courses.map(async (course) => {
          const { data, error } = await supabase.rpc('can_user_access_course', {
            p_user_id: currentUser.id,
            p_course_id: course.id
          });
          
          if (!error) {
            checks[course.id] = data || false;
          } else {
            console.error(`Erro ao verificar acesso ao curso ${course.name}:`, error);
            checks[course.id] = false;
          }
        })
      );
      
      return checks;
    },
    enabled: open && !!currentUser?.id && courses.length > 0,
  });
  
  // Filtrar cursos com base em acesso por cargo e permissões
  const availableCourses = useMemo(() => {
    const enrolledCourseIds = new Set(myEnrollments.map(enrollment => enrollment.course_id));
    const coursesWithOpenEnrollment = new Set(availableTurmas.map(turma => turma.course_id));
    
    return courses.filter((course) => {
      // Filtros básicos
      if (course.status !== 'Ativo' || enrolledCourseIds.has(course.id) || !coursesWithOpenEnrollment.has(course.id)) {
        return false;
      }
      
      // Verificar se o usuário tem permissão para acessar este curso
      const hasAccess = courseAccessChecks[course.id];
      
      return hasAccess === true;
    });
  }, [courses, myEnrollments, availableTurmas, courseAccessChecks]);

  // Dados para debug
  const enrolledCourseIds = new Set(myEnrollments.map(enrollment => enrollment.course_id));
  const coursesWithOpenEnrollment = new Set(availableTurmas.map(turma => turma.course_id));

  // Debug: log para verificar
  console.log('=== DEBUG AUTOINSCRIÇÃO ===');
  console.log('Usuário atual:', currentUser);
  console.log('Todos os cursos:', courses);
  console.log('Verificações de acesso aos cursos:', courseAccessChecks);
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
