import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudentTurmaQuiz } from "@/hooks/useStudentTurmaQuiz";
import { useState } from "react";
import LessonQuiz from "@/components/quiz/LessonQuiz";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { BookOpen, ArrowLeft } from "lucide-react";

interface StudentTurmaQuizListProps {
  turmaId?: string;
}

const StudentTurmaQuizList = ({ turmaId }: StudentTurmaQuizListProps) => {
  const { data: quizzes = [], isLoading, error } = useStudentTurmaQuiz(turmaId);
  const [selectedQuiz, setSelectedQuiz] = useState<{ 
    lessonId: string; 
    courseId: string; 
    lessonTitle: string; 
    turmaId?: string 
  } | null>(null);

  // Group quizzes by lesson
  const quizzesByLesson = quizzes.reduce((acc, quiz) => {
    const lessonId = quiz.lesson_id;
    if (!lessonId) return acc;
    
    if (!acc[lessonId]) {
      acc[lessonId] = {
        lessonTitle: quiz.lessons?.title || 'Aula sem título',
        courseId: quiz.course_id,
        courseName: quiz.courses?.name || 'Curso sem nome',
        turmaId: quiz.turma_id,
        quizzes: []
      };
    }
    acc[lessonId].quizzes.push(quiz);
    return acc;
  }, {} as Record<string, { 
    lessonTitle: string; 
    courseId: string; 
    courseName: string; 
    turmaId?: string; 
    quizzes: any[] 
  }>);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar quizzes.</p>
      </div>
    );
  }

  if (Object.keys(quizzesByLesson).length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-6xl">📝</div>
        <div className="space-y-2">
          <p className="text-lg font-medium">Nenhum quiz disponível</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            Não há quizzes disponíveis para esta turma no momento.
          </p>
        </div>
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedQuiz(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para lista de quizzes
          </Button>
          <h3 className="text-lg font-semibold">{selectedQuiz.lessonTitle}</h3>
        </div>
        <LessonQuiz 
          lessonId={selectedQuiz.lessonId} 
          courseId={selectedQuiz.courseId} 
          turmaId={selectedQuiz.turmaId} 
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(quizzesByLesson).map(([lessonId, lessonData]) => (
        <Card key={lessonId} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{lessonData.lessonTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{lessonData.courseName}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Perguntas</span>
                <span className="font-medium">{lessonData.quizzes.length}</span>
              </div>
              <Button 
                className="w-full gap-2" 
                onClick={() => setSelectedQuiz({
                  lessonId,
                  courseId: lessonData.courseId,
                  lessonTitle: lessonData.lessonTitle,
                  turmaId: lessonData.turmaId
                })}
              >
                <BookOpen className="h-4 w-4" />
                Responder Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentTurmaQuizList;