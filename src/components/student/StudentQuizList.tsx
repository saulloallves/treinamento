import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/hooks/useQuiz";
import { useState } from "react";
import LessonQuiz from "@/components/quiz/LessonQuiz";

const StudentQuizList = () => {
  const { data: quizzes = [], isLoading } = useQuiz();
  const [selectedQuiz, setSelectedQuiz] = useState<{ lessonId: string; courseId: string; lessonTitle: string } | null>(null);

  // Agrupar quizzes por aula
  const quizzesByLesson = quizzes.reduce((acc, quiz) => {
    const lessonId = quiz.lesson_id;
    if (!lessonId) return acc;
    
    if (!acc[lessonId]) {
      acc[lessonId] = {
        lessonTitle: quiz.lessons?.title || 'Aula sem título',
        courseId: quiz.course_id,
        courseName: quiz.courses?.name || 'Curso sem nome',
        quizzes: []
      };
    }
    acc[lessonId].quizzes.push(quiz);
    return acc;
  }, {} as Record<string, { lessonTitle: string; courseId: string; courseName: string; quizzes: any[] }>);

  if (isLoading) {
    return <p>Carregando quizzes...</p>;
  }

  if (Object.keys(quizzesByLesson).length === 0) {
    return <p className="text-muted-foreground">Nenhum quiz disponível.</p>;
  }

  if (selectedQuiz) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedQuiz(null)}
          >
            ← Voltar para lista de quizzes
          </Button>
          <h3 className="text-lg font-semibold">{selectedQuiz.lessonTitle}</h3>
        </div>
        <LessonQuiz lessonId={selectedQuiz.lessonId} courseId={selectedQuiz.courseId} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(quizzesByLesson).map(([lessonId, lessonData]) => (
        <Card key={lessonId}>
          <CardHeader>
            <CardTitle className="text-lg">{lessonData.lessonTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{lessonData.courseName}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Perguntas</span>
                <span className="font-medium">{lessonData.quizzes.length}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => setSelectedQuiz({
                  lessonId,
                  courseId: lessonData.courseId,
                  lessonTitle: lessonData.lessonTitle
                })}
              >
                Responder Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentQuizList;