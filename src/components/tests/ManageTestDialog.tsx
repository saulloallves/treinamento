import { useState, useEffect, useCallback, useRef } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTests } from "@/hooks/useTests";
import { useTestQuestions } from "@/hooks/useTestQuestions";

interface ManageTestDialogProps {
  testId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageTestDialog = ({ testId, open, onOpenChange }: ManageTestDialogProps) => {
  const [activeTab, setActiveTab] = useState("questions");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTest, setEditedTest] = useState<any>(null);
  const [questionTexts, setQuestionTexts] = useState<Record<string, string>>({});
  const [optionTexts, setOptionTexts] = useState<Record<string, string>>({});
  const debounceRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const { data: tests, updateTest } = useTests();
  const { data: questions, createQuestion, updateQuestion, deleteQuestion } = useTestQuestions(testId);

  const test = tests?.find(t => t.id === testId);

  useEffect(() => {
    if (test && open) {
      setEditedTest({ ...test });
      setIsEditing(false);
      setActiveTab("questions");
    }
  }, [test, open]);

  useEffect(() => {
    if (questions && open) {
      const initialTexts: Record<string, string> = {};
      const initialOptionTexts: Record<string, string> = {};
      
      questions.forEach(q => {
        initialTexts[q.id] = q.question_text;
        q.options?.forEach((opt, index) => {
          const optionKey = opt.id || `temp-${q.id}-${index}`;
          initialOptionTexts[optionKey] = opt.option_text;
        });
      });
      
      setQuestionTexts(initialTexts);
      setOptionTexts(initialOptionTexts);
    }
  }, [questions, open]);

  // Cleanup timeouts when dialog closes
  useEffect(() => {
    if (!open) {
      Object.values(debounceRefs.current).forEach(clearTimeout);
      debounceRefs.current = {};
    }
  }, [open]);

  const debouncedUpdateQuestion = useCallback((questionId: string, updates: any) => {
    if (debounceRefs.current[questionId]) {
      clearTimeout(debounceRefs.current[questionId]);
    }
    
    debounceRefs.current[questionId] = setTimeout(async () => {
      console.log('Updating question:', questionId, updates);
      try {
        await updateQuestion({ id: questionId, ...updates });
        console.log('Question updated successfully');
      } catch (error) {
        console.error('Error updating question:', error);
      }
    }, 1000); // Increased debounce time
  }, [updateQuestion]);

  const debouncedUpdateOption = useCallback((questionId: string, optionId: string, newText: string) => {
    const debounceKey = `${questionId}-${optionId}`;
    if (debounceRefs.current[debounceKey]) {
      clearTimeout(debounceRefs.current[debounceKey]);
    }
    
    debounceRefs.current[debounceKey] = setTimeout(async () => {
      const question = questions?.find(q => q.id === questionId);
      if (question) {
        const updatedOptions = question.options?.map(opt => 
          opt.id === optionId ? { ...opt, option_text: newText } : opt
        ) || [];
        
        console.log('Updating option:', { questionId, optionId, newText, updatedOptions });
        
        try {
          await updateQuestion({
            id: questionId,
            options: updatedOptions
          });
          console.log('Option updated successfully');
        } catch (error) {
          console.error('Error updating option:', error);
          // Revert local state on error
          setOptionTexts(prev => {
            const newState = { ...prev };
            delete newState[optionId];
            return newState;
          });
        }
      }
    }, 1000); // Increased debounce time
  }, [questions, updateQuestion]);

