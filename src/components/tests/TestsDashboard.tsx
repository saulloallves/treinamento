import { TrendingUp, Users, Award, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTestStats } from "@/hooks/useTestStats";
import { useTests } from "@/hooks/useTests";

export const TestsDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useTestStats();
  const { data: tests, isLoading: testsLoading } = useTests();

  if (statsLoading || testsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Get recent tests data
  const recentTests = tests?.slice(0, 5).map(test => ({
    name: test.name,
    submissions: 0, // Will be updated when we have submission data
    passRate: 0, // Will be updated when we have submission data
    date: new Date(test.created_at).toLocaleDateString('pt-BR')
  })) || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeTests || 0} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissões Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.todaySubmissions || 0} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Média de Aprovação</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.averagePassRate || 0}%
            </div>
            <Progress value={stats?.averagePassRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testes Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTests || 0}</div>
            <p className="text-xs text-muted-foreground">
              de {stats?.totalTests || 0} totais
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tests by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Testes por Status</CardTitle>
            <CardDescription>
              Distribuição dos testes por status atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Ativos</span>
                </div>
                <span className="text-sm font-medium">{stats?.activeTests || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="font-medium">Rascunhos</span>
                </div>
                <span className="text-sm font-medium">{stats?.draftTests || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                  <span className="font-medium">Arquivados</span>
                </div>
                <span className="text-sm font-medium">{stats?.archivedTests || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Testes Recentes</CardTitle>
            <CardDescription>
              Últimos testes criados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTests.length > 0 ? (
                recentTests.map((test, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Criado em {test.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Nenhum teste encontrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências de Performance</CardTitle>
          <CardDescription>
            Evolução da taxa de aprovação ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Gráfico de tendências será implementado aqui
          </div>
        </CardContent>
      </Card>
    </div>
  );
};