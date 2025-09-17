import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import BaseLayout from "@/components/BaseLayout";
import StudentTestsList from "@/components/student/StudentTestsList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";

const StudentTurmaTests = () => {
  const { turmaId } = useParams<{ turmaId: string }>();
  const { data: enrollments } = useMyEnrollments();

  const enrollment = enrollments?.find(e => e.turma_id === turmaId);

  useEffect(() => {
    const turmaName = enrollment?.turma?.name || enrollment?.turma?.code || 'Turma';
    document.title = `Testes - ${turmaName} | Área do Aluno`;
  }, [enrollment]);

  if (!turmaId) {
    return <div>Turma não encontrada</div>;
  }

  return (
    <BaseLayout title="Área do Aluno">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/aluno/testes">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Link>
          </Button>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            Testes Avaliativos - {enrollment?.turma?.name || enrollment?.turma?.code || 'Turma'}
          </h2>
          {enrollment?.course && (
            <p className="text-muted-foreground">
              Curso: {enrollment.course.name}
            </p>
          )}
        </div>
      </header>

      <main>
        <StudentTestsList turmaId={turmaId} />
      </main>
    </BaseLayout>
  );
};

export default StudentTurmaTests;