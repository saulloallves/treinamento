import { useState } from "react";
import { ArrowLeft, Plus, BookOpen, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLessonsByCourse } from "@/hooks/useLessonsByCourse";
import { useQuiz } from "@/hooks/useQuiz";
import { Turma } from "@/hooks/useTurmas";
import CreateQuizDialog from "./CreateQuizDialog";
import CreateMultipleQuestionsDialog from "./CreateMultipleQuestionsDialog";
import EditQuizDialog from "./EditQuizDialog";
import DuplicateQuizDialog from "./DuplicateQuizDialog";

interface LessonQuizManagerProps {
  turma: Turma & {
    course?: {
      id: string;
      name: string;
    };
  };
  onBack: () => void;
}

const LessonQuizManager = ({ turma, onBack }: LessonQuizManagerProps) => {
  const { toast } = useToast();
  const { data: lessons = [] } = useLessonsByCourse(turma.course_id);
  const { data: quizQuestions = [], deleteQuestion } = useQuiz({ turmaId: turma.id });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateMultipleDialogOpen, setIsCreateMultipleDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [duplicatingQuiz, setDuplicatingQuiz] = useState<{ questions: any[], quizName: string } | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Filter quizzes for this turma (they're already filtered by the hook)
  const turmaQuizzes = quizQuestions;

  // Group quizzes by lesson
  const lessonQuizzes = lessons.map(lesson => {
    const lessonQuestions = turmaQuizzes.filter(q => q.lesson_id === lesson.id);
    const quizGroups = lessonQuestions.reduce((acc: any, question: any) => {
      const quizName = question.quiz_name || "Quiz sem nome";
      if (!acc[quizName]) {
        acc[quizName] = [];
      }
      acc[quizName].push(question);
      return acc;
    }, {});

    return {
      ...lesson,
      quizzes: Object.entries(quizGroups).map(([name, questions]) => ({
        name,
        questions: questions as any[]
      }))
    };
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion.mutateAsync(id);
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

  const handleCreateQuiz = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setIsCreateDialogOpen(true);
  };

  const handleCreateMultipleQuiz = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setIsCreateMultipleDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Quizzes da Turma</h2>
          <p className="text-muted-foreground">
            {turma.name || `Turma ${turma.code}`} - {turma.course?.name}
          </p>
        </div>
      </div>

      {/* Lessons with Quizzes */}
      <div className="space-y-6">
        {lessonQuizzes.map((lesson) => (
          <Card key={lesson.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {lesson.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lesson.quizzes.length} quiz{lesson.quizzes.length !== 1 ? 'zes' : ''} criado{lesson.quizzes.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateQuiz(lesson.id)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Pergunta
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCreateMultipleQuiz(lesson.id)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Quiz Completo
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {lesson.quizzes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum quiz criado para esta aula</p>
                  <p className="text-sm">Clique em "Nova Pergunta" ou "Quiz Completo" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lesson.quizzes.map((quiz) => (
                    <Card key={quiz.name} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{quiz.name}</h4>
                            <Badge variant="outline" className="mt-1">
                              {quiz.questions.length} pergunta{quiz.questions.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDuplicatingQuiz({ questions: quiz.questions, quizName: quiz.name })}
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicar
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          {quiz.questions.map((question: any, index: number) => (
                            <div key={question.id} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Pergunta {index + 1}
                                  </span>
                                  <Badge variant={question.question_type === 'essay' ? 'default' : 'secondary'} className="text-xs">
                                    {question.question_type === 'essay' ? 'Dissertativa' : 'Múltipla Escolha'}
                                  </Badge>
                                </div>
                                <p className="text-sm">{question.question}</p>
                              </div>
                              <div className="flex gap-1 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingQuestion(question)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(question.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Nenhuma aula encontrada para este curso</p>
          <p className="text-sm">Crie aulas primeiro para poder adicionar quizzes</p>
        </div>
      )}

      {/* Dialogs */}
      <CreateQuizDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        preselectedCourseId={turma.course_id}
        preselectedLessonId={selectedLessonId || undefined}
        preselectedTurmaId={turma.id}
      />

      <CreateMultipleQuestionsDialog
        open={isCreateMultipleDialogOpen}
        onOpenChange={setIsCreateMultipleDialogOpen}
        preselectedCourseId={turma.course_id}
        preselectedLessonId={selectedLessonId || undefined}
        preselectedTurmaId={turma.id}
      />

      <EditQuizDialog
        question={editingQuestion}
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      />

      {duplicatingQuiz && (
        <DuplicateQuizDialog
          questions={duplicatingQuiz.questions}
          quizName={duplicatingQuiz.quizName}
          open={!!duplicatingQuiz}
          onOpenChange={(open) => !open && setDuplicatingQuiz(null)}
        />
      )}
    </div>
  );
};

export default LessonQuizManager;