  const handleSaveTest = async () => {
    if (!testId || !editedTest) return;

    // Validar se teste pode ser ativado
    if (editedTest.status === 'active' && (!questions || questions.length === 0)) {
      toast.error("Não é possível ativar um teste sem perguntas!");
      return;
    }

    try {
      await updateTest({ id: testId, ...editedTest });
      toast.success(
        editedTest.status === 'active' 
          ? "Teste ativado com sucesso! Agora está disponível para os alunos." 
          : "Teste atualizado com sucesso!"
      );
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
        question_type: 'multiple_choice',
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
            Gerencie as perguntas e configurações do teste
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="questions">
              Perguntas ({questions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="info">Configurações</TabsTrigger>
            <TabsTrigger value="preview">Visualizar</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            {(!questions || questions.length === 0) ? (
              <div className="text-center py-12">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma pergunta cadastrada</h3>
                <p className="text-muted-foreground mb-6">
                  Adicione perguntas para que os alunos possam fazer este teste
                </p>
                <Button onClick={handleAddQuestion} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar Primeira Pergunta
                </Button>
              </div>
            ) : (
              <>
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
                          <Label>Tipo de Pergunta</Label>
                          <Select 
                            value={question.question_type} 
                            onValueChange={(value: 'multiple_choice' | 'essay') => {
                              updateQuestion({
                                id: question.id,
                                question_type: value,
                                max_score: value === 'essay' ? 10 : undefined
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                              <SelectItem value="essay">Dissertativa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Texto da Pergunta</Label>
                          <Textarea
                            value={questionTexts[question.id] || ""}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setQuestionTexts(prev => ({
                                ...prev,
                                [question.id]: newValue
                              }));
                            }}
                            rows={2}
                            placeholder="Digite o texto da pergunta..."
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

                        {question.question_type === 'multiple_choice' ? (
                          <div className="space-y-3">
                            <Label>Alternativas (Sistema de Pontuação)</Label>
                            <div className="space-y-3">
                              {question.options?.map((option, optionIndex) => {
                                const optionKey = option.id || `temp-${question.id}-${optionIndex}`;
                                return (
                                  <div key={optionKey} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <Label className="text-sm font-medium">
                                        Alternativa {String.fromCharCode(65 + optionIndex)} - 
                                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                          option.score_value === 0 ? 'bg-red-100 text-red-800' :
                                          option.score_value === 1 ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-green-100 text-green-800'
                                        }`}>
                                          {option.score_value === 0 ? 'Errada (0 pts)' :
                                           option.score_value === 1 ? 'Mediana (1 pt)' :
                                           'Correta (2 pts)'}
                                        </span>
                                      </Label>
                                    </div>
                                    <Input
                                      value={
                                        option.id 
                                          ? (optionTexts[option.id] ?? option.option_text ?? "")
                                          : (optionTexts[optionKey] ?? option.option_text ?? "")
                                      }
                                      onChange={(e) => {
                                        const newValue = e.target.value;
                                        const keyToUse = option.id || optionKey;
                                        
                                        setOptionTexts(prev => ({
                                          ...prev,
                                          [keyToUse]: newValue
                                        }));
                                      }}
                                      placeholder={`Digite a alternativa ${String.fromCharCode(65 + optionIndex).toLowerCase()}...`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Label>Configuração da Pergunta Dissertativa</Label>
                            <div className="border rounded-lg p-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Pontuação Máxima</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={question.max_score || 10}
                                  onChange={(e) => {
                                    updateQuestion({
                                      id: question.id,
                                      max_score: parseInt(e.target.value) || 10
                                    });
                                  }}
                                  placeholder="Ex: 10"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Esta pergunta será avaliada manualmente e pode receber até {question.max_score || 10} pontos.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <Separator />
                        
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Create a file input element
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.multiple = true;
                              input.onchange = (e) => {
                                const files = (e.target as HTMLInputElement).files;
                                if (files) {
                                  // Here you would upload the files and get URLs
                                  // For now, we'll just show a message
                                  toast.success(`${files.length} imagem(ns) selecionada(s) - funcionalidade de upload será implementada`);
                                }
                              };
                              input.click();
                            }}
                          >
                            <Image className="h-4 w-4 mr-1" />
                            Adicionar Imagem
                          </Button>
                          
                          <Button 
                            size="sm"
                            onClick={async () => {
                              try {
                                // Prepare question text
                                const currentText = questionTexts[question.id];
                                const updates: any = {};
                                
                                if (currentText && currentText !== question.question_text) {
                                  updates.question_text = currentText;
                                }
                                
                                // Prepare options if it's multiple choice
                                if (question.question_type === 'multiple_choice' && question.options) {
                                  const updatedOptions = question.options.map(opt => {
                                    const optionKey = opt.id || `temp-${question.id}-${question.options?.indexOf(opt)}`;
                                    const newText = optionTexts[optionKey];
                                    return { 
                                      ...opt, 
                                      option_text: newText !== undefined ? newText : opt.option_text 
                                    };
                                  });
                                  updates.options = updatedOptions;
                                }
                                
                                // Update question with all changes
                                await updateQuestion({
                                  id: question.id,
                                  ...updates
                                });
                                
                                toast.success("Pergunta salva com sucesso!");
                              } catch (error) {
                                console.error('Error saving question:', error);
                                toast.error("Erro ao salvar pergunta");
                              }
                            }}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Salvar Pergunta
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

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
                    {isEditing ? (
                      <Select 
                        value={editedTest?.status || 'draft'} 
                        onValueChange={(value) => setEditedTest(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                          {test.status === 'active' ? 'Ativo' : 
                           test.status === 'archived' ? 'Arquivado' : 'Rascunho'}
                        </Badge>
                        {test.status === 'draft' && (
                          <span className="text-xs text-muted-foreground">
                            (Não visível para alunos)
                          </span>
                        )}
                      </div>
                    )}
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