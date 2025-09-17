import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import StudentTurmasList from "@/components/student/StudentTurmasList";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList } from "lucide-react";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";

const StudentTests = () => {
  const { data: enrollments } = useMyEnrollments();
  
  useEffect(() => {
    document.title = "Testes Avaliativos | Área do Aluno";
  }, []);

  // Filtrar apenas inscrições que têm turma_id
  const turmaEnrollments = enrollments?.filter(enrollment => enrollment.turma_id) || [];

  return (
    <BaseLayout title="Área do Aluno">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold">Testes Avaliativos</h2>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm gap-1">
            <Users className="h-3 w-3" />
            {turmaEnrollments.length} {turmaEnrollments.length === 1 ? 'turma' : 'turmas'}
          </Badge>
          <Badge variant="outline" className="text-sm gap-1">
            <ClipboardList className="h-3 w-3" />
            Selecione uma turma para ver os testes disponíveis
          </Badge>
        </div>
      </div>

      <main>
        <StudentTurmasList />
      </main>
    </BaseLayout>
  );
};

export default StudentTests;