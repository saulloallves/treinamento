import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import StudentTurmasList from "@/components/student/StudentTurmasList";
import { Users, BookOpen } from "lucide-react";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";

const StudentQuiz = () => {
  const { data: enrollments } = useMyEnrollments();
  
  useEffect(() => {
    document.title = "Quiz | Área do Aluno";
  }, []);

  const activeTurmas = enrollments?.filter(e => 
    e.turma && 
    e.turma.status !== 'encerrada' && 
    e.turma.status !== 'cancelada'
  ) || [];

  return (
    <BaseLayout title="Quiz">
      <div className="mb-6 space-y-4">
        {/* Header com ícone e título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Quiz por Turma</h2>
        </div>

        {/* Info cards - melhorado para mobile */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-4 py-3">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">
              {activeTurmas.length} {activeTurmas.length === 1 ? 'turma ativa' : 'turmas ativas'}
            </span>
          </div>
          <div className="flex items-start gap-2 bg-muted/50 rounded-lg px-4 py-3 flex-1">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">
              Selecione uma turma para ver os quizzes disponíveis
            </span>
          </div>
        </div>
      </div>

      <main>
        <StudentTurmasList showQuizLink />
      </main>
    </BaseLayout>
  );
};

export default StudentQuiz;