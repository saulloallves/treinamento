import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Clock, Users, BookOpen, Play, ArrowLeft, ExternalLink } from "lucide-react";
import { useTurmaLessons } from "@/hooks/useLessonsByTurma";
import AttendanceButton from "@/components/student/AttendanceButton";
import { supabase } from "@/integrations/supabase/client";

const TurmaLessons = () => {
  const { turmaId } = useParams<{ turmaId: string }>();
  const { data: lessons = [], isLoading, refetch, isRefetching } = useTurmaLessons(turmaId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const turmaName = lessons.length > 0 ? lessons[0].turma_name : "Turma";
  const courseName = lessons.length > 0 ? lessons[0].course_name : "";

  // Buscar enrollment do aluno nesta turma
  const { data: enrollment } = useQuery({
    queryKey: ['student-enrollment', turmaId],
    enabled: Boolean(turmaId),
    queryFn: async () => {
      const { data: userResp } = await supabase.auth.getUser();
      if (!userResp.user) return null;
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('turma_id', turmaId!)
        .eq('user_id', userResp.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    document.title = `${turmaName} - Aulas | Área do Aluno`;
  }, [turmaName]);

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['turma_lessons', turmaId] });
      await queryClient.invalidateQueries({ queryKey: ['lessons_by_turma'] });
      await refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };

  return (
    <BaseLayout title={`${turmaName} - Aulas`}>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/aluno/aulas')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Turmas
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">{turmaName}</h2>
            {courseName && (
              <p className="text-muted-foreground">{courseName}</p>
            )}
            <Badge variant="secondary" className="text-sm">
              {lessons.length} {lessons.length === 1 ? 'aula' : 'aulas'} próximas
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
      ) : lessons.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Nenhuma aula agendada para esta turma.</p>
          <Button 
            onClick={() => navigate('/aluno/aulas')} 
            variant="default"
          >
            Voltar para Turmas
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className={`
              transition-all hover:shadow-md 
              ${index === 0 ? 'ring-2 ring-primary/20 bg-primary/5' : ''}
            `}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base leading-tight pr-2">{lesson.title}</CardTitle>
                  {index === 0 && (
                    <Badge variant="default" className="text-xs bg-primary shrink-0">
                      <Play className="h-3 w-3 mr-1" />
                      Próxima
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
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
                
                <div className="pt-2 space-y-2">
                  {enrollment?.id && (
                    <AttendanceButton 
                      enrollmentId={enrollment.id}
                      lessonId={lesson.id}
                      className="w-full"
                    />
                  )}
                  
                  <Button 
                    asChild 
                    className="w-full gap-2" 
                    disabled={!lesson.joinUrl}
                    size="sm"
                    variant={index === 0 ? "default" : "outline"}
                  >
                    <a 
                      href={lesson.joinUrl || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Acessar Aula (Zoom)
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

export default TurmaLessons;