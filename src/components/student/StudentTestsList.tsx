import { useStudentTests } from "@/hooks/useStudentTests";
import StudentTestCard from "./StudentTestCard";
import SkeletonCard from "@/components/mobile/SkeletonCard";

interface StudentTestsListProps {
  turmaId?: string;
}

const StudentTestsList = ({ turmaId }: StudentTestsListProps) => {
  const { data: allTests, isLoading, error } = useStudentTests();
  
  // Filtrar testes pela turma se turmaId for fornecido
  const tests = turmaId 
    ? allTests?.filter(test => test.turma_id === turmaId)
    : allTests;

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

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tests.map((test) => (
        <StudentTestCard key={test.id} test={test} />
      ))}
    </div>
  );
};

export default StudentTestsList;