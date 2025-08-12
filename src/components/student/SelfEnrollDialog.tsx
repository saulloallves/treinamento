
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

interface SelfEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SelfEnrollDialog = ({ open, onOpenChange }: SelfEnrollDialogProps) => {
  const [courseId, setCourseId] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');

  const { data: courses = [] } = useCourses();
  const selfEnroll = useSelfEnroll();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !studentName.trim() || !studentEmail.trim()) return;

    await selfEnroll.mutateAsync({
      course_id: courseId,
      student_name: studentName.trim(),
      student_email: studentEmail.trim(),
      student_phone: studentPhone.trim() || undefined,
    });

    if (!selfEnroll.isError) {
      setCourseId('');
      setStudentName('');
      setStudentEmail('');
      setStudentPhone('');
      onOpenChange(false);
    }
  };

  const activeCourses = courses.filter(c => c.status === 'Ativo');

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
                {activeCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Nome Completo *
            </label>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Email *
            </label>
            <Input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Telefone
            </label>
            <Input
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
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
              disabled={!courseId || !studentName.trim() || !studentEmail.trim() || selfEnroll.isPending}
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
