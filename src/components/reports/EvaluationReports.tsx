import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useEvaluationReports } from "@/hooks/useEvaluationReports";
import { TurmaDetailedReport } from "./TurmaDetailedReport";
import { 
  Users, 
  MessageSquare, 
  FileQuestion, 
  TrendingUp, 
  Award,
  BarChart3,
  Eye
} from "lucide-react";

interface EvaluationReportsProps {
  filters?: {
    turmaId?: string;
    courseId?: string;
    startDate?: string;
    endDate?: string;
  };
  detailed?: boolean;
  professorMode?: boolean;
  professorId?: string;
}

export const EvaluationReports = ({ 
  filters, 
  detailed = false, 
  professorMode = false,
  professorId 
}: EvaluationReportsProps) => {
  const [selectedTurma, setSelectedTurma] = useState<{
    id: string;
    name: string;
    courseName: string;
  } | null>(null);
  
  const { data: reports, isLoading, error } = useEvaluationReports(filters);

  // Se uma turma está selecionada, mostrar o relatório detalhado
  if (selectedTurma) {
    return (
      <TurmaDetailedReport
        turmaId={selectedTurma.id}
        turmaName={selectedTurma.name}
        courseName={selectedTurma.courseName}
        onClose={() => setSelectedTurma(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2" />
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-red-600">
            Erro ao carregar relatórios. Tente novamente.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum dado encontrado</h3>
          <p className="text-muted-foreground">
            Não foram encontrados dados de avaliações para os filtros selecionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcular estatísticas gerais
  const totalStudents = reports.reduce((sum, r) => sum + r.totalStudents, 0);
  const totalQuizResponses = reports.reduce((sum, r) => sum + r.quizResponses, 0);
  const totalTestSubmissions = reports.reduce((sum, r) => sum + r.testSubmissions, 0);
  const avgQuizAccuracy = reports.length > 0 
    ? Math.round(reports.reduce((sum, r) => sum + r.avgQuizAccuracy, 0) / reports.length)
    : 0;
  const avgTestScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.avgTestScore, 0) / reports.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      {!detailed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
              <div className="text-sm text-muted-foreground">Estudantes Únicos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-foreground">{totalQuizResponses}</div>
              <div className="text-sm text-muted-foreground">Respostas Quiz</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <FileQuestion className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-foreground">{totalTestSubmissions}</div>
              <div className="text-sm text-muted-foreground">Testes Submetidos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-foreground">{avgQuizAccuracy}%</div>
              <div className="text-sm text-muted-foreground">Precisão Quiz</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-foreground">{avgTestScore}%</div>
              <div className="text-sm text-muted-foreground">Média Testes</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatórios por Turma */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">
          {detailed ? "Relatório Detalhado por Turma" : "Desempenho por Turma"}
        </h3>
        
        {reports.map((report) => (
          <Card key={report.turmaId} className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{report.turmaName}</CardTitle>
                  <CardDescription>{report.courseName}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {report.totalStudents} estudante{report.totalStudents !== 1 ? 's' : ''}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTurma({
                        id: report.turmaId,
                        name: report.turmaName,
                        courseName: report.courseName
                      });
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent
              onClick={() => setSelectedTurma({
                id: report.turmaId,
                name: report.turmaName,
                courseName: report.courseName
              })}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Quiz Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Quiz</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{report.quizResponses}</div>
                  <div className="text-sm text-muted-foreground">Respostas</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{report.avgQuizAccuracy}% precisão</div>
                  </div>
                  <Progress value={report.avgQuizAccuracy} className="h-2" />
                </div>

                {/* Test Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Testes</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{report.testSubmissions}</div>
                  <div className="text-sm text-muted-foreground">Submissões</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{report.avgTestScore}% média</div>
                  </div>
                  <Progress value={report.avgTestScore} className="h-2" />
                </div>

                {/* Participation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Participação</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{report.totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Estudantes ativos</div>
                  <div className="text-sm text-muted-foreground">
                    Total de avaliações: {report.quizResponses + report.testSubmissions}
                  </div>
                </div>

                {/* Overall Performance */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Performance Geral</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round((report.avgQuizAccuracy + report.avgTestScore) / 2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Média combinada</div>
                  <Progress 
                    value={Math.round((report.avgQuizAccuracy + report.avgTestScore) / 2)} 
                    className="h-2" 
                  />
                </div>
              </div>

              {detailed && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Detalhes Adicionais</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quiz - Total de perguntas respondidas:</span>
                      <div className="font-medium">{report.quizResponses}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Testes - Total de submissões:</span>
                      <div className="font-medium">{report.testSubmissions}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Engajamento:</span>
                      <div className="font-medium">
                        {report.totalStudents > 0 
                          ? `${Math.round(((report.quizResponses + report.testSubmissions) / report.totalStudents) * 100) / 100} avaliações/estudante`
                          : 'N/A'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status da turma:</span>
                      <Badge variant="outline" className="ml-2">
                        {report.quizResponses > 0 || report.testSubmissions > 0 ? 'Ativa' : 'Sem atividade'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};