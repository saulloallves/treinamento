import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProfessorDashboard } from "@/hooks/useProfessorDashboard";
import { useProfessorRecentActivity } from "@/hooks/useProfessorRecentActivity";
import { useProfessorUpcomingLessons } from "@/hooks/useProfessorUpcomingLessons";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  ClipboardList, 
  Calendar, 
  Clock, 
  UserPlus, 
  CheckCircle, 
  Award,
  ExternalLink
} from "lucide-react";

const ProfessorDashboard = () => {
  const { data: stats, isLoading, refetch, isRefetching } = useProfessorDashboard();
  const { data: recentActivity, isLoading: activityLoading } = useProfessorRecentActivity();
  const { data: upcomingLessons, isLoading: lessonsLoading } = useProfessorUpcomingLessons();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Dashboard do Professor | Sistema";
  }, []);

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['professor-dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['professor-recent-activity'] });
      await queryClient.invalidateQueries({ queryKey: ['professor-upcoming-lessons'] });
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
      <header className="mb-4 md:mb-6 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">Dashboard Pedagógico</h2>
        <RefreshButton 
          onClick={handleRefresh} 
          isRefreshing={isRefetching}
        />
      </header>

      <main className="space-y-4 md:space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats?.averageStudentProgress || 0}%</div>
              <Progress value={stats?.averageStudentProgress || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats?.activeCourses || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cursos que você está lecionando
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats?.totalActiveStudents || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de alunos matriculados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats?.averageAttendanceRate || 0}%</div>
              <Progress value={stats?.averageAttendanceRate || 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout - Stack on mobile */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Upcoming Live Classes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                <span className="break-words">Próximas Aulas ao Vivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {lessonsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : upcomingLessons && upcomingLessons.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {upcomingLessons.slice(0, 5).map((lesson) => (
                    <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 md:p-4 border rounded-lg space-y-2 sm:space-y-0 sm:space-x-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm md:text-base break-words leading-tight">{lesson.title}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground break-words mt-1">
                          {lesson.courseName} • {lesson.turmaName}
                        </p>
                        <div className="flex flex-wrap gap-2 md:gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {lesson.formattedDate}
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {lesson.formattedTime}
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Users className="h-3 w-3" />
                            {lesson.expectedParticipants} alunos
                          </span>
                        </div>
                      </div>
                      {lesson.startUrl && (
                        <Button size="sm" variant="outline" asChild className="w-full sm:w-auto shrink-0">
                          <a href={lesson.startUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-xs">Iniciar</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Nenhuma aula agendada para os próximos dias</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Student Activities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                <span className="break-words">Atividades Recentes dos Alunos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {recentActivity.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'attendance' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {activity.type === 'enrollment' && <UserPlus className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'certificate' && <Award className="h-4 w-4 text-yellow-600" />}
                        {activity.type === 'progress' && <TrendingUp className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm break-words leading-tight">
                          <span className="font-medium">{activity.studentName}</span>{' '}
                          <span className="break-words">{activity.description}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 break-words">
                          {activity.turmaName} • {activity.relativeTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Nenhuma atividade recente encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </BaseLayout>
  );
};

export default ProfessorDashboard;