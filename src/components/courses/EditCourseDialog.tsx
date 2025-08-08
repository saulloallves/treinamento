
import { useState, useEffect } from "react";
import { Edit, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Course {
  id: number;
  name: string;
  description: string;
  theme: string;
  publicTarget: string;
  mandatory: boolean;
  hasQuiz: boolean;
  generatesCertificate: boolean;
  studentsCount: number;
  lessonsCount: number;
  status: string;
}

interface EditCourseDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (course: Course) => void;
}

const EditCourseDialog = ({ course, open, onOpenChange, onSave }: EditCourseDialogProps) => {
  const [formData, setFormData] = useState<Course | null>(null);

  useEffect(() => {
    if (course) {
      setFormData({ ...course });
    }
  }, [course]);

  if (!formData) return null;

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Curso
          </DialogTitle>
          <DialogDescription>
            Edite as informações do curso abaixo
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Curso</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="theme">Tema</Label>
              <select
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Segurança">Segurança</option>
                <option value="Vendas">Vendas</option>
                <option value="Gestão">Gestão</option>
                <option value="Atendimento">Atendimento</option>
                <option value="Qualidade">Qualidade</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="publicTarget">Público-alvo</Label>
              <select
                id="publicTarget"
                value={formData.publicTarget}
                onChange={(e) => setFormData({ ...formData, publicTarget: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="franqueado">Franqueado</option>
                <option value="colaborador">Colaborador</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lessonsCount">Número de Aulas</Label>
              <Input
                id="lessonsCount"
                type="number"
                value={formData.lessonsCount}
                onChange={(e) => setFormData({ ...formData, lessonsCount: parseInt(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Ativo">Ativo</option>
                <option value="Em revisão">Em revisão</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mandatory"
                checked={formData.mandatory}
                onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="mandatory" className="text-sm">Obrigatório</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasQuiz"
                checked={formData.hasQuiz}
                onChange={(e) => setFormData({ ...formData, hasQuiz: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="hasQuiz" className="text-sm">Tem Quiz</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="generatesCertificate"
                checked={formData.generatesCertificate}
                onChange={(e) => setFormData({ ...formData, generatesCertificate: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="generatesCertificate" className="text-sm">Gera Certificado</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;
