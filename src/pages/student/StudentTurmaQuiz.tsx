import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import BaseLayout from "@/components/BaseLayout";
import StudentTurmaQuizList from "@/components/student/StudentTurmaQuizList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";

const StudentTurmaQuiz = () => {
  const { turmaId } = useParams<{ turmaId: string }>();
  const { data: enrollments } = useMyEnrollments();

  const enrollment = enrollments?.find(e => e.turma_id === turmaId);

  useEffect(() => {
    const turmaName = enrollment?.turma?.name || enrollment?.turma?.code || 'Turma';
    document.title = `${turmaName} - Quiz | Área do Aluno`;
  }, [enrollment]);

  const turmaName = enrollment?.turma?.name || enrollment?.turma?.code || 'Turma';
  const courseName = enrollment?.course?.name || '';

  return (
    <BaseLayout title={`${turmaName} - Quiz`}>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="gap-2"
          >
            <Link to="/aluno/quiz">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{turmaName}</h2>
          {courseName && (
            <p className="text-muted-foreground">{courseName}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Responda os quizzes das aulas desta turma
          </p>
        </div>
      </div>

      <main>
        <StudentTurmaQuizList turmaId={turmaId} />
      </main>
    </BaseLayout>
  );
};

export default StudentTurmaQuiz;