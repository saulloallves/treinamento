
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
    theme: ["Estrutura de Loja"],
    public_target: "ambos",
    mandatory: false,
    has_quiz: false,
    generates_certificate: false,
    tipo: "ao_vivo",
    instructor: "",
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
      theme: ["Estrutura de Loja"],
      public_target: "ambos",
      mandatory: false,
      has_quiz: false,
      generates_certificate: false,
      tipo: "ao_vivo",
      instructor: "",
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

          <div className="grid gap-2">
            <Label htmlFor="instructor">Nome do Instrutor (Opcional)</Label>
            <Input
              id="instructor"
              value={formData.instructor || ""}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              placeholder="Digite o nome do instrutor"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="theme">Temas</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Estrutura de Loja",
                  "Redes Sociais", 
                  "Tráfego Pago",
                  "Bastidores",
                  "Eventos",
                  "Conceitos sobre o Sistema",
                  "Funcionalidades do Sistema",
                  "Captação",
                  "Conceito da Avaliação",
                  "Organização de Loja",
                  "Equipes e Colaboradores",
                  "Itens e Produtos",
                  "Orientações Gerais",
                  "Inauguração",
                  "Operação de Loja Modelo"
                ].map((theme) => (
                  <div key={theme} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={theme}
                      checked={formData.theme.includes(theme)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, theme: [...formData.theme, theme] });
                        } else {
                          setFormData({ ...formData, theme: formData.theme.filter(t => t !== theme) });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={theme} className="text-sm">{theme}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Curso</Label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'ao_vivo' | 'gravado' })}
                className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="ao_vivo">Curso (Ao Vivo)</option>
                <option value="gravado">Treinamento (Online)</option>
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
