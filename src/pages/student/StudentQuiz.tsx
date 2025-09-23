import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import StudentTurmasList from "@/components/student/StudentTurmasList";
import { Badge } from "@/components/ui/badge";
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Quiz por Turma</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {activeTurmas.length} {activeTurmas.length === 1 ? 'turma ativa' : 'turmas ativas'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <BookOpen className="h-3 w-3" />
            Selecione uma turma para ver os quizzes disponíveis
          </Badge>
        </div>
      </div>

      <main>
        <StudentTurmasList showQuizLink />
      </main>
    </BaseLayout>
  );
};

export default StudentQuiz;