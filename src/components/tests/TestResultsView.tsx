import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useTestSubmissions } from "@/hooks/useTests";
import { formatDate } from "@/lib/dateUtils";

interface TestResultsViewProps {
  testId: string;
}

const TestResultsView = ({ testId }: TestResultsViewProps) => {
  const { data: submissions, isLoading } = useTestSubmissions(testId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedSubmissions = submissions?.filter(s => s.status === 'completed') || [];
  const passedSubmissions = completedSubmissions.filter(s => s.passed);
  const failedSubmissions = completedSubmissions.filter(s => !s.passed);
  
  const passRate = completedSubmissions.length > 0 
    ? (passedSubmissions.length / completedSubmissions.length) * 100 
    : 0;

  const averageScore = completedSubmissions.length > 0
    ? completedSubmissions.reduce((sum, s) => sum + s.percentage, 0) / completedSubmissions.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSubmissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {passRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {passedSubmissions.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reprovados</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedSubmissions.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados dos Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          {completedSubmissions.length > 0 ? (
            <div className="space-y-4">
              {completedSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {submission.users?.name || 'Usuário não encontrado'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {submission.users?.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {submission.time_taken_minutes ? 
                          `${submission.time_taken_minutes} min` : 
                          'Tempo não registrado'
                        }
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(submission.submitted_at || submission.started_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {submission.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {submission.total_score}/{submission.max_possible_score} pontos
                      </div>
                    </div>
                    
                    <Badge
                      variant={submission.passed ? "default" : "destructive"}
                      className={
                        submission.passed
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }
                    >
                      {submission.passed ? "Aprovado" : "Reprovado"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma resposta ainda</h3>
              <p className="text-muted-foreground">
                Os resultados aparecerão aqui quando os alunos começarem a responder o teste
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultsView;