
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateEnrollment } from "@/hooks/useEnrollments";
import { useTurmasForEnrollment } from "@/hooks/useTurmas";

interface CreateEnrollmentDialogProps {
  courseId: string;
  courseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateEnrollmentDialog = ({ courseId, courseName, open, onOpenChange }: CreateEnrollmentDialogProps) => {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [turmaId, setTurmaId] = useState("");

  const createEnrollmentMutation = useCreateEnrollment();
  const { data: turmas = [], isLoading: turmasLoading } = useTurmasForEnrollment(courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim() || !studentEmail.trim() || !unitCode.trim() || !turmaId) {
      return;
    }

    try {
      await createEnrollmentMutation.mutateAsync({
        course_id: courseId,
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        student_phone: studentPhone.trim() || undefined,
        unit_code: unitCode.trim(),
        turma_id: turmaId,
      });

      // Reset form
      setStudentName("");
      setStudentEmail("");
      setStudentPhone("");
      setUnitCode("");
      setTurmaId("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating enrollment:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-blue" />
            Adicionar Aluno
          </DialogTitle>
          <p className="text-sm text-brand-gray-dark">
            Inscrevendo no curso: <strong>{courseName}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Turma *
            </label>
            <select
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              className="h-10 w-full px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 relative z-50"
              disabled={turmasLoading}
              required
            >
              <option value="">{turmasLoading ? "Carregando turmas..." : "Selecione uma turma"}</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.code} - Prof. {t.responsavel_user?.name || 'Não definido'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Nome do Aluno *
            </label>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Digite o nome completo"
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
              placeholder="email@exemplo.com"
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

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Código da Unidade *
            </label>
            <Input
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
              placeholder="Ex: 1728"
              required
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
              disabled={createEnrollmentMutation.isPending || !studentName.trim() || !studentEmail.trim() || !unitCode.trim() || !turmaId}
            >
              {createEnrollmentMutation.isPending ? "Criando..." : "Adicionar Aluno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEnrollmentDialog;
