import { useState } from "react";
import { Plus, Edit, Trash2, Image, MoveUp, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTestQuestions, useDeleteQuestion } from "@/hooks/useTestQuestions";
import CreateQuestionDialog from "./CreateQuestionDialog";
import EditQuestionDialog from "./EditQuestionDialog";

interface TestQuestionsManagerProps {
  testId: string;
}

const TestQuestionsManager = ({ testId }: TestQuestionsManagerProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  const { data: questions, isLoading } = useTestQuestions(testId);
  const deleteQuestion = useDeleteQuestion();

  const handleDeleteClick = (questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      await deleteQuestion.mutateAsync({
        questionId: questionToDelete,
        testId,
      });
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const getScoreColor = (score: number) => {
    switch (score) {
      case 0:
        return 'bg-red-100 text-red-800 border-red-200';
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreText = (score: number) => {
    switch (score) {
      case 0:
        return 'Errada (0)';
      case 1:
        return 'Média (1)';
      case 2:
        return 'Melhor (2)';
      default:
        return `Pontos: ${score}`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Perguntas ({questions?.length || 0})
          </h3>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Pergunta
          </Button>
        </div>

        {questions && questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary">
                          Pergunta {index + 1}
                        </span>
                        {question.image_urls && question.image_urls.length > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Image className="w-3 h-3" />
                            {question.image_urls.length} imagem(ns)
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-foreground">
                        {question.question_text}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingQuestion(question.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-muted-foreground">
                      Opções de Resposta:
                    </h5>
                    <div className="space-y-2">
                      {question.test_question_options
                        ?.sort((a, b) => a.option_order - b.option_order)
                        .map((option, optionIndex) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center justify-center">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="text-sm">{option.option_text}</span>
                            </div>
                            <Badge variant="outline" className={getScoreColor(option.score_value)}>
                              {getScoreText(option.score_value)}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma pergunta criada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece adicionando a primeira pergunta do seu teste
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeira Pergunta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateQuestionDialog
        testId={testId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {editingQuestion && (
        <EditQuestionDialog
          testId={testId}
          questionId={editingQuestion}
          open={!!editingQuestion}
          onOpenChange={(open) => !open && setEditingQuestion(null)}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
              Todas as respostas relacionadas também serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteQuestion.isPending}
            >
              {deleteQuestion.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TestQuestionsManager;