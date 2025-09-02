import { useEffect, useMemo } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpcomingLessons } from "@/hooks/useUpcomingLessons";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Clock, Users, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StudentPreview from "@/components/courses/StudentPreview";
const StudentLessons = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: lessons = [], isLoading, refetch, isRefetching } = useUpcomingLessons();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const queryClient = useQueryClient();

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

  // Agrupar aulas por curso
  const lessonsByCourse = useMemo(() => {
    const grouped = lessons.reduce((acc, lesson) => {
      const courseKey = lesson.course_id;
      if (!acc[courseKey]) {
        acc[courseKey] = {
          courseName: lesson.course,
          courseId: lesson.course_id,
          lessons: []
        };
      }
      acc[courseKey].lessons.push(lesson);
      return acc;
    }, {} as Record<string, { courseName: string; courseId: string; lessons: typeof lessons }>);

    // Ordenar aulas dentro de cada curso por data
    Object.values(grouped).forEach(courseGroup => {
      courseGroup.lessons.sort((a, b) => {
        const dateA = new Date(`${a.date.split('/').reverse().join('-')} ${a.time}`);
        const dateB = new Date(`${b.date.split('/').reverse().join('-')} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
    });

    return grouped;
  }, [lessons]);

  const handleRefresh = async () => {
    try {
      // Invalidate related queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['upcoming_lessons'] });
      await queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      await refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };
  return (
    <BaseLayout title="Aulas Agendadas">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">Próximas aulas</h2>
          <Badge variant="secondary" className="text-sm">
            {lessons.length} {lessons.length === 1 ? 'aula' : 'aulas'}
          </Badge>
        </div>
        <RefreshButton 
          onClick={handleRefresh} 
          isRefreshing={isRefetching}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Carregando aulas...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Nenhuma aula agendada.</p>
          <p className="text-sm text-muted-foreground mb-4">
            Para visualizar aulas, você precisa primeiro se inscrever em um curso.
          </p>
          <Button 
            onClick={() => navigate('/aluno')} 
            variant="default"
          >
            Ver Cursos Disponíveis
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(lessonsByCourse).map(([courseId, courseGroup]) => (
            <section key={courseId} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">
                  {courseGroup.courseName}
                </h3>
                <Badge variant="outline" className="ml-auto">
                  {courseGroup.lessons.length} {courseGroup.lessons.length === 1 ? 'aula' : 'aulas'}
                </Badge>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courseGroup.lessons.map((lesson) => (
                  <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg leading-tight">{lesson.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {courseGroup.courseName}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Data:</span>
                          <span className="font-medium ml-auto">{lesson.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Horário:</span>
                          <span className="font-medium ml-auto">{lesson.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Participantes:</span>
                          <span className="font-medium ml-auto">{lesson.participants}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          asChild 
                          className="w-full" 
                          disabled={!lesson.joinUrl}
                          size="sm"
                        >
                          <a href={lesson.joinUrl || "#"} target="_blank" rel="noopener noreferrer">
                            Acessar aula (Zoom)
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </BaseLayout>
  );
};

export default StudentLessons;
