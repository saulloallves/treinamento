import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuiz } from "@/hooks/useQuiz";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import CreateQuizDialog from "./CreateQuizDialog";
import EditQuizDialog from "./EditQuizDialog";

interface EditFullQuizDialogProps {
  quiz: {
    name: string;
    questions: any[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmaId?: string;
  turmaName?: string;
  courseName?: string;
  lessonTitle?: string;
}

const EditFullQuizDialog = ({ 
  quiz, 
  open, 
  onOpenChange, 
  turmaId,
  turmaName,
  courseName,
  lessonTitle
}: EditFullQuizDialogProps) => {
  const { toast } = useToast();
  const { updateQuestion, deleteQuestion } = useQuiz();
  
  const [quizName, setQuizName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  useEffect(() => {
    if (quiz) {
      setQuizName(quiz.name);
    }
  }, [quiz]);

  const handleUpdateQuizName = async () => {
    if (!quizName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do quiz é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!quiz) return;

    try {
      // Atualizar todas as perguntas do quiz com o novo nome
      const updatePromises = quiz.questions.map(question => 
        updateQuestion.mutateAsync({
          id: question.id,
          quiz_name: quizName.trim(),
          course_id: question.course_id,
          lesson_id: question.lesson_id,
          question: question.question,
          question_type: question.question_type,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          correct_answer: question.correct_answer,
          order_index: question.order_index,
          turma_id: question.turma_id,
        })
      );

      await Promise.all(updatePromises);

      toast({
        title: "Nome do quiz atualizado",
        description: "O nome do quiz foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar o nome do quiz.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestion.mutateAsync(questionId);
      toast({
        title: "Pergunta excluída",
        description: "A pergunta foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir pergunta.",
        variant: "destructive",
      });
    }
  };

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    if (!quiz) return;
    
    const currentIndex = quiz.questions.findIndex(q => q.id === questionId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= quiz.questions.length) return;

    try {
      const currentQuestion = quiz.questions[currentIndex];
      const targetQuestion = quiz.questions[newIndex];

      // Swap order_index values
      await Promise.all([
        updateQuestion.mutateAsync({
          id: currentQuestion.id,
          order_index: targetQuestion.order_index,
          quiz_name: currentQuestion.quiz_name,
          course_id: currentQuestion.course_id,
          lesson_id: currentQuestion.lesson_id,
          question: currentQuestion.question,
          question_type: currentQuestion.question_type,
          option_a: currentQuestion.option_a,
          option_b: currentQuestion.option_b,
          option_c: currentQuestion.option_c,
          option_d: currentQuestion.option_d,
          correct_answer: currentQuestion.correct_answer,
          turma_id: currentQuestion.turma_id,
        }),
        updateQuestion.mutateAsync({
          id: targetQuestion.id,
          order_index: currentQuestion.order_index,
          quiz_name: targetQuestion.quiz_name,
          course_id: targetQuestion.course_id,
          lesson_id: targetQuestion.lesson_id,
          question: targetQuestion.question,
          question_type: targetQuestion.question_type,
          option_a: targetQuestion.option_a,
          option_b: targetQuestion.option_b,
          option_c: targetQuestion.option_c,
          option_d: targetQuestion.option_d,
          correct_answer: targetQuestion.correct_answer,
          turma_id: targetQuestion.turma_id,
        })
      ]);

      toast({
        title: "Ordem alterada",
        description: "A ordem das perguntas foi alterada.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar a ordem das perguntas.",
        variant: "destructive",
      });
    }
  };

  if (!quiz) return null;

  const firstQuestion = quiz.questions[0];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Quiz Completo</DialogTitle>
            <DialogDescription>
              Gerencie o nome do quiz, edite perguntas existentes e adicione novas perguntas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Quiz Name Section */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Nome do Quiz</h3>
                    <Badge variant="outline">
                      {quiz.questions.length} pergunta{quiz.questions.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={quizName}
                        onChange={(e) => setQuizName(e.target.value)}
                        placeholder="Nome do quiz"
                      />
                    </div>
                    <Button 
                      onClick={handleUpdateQuizName}
                      disabled={updateQuestion.isPending || quizName === quiz.name}
                    >
                      {updateQuestion.isPending ? "Salvando..." : "Salvar Nome"}
                    </Button>
                  </div>

                  {turmaName && courseName && lessonTitle && (
                    <div className="text-sm text-muted-foreground">
                      {turmaName} • {courseName} • {lessonTitle}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Add Question Section */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Perguntas</h3>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Pergunta
              </Button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {quiz.questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma pergunta criada ainda</p>
                  <p className="text-sm">Clique em "Adicionar Pergunta" para começar</p>
                </div>
              ) : (
                quiz.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Pergunta {index + 1}
                            </span>
                            <Badge variant={question.question_type === 'essay' ? 'default' : 'secondary'}>
                              {question.question_type === 'essay' ? 'Dissertativa' : 'Múltipla Escolha'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {/* Move buttons */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveQuestion(question.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveQuestion(question.id, 'down')}
                              disabled={index === quiz.questions.length - 1}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            
                            {/* Edit button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingQuestion(question)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            {/* Delete button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium">{question.question}</p>
                          
                          {question.question_type === 'multiple_choice' && (
                            <div className="mt-2 space-y-1">
                              {question.option_a && (
                                <div className={`text-sm ${question.correct_answer === 'A' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                  A) {question.option_a}
                                </div>
                              )}
                              {question.option_b && (
                                <div className={`text-sm ${question.correct_answer === 'B' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                  B) {question.option_b}
                                </div>
                              )}
                              {question.option_c && (
                                <div className={`text-sm ${question.correct_answer === 'C' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                  C) {question.option_c}
                                </div>
                              )}
                              {question.option_d && (
                                <div className={`text-sm ${question.correct_answer === 'D' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                  D) {question.option_d}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Question Dialog */}
      {firstQuestion && (
        <CreateQuizDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          preselectedCourseId={firstQuestion.course_id}
          preselectedLessonId={firstQuestion.lesson_id}
          preselectedTurmaId={turmaId}
          turmaName={turmaName}
          courseName={courseName}
          lessonTitle={lessonTitle}
          defaultQuizName={quiz?.name}
        />
      )}

      {/* Edit Question Dialog */}
      <EditQuizDialog
        question={editingQuestion}
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      />
    </>
  );
};

export default EditFullQuizDialog;