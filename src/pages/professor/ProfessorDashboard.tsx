import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProfessorDashboard } from "@/hooks/useProfessorDashboard";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, BookOpen, TrendingUp, ClipboardList } from "lucide-react";

const ProfessorDashboard = () => {
  const { data: stats, isLoading, refetch, isRefetching } = useProfessorDashboard();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Dashboard do Professor | Sistema";
  }, []);

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['professor-dashboard'] });
      await refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };

  if (isLoading) {
    return (
      <BaseLayout title="Dashboard do Professor">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Dashboard do Professor">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboard Pedagógico</h2>
        <RefreshButton 
          onClick={handleRefresh} 
          isRefreshing={isRefetching}
        />
      </header>

      <main className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageStudentProgress || 0}%</div>
              <Progress value={stats?.averageStudentProgress || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cursos que você está lecionando
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.engagementByClass.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Turmas em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendências</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingTasks.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Avaliações e feedbacks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Engagement by Class */}
        <Card>
          <CardHeader>
            <CardTitle>Engajamento por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.engagementByClass && stats.engagementByClass.length > 0 ? (
              <div className="space-y-4">
                {stats.engagementByClass.map((turma) => (
                  <div key={turma.turmaId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{turma.turmaName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {turma.enrolledStudents} alunos inscritos • {turma.activeStudents} ativos
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium">{turma.engagementRate}%</div>
                        <div className="text-xs text-muted-foreground">Engajamento</div>
                      </div>
                      <Badge variant={
                        turma.engagementRate >= 80 ? 'default' :
                        turma.engagementRate >= 60 ? 'secondary' : 'destructive'
                      }>
                        {turma.engagementRate >= 80 ? 'Ótimo' :
                         turma.engagementRate >= 60 ? 'Bom' : 'Baixo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma turma ativa encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </BaseLayout>
  );
};

export default ProfessorDashboard;