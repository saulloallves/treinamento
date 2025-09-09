import { useEffect, useState } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StudentPreview from "@/components/courses/StudentPreview";
import { useLessonsByTurma } from "@/hooks/useLessonsByTurma";
import TurmaLessonsCard from "@/components/turmas/TurmaLessonsCard";
import RecordedCoursesDialog from "@/components/courses/RecordedCoursesDialog";

const StudentLessons = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: turmas = [], isLoading, refetch, isRefetching } = useLessonsByTurma();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const queryClient = useQueryClient();
  
  const [recordedCoursesDialogOpen, setRecordedCoursesDialogOpen] = useState(false);
  const [selectedRecordedCourse, setSelectedRecordedCourse] = useState<{
    courseId: string;
    courseName: string;
  } | null>(null);

  // Se courseId existe, buscar dados do curso para renderizar StudentPreview
  const { data: courseData, error: courseError, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      console.log('Buscando curso:', courseId);
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, tipo")
        .eq("id", courseId)
        .maybeSingle();
        
      if (error) {
        console.error('Erro ao buscar curso:', error);
        throw error;
      }
      console.log('Dados do curso:', data);
      return data;
    },
    enabled: !!courseId,
  });

  // Tratamento de erros e loading para curso gravado
  if (courseId) {
    if (courseLoading) {
      return (
        <BaseLayout title="Carregando Curso">
          <div className="text-center py-8">
            <p>Carregando curso...</p>
          </div>
        </BaseLayout>
      );
    }
    
    if (courseError) {
      console.error('Erro no curso:', courseError);
      return (
        <BaseLayout title="Erro">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Erro ao carregar curso</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os dados do curso.
            </p>
            <Button onClick={() => navigate('/aluno')}>
              Voltar para Área do Aluno
            </Button>
          </div>
        </BaseLayout>
      );
    }

    if (!courseData) {
      return (
        <BaseLayout title="Curso não encontrado">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Curso não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O curso solicitado não foi encontrado.
            </p>
            <Button onClick={() => navigate('/aluno')}>
              Voltar para Área do Aluno
            </Button>
          </div>
        </BaseLayout>
      );
    }

    // Se é uma visualização de curso gravado, renderizar StudentPreview
    if (courseData.tipo === 'gravado') {
      console.log('Renderizando StudentPreview para curso gravado:', courseData);
      return (
        <StudentPreview
          courseId={courseId}
          courseName={courseData.name}
          onBack={() => navigate('/aluno')}
        />
      );
    }
  }

  useEffect(() => {
    document.title = "Aulas Agendadas | Área do Aluno";
  }, []);

  // Função para navegar para página específica da turma
  const navigateToTurmaLessons = (turmaId: string) => {
    navigate(`/aluno/turma/${turmaId}/aulas`);
  };

  const handleViewRecordedLessons = (courseId: string, courseName: string) => {
    setSelectedRecordedCourse({ courseId, courseName });
    setRecordedCoursesDialogOpen(true);
  };

  // Calcular total de próximas aulas
  const totalUpcomingLessons = turmas.reduce((total, turma) => total + turma.upcoming_lessons_count, 0);

  const handleRefresh = async () => {
    try {
      // Invalidate related queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['lessons_by_turma'] });
      await queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      await refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };

  return (
    <BaseLayout title="Aulas por Turma">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Minhas Turmas</h2>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm gap-1">
              <Users className="h-3 w-3" />
              {turmas.length} {turmas.length === 1 ? 'turma' : 'turmas'}
            </Badge>
            <Badge variant="outline" className="text-sm gap-1">
              <BookOpen className="h-3 w-3" />
              {totalUpcomingLessons} próximas aulas
            </Badge>
          </div>
        </div>
        <RefreshButton 
          onClick={handleRefresh} 
          isRefreshing={isRefetching}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Carregando turmas...</p>
        </div>
      ) : turmas.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Você não está inscrito em nenhuma turma com aulas agendadas.</p>
          <p className="text-sm text-muted-foreground mb-4">
            Para visualizar aulas, você precisa primeiro se inscrever em um curso e ser alocado em uma turma.
          </p>
          <Button 
            onClick={() => navigate('/aluno')} 
            variant="default"
          >
            Ver Cursos Disponíveis
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma) => (
            <TurmaLessonsCard
              key={turma.id}
              turma={turma}
              onClick={() => navigateToTurmaLessons(turma.id)}
              onViewRecordedLessons={handleViewRecordedLessons}
            />
          ))}
        </div>
      )}

      <RecordedCoursesDialog
        courseId={selectedRecordedCourse?.courseId || ""}
        courseName={selectedRecordedCourse?.courseName || ""}
        open={recordedCoursesDialogOpen}
        onOpenChange={setRecordedCoursesDialogOpen}
      />
    </BaseLayout>
  );
};

export default StudentLessons;