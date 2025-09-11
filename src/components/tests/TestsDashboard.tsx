import { TrendingUp, Users, Award, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const TestsDashboard = () => {
  // Mock data - replace with real data from hooks
  const dashboardData = {
    totalTests: 12,
    activeTests: 8,
    totalSubmissions: 245,
    averagePassRate: 78.5,
    topPerformingUnits: [
      { unit: "Loja Centro", passRate: 92, submissions: 45 },
      { unit: "Loja Norte", passRate: 88, submissions: 38 },
      { unit: "Loja Sul", passRate: 84, submissions: 52 },
      { unit: "Loja Oeste", passRate: 76, submissions: 41 },
      { unit: "Loja Leste", passRate: 69, submissions: 69 }
    ],
    recentTests: [
      { name: "Avaliação de Vendas", submissions: 45, passRate: 82, date: "15/01/2024" },
      { name: "Teste de Atendimento", submissions: 38, passRate: 91, date: "12/01/2024" },
      { name: "Avaliação Técnica", submissions: 52, passRate: 76, date: "08/01/2024" }
    ]
  };

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
            <div className="text-2xl font-bold">{dashboardData.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.activeTests} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissões Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              +23 hoje
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
              {dashboardData.averagePassRate}%
            </div>
            <Progress value={dashboardData.averagePassRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+5.2%</div>
            <p className="text-xs text-muted-foreground">
              vs. mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performing Units */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Unidade</CardTitle>
            <CardDescription>
              Ranking de aprovação por loja/unidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topPerformingUnits.map((unit, index) => (
                <div key={unit.unit} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{unit.unit}</div>
                      <div className="text-sm text-muted-foreground">
                        {unit.submissions} submissões
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={unit.passRate} className="w-16" />
                    <span className="text-sm font-medium">{unit.passRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tests Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Testes Recentes</CardTitle>
            <CardDescription>
              Performance dos últimos testes aplicados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTests.map((test, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {test.submissions} submissões • {test.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{test.passRate}%</div>
                      <div className="text-sm text-muted-foreground">aprovação</div>
                    </div>
                  </div>
                  <Progress value={test.passRate} />
                </div>
              ))}
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