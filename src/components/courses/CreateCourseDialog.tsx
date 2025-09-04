
import { useState } from "react";
import { Plus, Save, X, Users } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { useCreateCourse, CourseInput } from "@/hooks/useCourses";
import { useJobPositions } from "@/hooks/useJobPositions";
import { useManageCourseAccess } from "@/hooks/useCourseAccess";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCourseDialog = ({ open, onOpenChange }: CreateCourseDialogProps) => {
  const createCourseMutation = useCreateCourse();
  const { updateAccess } = useManageCourseAccess();
  
  // Buscar cargos disponíveis
  const { data: jobPositions = [] } = useJobPositions();
  
  const [formData, setFormData] = useState<CourseInput>({
    name: "",
    description: "",
    theme: ["Estrutura de Loja"],
    public_target: "ambos", // Default since access is controlled by job positions
    has_quiz: false,
    generates_certificate: false,
    tipo: "ao_vivo",
    instructor: "",
    status: "Ativo"
  });

  // Estado para controlar quais cargos têm acesso
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const handlePositionChange = (positionCode: string, checked: boolean) => {
    if (checked) {
      setSelectedPositions(prev => [...prev, positionCode]);
    } else {
      setSelectedPositions(prev => prev.filter(code => code !== positionCode));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    try {
      const course = await createCourseMutation.mutateAsync(formData);
      
      // Se há cargos específicos selecionados, configurar as permissões
      if (selectedPositions.length > 0 && course?.id) {
        await updateAccess.mutateAsync({
          courseId: course.id,
          positionCodes: selectedPositions
        });
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        theme: ["Estrutura de Loja"],
        public_target: "ambos",
        has_quiz: false,
        generates_certificate: false,
        tipo: "ao_vivo",
        instructor: "",
        status: "Ativo"
      });
      setSelectedPositions([]);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating course:', error);
    }
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

          {/* Seleção de Cargos com Acesso */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <Label className="text-sm font-medium">Cargos com Acesso (opcional)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Se nenhum cargo for selecionado, todos os usuários terão acesso. Selecione cargos específicos para restringir o acesso.
              </p>
              
              <div className="border rounded-md p-3 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-600">Cargos de Franqueado</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {jobPositions
                      .filter(position => position.category === 'franqueado')
                      .map(position => (
                        <div key={position.code} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`pos-${position.code}`}
                            checked={selectedPositions.includes(position.code)}
                            onChange={(e) => handlePositionChange(position.code, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`pos-${position.code}`} className="text-sm">
                            {position.name}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-600">Cargos de Colaborador</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {jobPositions
                      .filter(position => position.category === 'colaborador')
                      .map(position => (
                        <div key={position.code} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`pos-${position.code}`}
                            checked={selectedPositions.includes(position.code)}
                            onChange={(e) => handlePositionChange(position.code, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`pos-${position.code}`} className="text-sm">
                            {position.name}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
