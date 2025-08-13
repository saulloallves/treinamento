import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCourses } from "@/hooks/useCourses";
import { useCreateEnrollment } from "@/hooks/useEnrollments";

interface CreateManualEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateManualEnrollmentDialog = ({ open, onOpenChange }: CreateManualEnrollmentDialogProps) => {
  const { data: courses = [], isLoading } = useCourses();
  const [courseId, setCourseId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [unitCode, setUnitCode] = useState("");

  const createEnrollment = useCreateEnrollment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !studentName.trim() || !studentEmail.trim() || !unitCode.trim()) return;

    try {
      await createEnrollment.mutateAsync({
        course_id: courseId,
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        student_phone: studentPhone.trim() || undefined,
        unit_code: unitCode.trim(),
      });

      // Reset
      setCourseId("");
      setStudentName("");
      setStudentEmail("");
      setStudentPhone("");
      setUnitCode("");
      onOpenChange(false);
    } catch (err) {
      console.error("create enrollment error", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-blue" />
            Nova Inscrição
          </DialogTitle>
          <p className="text-sm text-brand-gray-dark">Crie manualmente uma inscrição para um curso.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Curso *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="h-10 w-full px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              disabled={isLoading}
              required
            >
              <option value="">{isLoading ? "Carregando cursos..." : "Selecione um curso"}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Nome do Aluno *</label>
            <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Digite o nome completo" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Email *</label>
            <Input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="email@exemplo.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Telefone</label>
            <Input value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Código da Unidade *</label>
            <Input value={unitCode} onChange={(e) => setUnitCode(e.target.value)} placeholder="Ex: 1728" required />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="btn-primary flex-1" disabled={createEnrollment.isPending || !courseId || !studentName.trim() || !studentEmail.trim() || !unitCode.trim()}>
              {createEnrollment.isPending ? "Criando..." : "Criar Inscrição"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateManualEnrollmentDialog;
