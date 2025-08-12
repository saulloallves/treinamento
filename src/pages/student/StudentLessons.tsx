import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpcomingLessons } from "@/hooks/useUpcomingLessons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
const StudentLessons = () => {
  const { data: lessons = [], isLoading, refetch, isRefetching } = useUpcomingLessons();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);

  useEffect(() => {
    document.title = "Aulas Agendadas | Área do Aluno";
  }, []);

  useEffect(() => {
    if (!checkingAdmin && isAdmin) {
      navigate('/', { replace: true });
    }
  }, [checkingAdmin, isAdmin, navigate]);
  return (
    <BaseLayout title="Aulas Agendadas">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Aulas</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? "Recarregando..." : "Recarregar"}
          </Button>
        </div>
      </header>

      {isLoading ? (
        <p>Carregando aulas...</p>
      ) : lessons.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma aula agendada.</p>
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
