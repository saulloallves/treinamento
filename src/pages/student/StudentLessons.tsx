import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpcomingLessons } from "@/hooks/useUpcomingLessons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
const StudentLessons = () => {
  const { data: lessons = [], isLoading, refetch, isRefetching } = useUpcomingLessons();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Aulas Agendadas | Área do Aluno";
  }, []);

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
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Próximas aulas</h2>
        <div className="flex gap-2">
          <RefreshButton 
            onClick={handleRefresh} 
            isRefreshing={isRefetching}
          />
        </div>
      </header>

      {isLoading ? (
        <p>Carregando aulas...</p>
      ) : lessons.length === 0 ? (
        <div className="text-center py-8">
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
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">{lesson.course}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Data</span>
                    <span className="font-medium">{lesson.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Horário</span>
                    <span className="font-medium">{lesson.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Participantes</span>
                    <span className="font-medium">{lesson.participants}</span>
                  </div>
                  <div className="pt-2">
                    <Button asChild className="w-full" disabled={!lesson.joinUrl}>
                      <a href={lesson.joinUrl || "#"} target="_blank" rel="noopener noreferrer">
                        Acessar aula (Zoom)
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

    </BaseLayout>
  );
};

export default StudentLessons;
