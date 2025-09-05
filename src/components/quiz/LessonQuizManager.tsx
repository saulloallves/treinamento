import { useState } from "react";
import { ArrowLeft, Plus, BookOpen, Edit, Trash2, Copy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLessonsByCourse, LessonByCourse } from "@/hooks/useLessonsByCourse";
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
  const [selectedLesson, setSelectedLesson] = useState<LessonByCourse | null>(null);

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

  const handleSelectLesson = (lesson: LessonByCourse) => {
    setSelectedLesson(lesson);
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
  };

  // If a lesson is selected, show detailed view
  if (selectedLesson) {
    const lessonWithQuizzes = lessonQuizzes.find(l => l.id === selectedLesson.id);
    
    return (
      <div className="space-y-6">
        {/* Header for lesson detail view */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBackToLessons}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar às Aulas
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
            <p className="text-muted-foreground">
              {turma.name || `Turma ${turma.code}`} - {turma.course?.name}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleCreateQuiz(selectedLesson.id)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Pergunta
          </Button>
          <Button
            onClick={() => handleCreateMultipleQuiz(selectedLesson.id)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Quiz Completo
          </Button>
        </div>

        {/* Quizzes for selected lesson */}
        <div>
          {!lessonWithQuizzes || lessonWithQuizzes.quizzes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum quiz criado para esta aula</p>
              <p className="text-sm">Clique em "Nova Pergunta" ou "Quiz Completo" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessonWithQuizzes.quizzes.map((quiz) => (
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
        </div>

        {/* Dialogs - same as before */}
        <CreateQuizDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          preselectedCourseId={turma.course_id}
          preselectedLessonId={selectedLessonId || undefined}
          preselectedTurmaId={turma.id}
          turmaName={turma.name || `Turma ${turma.code}`}
          courseName={turma.course?.name}
          lessonTitle={lessons?.find(lesson => lesson.id === selectedLessonId)?.title}
        />

        <CreateMultipleQuestionsDialog
          open={isCreateMultipleDialogOpen}
          onOpenChange={setIsCreateMultipleDialogOpen}
          preselectedCourseId={turma.course_id}
          preselectedLessonId={selectedLessonId || undefined}
          preselectedTurmaId={turma.id}
          turmaName={turma.name || `Turma ${turma.code}`}
          courseName={turma.course?.name}
          lessonTitle={lessons?.find(lesson => lesson.id === selectedLessonId)?.title}
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
  }

  // Default view: Grid of lessons
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

      {/* Grid of Lessons */}
      {lessons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Nenhuma aula encontrada para este curso</p>
          <p className="text-sm">Crie aulas primeiro para poder adicionar quizzes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessonQuizzes.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {lesson.title}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={lesson.quizzes.length > 0 ? "default" : "secondary"}>
                        {lesson.quizzes.length} quiz{lesson.quizzes.length !== 1 ? 'zes' : ''}
                      </Badge>
                      {lesson.quizzes.length > 0 && (
                        <Badge variant="outline">
                          {lesson.quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)} pergunta{lesson.quizzes.reduce((total, quiz) => total + quiz.questions.length, 0) !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {lesson.quizzes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum quiz criado ainda
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {lesson.quizzes.slice(0, 2).map((quiz) => (
                        <div key={quiz.name} className="text-sm text-muted-foreground">
                          • {quiz.name} ({quiz.questions.length} pergunta{quiz.questions.length !== 1 ? 's' : ''})
                        </div>
                      ))}
                      {lesson.quizzes.length > 2 && (
                        <div className="text-sm text-muted-foreground">
                          ... e mais {lesson.quizzes.length - 2} quiz{lesson.quizzes.length - 2 !== 1 ? 'zes' : ''}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleSelectLesson(lesson)}
                    className="w-full mt-4"
                    variant={lesson.quizzes.length > 0 ? "default" : "outline"}
                  >
                    {lesson.quizzes.length > 0 ? "Gerenciar Quizzes" : "Criar Primeiro Quiz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonQuizManager;