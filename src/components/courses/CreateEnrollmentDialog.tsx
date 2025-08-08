
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

  const createEnrollmentMutation = useCreateEnrollment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim() || !studentEmail.trim()) {
      return;
    }

    try {
      await createEnrollmentMutation.mutateAsync({
        course_id: courseId,
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        student_phone: studentPhone.trim() || undefined,
      });

      // Reset form
      setStudentName("");
      setStudentEmail("");
      setStudentPhone("");
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
              disabled={createEnrollmentMutation.isPending || !studentName.trim() || !studentEmail.trim()}
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
