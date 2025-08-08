
import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
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
import { useCreateCourse, CourseInput } from "@/hooks/useCourses";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCourseDialog = ({ open, onOpenChange }: CreateCourseDialogProps) => {
  const createCourseMutation = useCreateCourse();
  
  const [formData, setFormData] = useState<CourseInput>({
    name: "",
    description: "",
    theme: "Segurança",
    public_target: "ambos",
    mandatory: false,
    has_quiz: false,
    generates_certificate: false,
    status: "Ativo"
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    await createCourseMutation.mutateAsync(formData);
    
    // Reset form
    setFormData({
      name: "",
      description: "",
      theme: "Segurança",
      public_target: "ambos",
      mandatory: false,
      has_quiz: false,
      generates_certificate: false,
      status: "Ativo"
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Novo Curso
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do novo curso
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Curso *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome do curso"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Digite a descrição do curso"
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
                value={formData.public_target}
                onChange={(e) => setFormData({ ...formData, public_target: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="franqueado">Franqueado</option>
                <option value="colaborador">Colaborador</option>
                <option value="ambos">Ambos</option>
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
                checked={formData.has_quiz}
                onChange={(e) => setFormData({ ...formData, has_quiz: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="hasQuiz" className="text-sm">Tem Quiz</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="generatesCertificate"
                checked={formData.generates_certificate}
                onChange={(e) => setFormData({ ...formData, generates_certificate: e.target.checked })}
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
          <Button 
            onClick={handleSave}
            disabled={createCourseMutation.isPending || !formData.name.trim()}
          >
            <Save className="w-4 h-4" />
            {createCourseMutation.isPending ? "Criando..." : "Criar Curso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
