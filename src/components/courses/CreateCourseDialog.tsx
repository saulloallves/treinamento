
import { useState } from "react";
import { Plus, Save, X, Users, BookOpen, Settings, Shield } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const themes = [
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
  ];

  const franchiseePositions = jobPositions.filter(position => position.category === 'franqueado');
  const collaboratorPositions = jobPositions.filter(position => position.category === 'colaborador');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Novo Curso
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do novo curso organizadas por seções
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Acesso
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="instructor">Instrutor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor || ""}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Nome do instrutor (opcional)"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição do curso"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo de Curso</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'ao_vivo' | 'gravado' })}
                    className="h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="ao_vivo">Curso (Ao Vivo)</option>
                    <option value="gravado">Treinamento (Online)</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status || "Ativo"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                    <option value="Pronto para virar treinamento">Pronto para virar treinamento</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="text-base font-medium">Temas do Curso</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione os temas abordados no curso
                  </p>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-3">
                      {themes.map((theme) => (
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
                            className="rounded border-input"
                          />
                          <Label htmlFor={theme} className="text-sm leading-tight">{theme}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Configurações Adicionais</Label>
                  <div className="grid grid-cols-2 gap-6 mt-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="hasQuiz"
                        checked={formData.has_quiz}
                        onChange={(e) => setFormData({ ...formData, has_quiz: e.target.checked })}
                        className="rounded border-input"
                      />
                      <div>
                        <Label htmlFor="hasQuiz" className="font-medium">Tem Quiz</Label>
                        <p className="text-xs text-muted-foreground">Incluir avaliações no curso</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="generatesCertificate"
                        checked={formData.generates_certificate}
                        onChange={(e) => setFormData({ ...formData, generates_certificate: e.target.checked })}
                        className="rounded border-input"
                      />
                      <div>
                        <Label htmlFor="generatesCertificate" className="font-medium">Gera Certificado</Label>
                        <p className="text-xs text-muted-foreground">Emitir certificado ao concluir</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5" />
                  <Label className="text-base font-medium">Controle de Acesso</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os cargos que terão acesso a este curso. Se nenhum cargo for selecionado, todos os usuários terão acesso.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Cargos de Franqueado */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-primary">
                        Cargos de Franqueado
                      </CardTitle>
                      <CardDescription>
                        {franchiseePositions.filter(p => selectedPositions.includes(p.code)).length} de {franchiseePositions.length} selecionados
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-40 overflow-y-auto">
                      {franchiseePositions.map(position => (
                        <div key={position.code} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`pos-${position.code}`}
                            checked={selectedPositions.includes(position.code)}
                            onChange={(e) => handlePositionChange(position.code, e.target.checked)}
                            className="rounded border-input"
                          />
                          <Label htmlFor={`pos-${position.code}`} className="text-sm font-medium">
                            {position.name}
                          </Label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Cargos de Colaborador */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-secondary">
                        Cargos de Colaborador
                      </CardTitle>
                      <CardDescription>
                        {collaboratorPositions.filter(p => selectedPositions.includes(p.code)).length} de {collaboratorPositions.length} selecionados
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-40 overflow-y-auto">
                      {collaboratorPositions.map(position => (
                        <div key={position.code} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`pos-${position.code}`}
                            checked={selectedPositions.includes(position.code)}
                            onChange={(e) => handlePositionChange(position.code, e.target.checked)}
                            className="rounded border-input"
                          />
                          <Label htmlFor={`pos-${position.code}`} className="text-sm font-medium">
                            {position.name}
                          </Label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {selectedPositions.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Cargos selecionados:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPositions.map(code => {
                        const position = jobPositions.find(p => p.code === code);
                        return position ? (
                          <Badge key={code} variant="secondary" className="text-xs">
                            {position.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
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
