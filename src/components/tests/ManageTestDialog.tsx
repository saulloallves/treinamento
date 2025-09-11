import { useState, useEffect } from "react";
import { Edit, Plus, Image, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTests } from "@/hooks/useTests";
import { useTestQuestions } from "@/hooks/useTestQuestions";

interface ManageTestDialogProps {
  testId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageTestDialog = ({ testId, open, onOpenChange }: ManageTestDialogProps) => {
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTest, setEditedTest] = useState<any>(null);

  const { data: tests, updateTest } = useTests();
  const { data: questions, createQuestion, updateQuestion, deleteQuestion } = useTestQuestions(testId);

  const test = tests?.find(t => t.id === testId);

  useEffect(() => {
    if (test && open) {
      setEditedTest({ ...test });
      setIsEditing(false);
      setActiveTab("info");
    }
  }, [test, open]);

  const handleSaveTest = async () => {
    if (!testId || !editedTest) return;

    try {
      await updateTest({ id: testId, ...editedTest });
      toast.success("Teste atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao atualizar teste");
    }
  };

  const handleAddQuestion = async () => {
    if (!testId) return;

    try {
      await createQuestion({
        test_id: testId,
        question_text: "Nova pergunta",
        question_order: (questions?.length || 0) + 1,
        image_urls: [],
        options: [
          { option_text: "Resposta errada", score_value: 0, option_order: 1 },
          { option_text: "Resposta mediana", score_value: 1, option_order: 2 },
          { option_text: "Resposta correta", score_value: 2, option_order: 3 }
        ]
      });
      toast.success("Pergunta adicionada!");
    } catch (error) {
      toast.error("Erro ao adicionar pergunta");
    }
  };

  if (!test) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {test.name}
          </DialogTitle>
          <DialogDescription>
            Gerencie as configurações e perguntas do teste
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="questions">
              Perguntas ({questions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="preview">Visualizar</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Configurações do Teste</CardTitle>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSaveTest}>
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Teste</Label>
                    {isEditing ? (
                      <Input
                        value={editedTest?.name || ""}
                        onChange={(e) => setEditedTest(prev => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm font-medium">{test.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                      {test.status === 'active' ? 'Ativo' : 'Rascunho'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedTest?.description || ""}
                      onChange={(e) => setEditedTest(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {test.description || "Sem descrição"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Taxa de Aprovação</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={editedTest?.passing_percentage || 70}
                        onChange={(e) => setEditedTest(prev => ({ 
                          ...prev, 
                          passing_percentage: parseInt(e.target.value) 
                        }))}
                      />
                    ) : (
                      <p className="text-sm font-medium">{test.passing_percentage}%</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Máx. Tentativas</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={editedTest?.max_attempts || 1}
                        onChange={(e) => setEditedTest(prev => ({ 
                          ...prev, 
                          max_attempts: parseInt(e.target.value) 
                        }))}
                      />
                    ) : (
                      <p className="text-sm font-medium">{test.max_attempts}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tempo Limite</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="5"
                        max="180"
                        value={editedTest?.time_limit_minutes || ""}
                        onChange={(e) => setEditedTest(prev => ({ 
                          ...prev, 
                          time_limit_minutes: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        placeholder="Em minutos"
                      />
                    ) : (
                      <p className="text-sm font-medium">
                        {test.time_limit_minutes ? `${test.time_limit_minutes} min` : "Sem limite"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Perguntas do Teste</h3>
              <Button onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Pergunta
              </Button>
            </div>

            <div className="space-y-4">
              {questions?.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        Pergunta {index + 1}
                      </CardTitle>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Texto da Pergunta</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => {/* Handle update */}}
                        rows={2}
                      />
                    </div>

                    {question.image_urls && question.image_urls.length > 0 && (
                      <div className="space-y-2">
                        <Label>Imagens</Label>
                        <div className="flex gap-2">
                          {question.image_urls.map((url, imgIndex) => (
                            <div key={imgIndex} className="relative">
                              <img 
                                src={url} 
                                alt={`Imagem ${imgIndex + 1}`}
                                className="w-20 h-20 object-cover rounded border"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Alternativas</Label>
                      <div className="space-y-2">
                        {/* Render options here */}
                        <div className="text-sm text-muted-foreground">
                          {question.options?.length || 3} alternativas configuradas
                        </div>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Image className="h-4 w-4 mr-1" />
                        Adicionar Imagem
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!questions || questions.length === 0) && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma pergunta adicionada</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Comece adicionando a primeira pergunta do teste
                    </p>
                    <Button onClick={handleAddQuestion}>
                      Adicionar Primeira Pergunta
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Visualização do Teste</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Como o teste aparecerá para os alunos
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">{test.name}</h2>
                    {test.description && (
                      <p className="text-muted-foreground">{test.description}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Instruções</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Taxa mínima para aprovação: {test.passing_percentage}%</li>
                      <li>• Máximo de tentativas: {test.max_attempts}</li>
                      {test.time_limit_minutes && (
                        <li>• Tempo limite: {test.time_limit_minutes} minutos</li>
                      )}
                      <li>• Sistema de pontuação: 0, 1 ou 2 pontos por questão</li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <Button disabled>
                      Iniciar Teste ({questions?.length || 0} questões)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};