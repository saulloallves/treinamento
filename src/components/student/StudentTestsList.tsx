import { useStudentTests, useStudentTurmaTests } from "@/hooks/useStudentTests";
import StudentTestCard from "./StudentTestCard";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface StudentTestsListProps {
  turmaId?: string;
}

const StudentTestsList = ({ turmaId }: StudentTestsListProps) => {
  // Use hook específico para turma se turmaId for fornecido
  const allTestsQuery = useStudentTests();
  const turmaTestsQuery = useStudentTurmaTests(turmaId);
  
  const query = turmaId ? turmaTestsQuery : allTestsQuery;
  const { data: tests, isLoading, error } = query;

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar testes avaliativos.</p>
      </div>
    );
  }

  if (!tests || tests.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-6xl">📚</div>
        <div className="space-y-2">
          <p className="text-lg font-medium">Nenhum teste avaliativo disponível</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            {turmaId 
              ? "Não há testes avaliativos disponíveis para esta turma no momento."
              : "Os testes avaliativos aparecerão aqui quando seus professores criarem e ativarem testes para suas turmas."
            }
          </p>
        </div>
      </div>
    );
  }

  // Separar testes em respondidos e não respondidos
  const completedTests = tests.filter(test => {
    const hasSubmissions = test.test_submissions && test.test_submissions.length > 0;
    const latestSubmission = hasSubmissions ? 
      test.test_submissions!.sort((a, b) => b.attempt_number - a.attempt_number)[0] : null;
    return latestSubmission?.status === 'completed';
  });

  const pendingTests = tests.filter(test => {
    const hasSubmissions = test.test_submissions && test.test_submissions.length > 0;
    const latestSubmission = hasSubmissions ? 
      test.test_submissions!.sort((a, b) => b.attempt_number - a.attempt_number)[0] : null;
    return !latestSubmission || latestSubmission.status !== 'completed';
  });

  return (
    <div className="space-y-6">
      {/* Testes Pendentes */}
      {pendingTests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Testes Pendentes</h3>
            <span className="text-sm text-muted-foreground">({pendingTests.length})</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pendingTests.map((test) => (
              <StudentTestCard key={test.id} test={test} />
            ))}
          </div>
        </div>
      )}

      {/* Separador */}
      {pendingTests.length > 0 && completedTests.length > 0 && (
        <Separator className="my-6" />
      )}

      {/* Testes Respondidos */}
      {completedTests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Testes Respondidos</h3>
            <span className="text-sm text-muted-foreground">({completedTests.length})</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {completedTests.map((test) => (
              <StudentTestCard key={test.id} test={test} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTestsList;