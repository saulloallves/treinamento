import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/hooks/useQuiz";
import { useState } from "react";
import LessonQuiz from "@/components/quiz/LessonQuiz";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";

const StudentQuizList = () => {
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuiz();
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useMyEnrollments();
  const [selectedQuiz, setSelectedQuiz] = useState<{ lessonId: string; courseId: string; lessonTitle: string; turmaId?: string } | null>(null);

  const isLoading = quizzesLoading || enrollmentsLoading;

  // Get enrolled course IDs and turma IDs
  const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));
  const enrolledTurmaIds = new Set(enrollments.map(e => e.turma?.id).filter(Boolean));

  // Filter quizzes based on enrollment
  const relevantQuizzes = quizzes.filter(quiz => {
    // Must be for a course the student is enrolled in
    if (!enrolledCourseIds.has(quiz.course_id)) return false;
    
    // If quiz has no turma_id (general quiz), include it
    if (!quiz.turma_id) return true;
    
    // If quiz has turma_id, student must be enrolled in that turma
    return enrolledTurmaIds.has(quiz.turma_id);
  });

  // Group relevant quizzes by lesson
  const quizzesByLesson = relevantQuizzes.reduce((acc, quiz) => {
    const lessonId = quiz.lesson_id;
    if (!lessonId) return acc;
    
    if (!acc[lessonId]) {
      // Find the enrollment for this course to get turma info
      const enrollment = enrollments.find(e => e.course.id === quiz.course_id);
      
      acc[lessonId] = {
        lessonTitle: quiz.lessons?.title || 'Aula sem título',
        courseId: quiz.course_id,
        courseName: quiz.courses?.name || 'Curso sem nome',
        turmaId: enrollment?.turma?.id,
        quizzes: []
      };
    }
    acc[lessonId].quizzes.push(quiz);
    return acc;
  }, {} as Record<string, { lessonTitle: string; courseId: string; courseName: string; turmaId?: string; quizzes: any[] }>);

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
        <LessonQuiz lessonId={selectedQuiz.lessonId} courseId={selectedQuiz.courseId} turmaId={selectedQuiz.turmaId} />
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
                  lessonTitle: lessonData.lessonTitle,
                  turmaId: lessonData.turmaId
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