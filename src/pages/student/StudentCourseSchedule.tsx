import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpcomingLessons } from "@/hooks/useUpcomingLessons";
import { useNavigate, useParams } from "react-router-dom";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Clock, Users, BookOpen, Play, ArrowLeft } from "lucide-react";

const StudentCourseSchedule = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: lessons = [], isLoading, refetch, isRefetching } = useUpcomingLessons();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Filtrar aulas apenas do curso específico
  const courseLessons = lessons.filter(lesson => lesson.course_id === courseId);
  const courseName = courseLessons.length > 0 ? courseLessons[0].course : "Curso";

  useEffect(() => {
    document.title = `${courseName} - Aulas Agendadas | Área do Aluno`;
  }, [courseName]);

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['upcoming_lessons'] });
      await refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };

  return (
    <BaseLayout title={`${courseName} - Aulas`}>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/aluno/aulas')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Aulas
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">{courseName}</h2>
            <Badge variant="secondary" className="text-sm">
              {courseLessons.length} {courseLessons.length === 1 ? 'aula' : 'aulas'}
            </Badge>
          </div>
          <RefreshButton 
            onClick={handleRefresh} 
            isRefreshing={isRefetching}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Carregando aulas...</p>
        </div>
      ) : courseLessons.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Nenhuma aula agendada para este curso.</p>
          <Button 
            onClick={() => navigate('/aluno/aulas')} 
            variant="default"
          >
            Voltar para Aulas
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courseLessons.map((lesson, index) => (
            <Card key={lesson.id} className={`
              transition-all hover:shadow-md 
              ${index === 0 ? 'ring-2 ring-primary/20 bg-primary/5' : ''}
            `}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base leading-tight">{lesson.title}</CardTitle>
                  {index === 0 && (
                    <Badge variant="default" className="text-xs bg-primary">
                      <Play className="h-3 w-3 mr-1" />
                      Próxima
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Data:</span>
                    </div>
                    <span className="font-medium">{lesson.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Horário:</span>
                    </div>
                    <span className="font-medium">{lesson.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Participantes:</span>
                    </div>
                    <span className="font-medium">{lesson.participants}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    asChild 
                    className="w-full" 
                    disabled={!lesson.joinUrl}
                    size="sm"
                    variant={index === 0 ? "default" : "outline"}
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
      )}
    </BaseLayout>
  );
};

export default StudentCourseSchedule;