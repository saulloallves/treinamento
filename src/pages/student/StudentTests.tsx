import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import StudentTurmasList from "@/components/student/StudentTurmasList";
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
      <div className="mb-6 space-y-4">
        {/* Header com ícone e título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Testes Avaliativos</h2>
        </div>

        {/* Info card - contador de turmas */}
        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-4 py-3">
          <Users className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium">
            {turmaEnrollments.length} {turmaEnrollments.length === 1 ? 'turma' : 'turmas'}
          </span>
        </div>
      </div>

      <main>
        <StudentTurmasList />
      </main>
    </BaseLayout>
  );
};

export default StudentTests;