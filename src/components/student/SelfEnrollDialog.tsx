
import { useState } from 'react';
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

  // Filtrar cursos ativos e onde o usuário ainda não está inscrito
  const enrolledCourseIds = new Set(myEnrollments.map(enrollment => enrollment.course_id));
  const availableCourses = courses.filter(c => 
    c.status === 'Ativo' && !enrolledCourseIds.has(c.id)
  );

  // Debug: log para verificar
  console.log('Todos os cursos:', courses);
  console.log('Cursos inscritos:', enrolledCourseIds);
  console.log('Cursos disponíveis:', availableCourses);

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
                Nenhum curso disponível para inscrição. Você já está inscrito em todos os cursos ativos.
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
