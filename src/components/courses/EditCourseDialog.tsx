
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
import { Course, useUpdateCourse } from "@/hooks/useCourses";
import { useJobPositions } from "@/hooks/useJobPositions";
import { useCoursePositionAccess, useManageCourseAccess } from "@/hooks/useCourseAccess";

interface EditCourseDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditCourseDialog = ({ course, open, onOpenChange }: EditCourseDialogProps) => {
  const updateCourseMutation = useUpdateCourse();
  const { updateAccess } = useManageCourseAccess();
  const { data: jobPositions = [] } = useJobPositions();
  const { data: courseAccess = [] } = useCoursePositionAccess(course?.id || '');
  
  const [formData, setFormData] = useState<Course | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  useEffect(() => {
    if (course) {
      setFormData({ ...course });
    }
  }, [course]);

  useEffect(() => {
    if (courseAccess.length > 0) {
      setSelectedPositions(courseAccess.map(access => access.position_code));
    } else {
      setSelectedPositions([]);
    }
  }, [courseAccess]);

  if (!formData) return null;

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    try {
      // Atualizar o curso
      await updateCourseMutation.mutateAsync(formData);
      
      // Atualizar as permissões de acesso
      if (course?.id) {
        await updateAccess.mutateAsync({
          courseId: course.id,
          positionCodes: selectedPositions
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
    }
  };

  const handlePositionChange = (positionCode: string, checked: boolean) => {
    if (checked) {
      setSelectedPositions(prev => [...prev, positionCode]);
    } else {
      setSelectedPositions(prev => prev.filter(code => code !== positionCode));
    }
  };

  const handlePublicTargetChange = (newTarget: string) => {
    setFormData({ ...formData, public_target: newTarget });
    // Reset selected positions when changing public target
    setSelectedPositions([]);
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
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      checked={(formData.theme || []).includes(theme)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, theme: [...(formData.theme || []), theme] });
                        } else {
                          setFormData({ ...formData, theme: (formData.theme || []).filter(t => t !== theme) });
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
                onChange={(e) => handlePublicTargetChange(e.target.value)}
                className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="franqueado">Franqueado</option>
                <option value="colaborador">Colaborador</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
          </div>

          {/* Seleção de Cargos Específicos */}
          {(formData.public_target === 'franqueado' || formData.public_target === 'ambos') && (
            <div className="grid gap-2">
              <Label>Cargos de Franqueado com Acesso</Label>
              <div className="border rounded-md p-3 space-y-2">
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
          )}

          {(formData.public_target === 'colaborador' || formData.public_target === 'ambos') && (
            <div className="grid gap-2">
              <Label>Cargos de Colaborador com Acesso</Label>
              <div className="border rounded-md p-3 space-y-2">
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
          )}

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
            disabled={updateCourseMutation.isPending || updateAccess.isPending || !formData.name.trim()}
          >
            <Save className="w-4 h-4" />
            {(updateCourseMutation.isPending || updateAccess.isPending) ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;
