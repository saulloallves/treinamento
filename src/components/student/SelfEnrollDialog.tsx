
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

interface SelfEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SelfEnrollDialog = ({ open, onOpenChange }: SelfEnrollDialogProps) => {
  const [courseId, setCourseId] = useState<string>('');

  const { data: courses = [] } = useCourses();
  const { data: myEnrollments = [] } = useMyEnrollments();
  const selfEnroll = useSelfEnroll();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    await selfEnroll.mutateAsync({
      course_id: courseId,
    });

    if (!selfEnroll.isError) {
      setCourseId('');
      onOpenChange(false);
    }
  };

  // Filtrar cursos ativos e onde o usuário ainda não está inscrito
  const enrolledCourseIds = new Set(myEnrollments.map(enrollment => enrollment.course_id));
  const availableCourses = courses.filter(c => 
    c.status === 'Ativo' && !enrolledCourseIds.has(c.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.length === 0 ? (
                  <SelectItem value="" disabled>
                    Nenhum curso disponível para inscrição
                  </SelectItem>
                ) : (
                  availableCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={!courseId || availableCourses.length === 0 || selfEnroll.isPending}
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
