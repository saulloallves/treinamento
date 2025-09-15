import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailedTurmaReports } from "@/hooks/useDetailedTurmaReports";
import { 
  MessageSquare, 
  FileQuestion, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TurmaDetailedReportProps {
  turmaId: string;
  turmaName: string;
  courseName: string;
  onClose: () => void;
}

export const TurmaDetailedReport = ({ 
  turmaId, 
  turmaName, 
  courseName,
  onClose 
}: TurmaDetailedReportProps) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const { data: studentsData, isLoading, error } = useDetailedTurmaReports(turmaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Button variant="outline" onClick={onClose}>Voltar</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Erro</CardTitle>
            <Button variant="outline" onClick={onClose}>Voltar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Erro ao carregar dados detalhados da turma.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!studentsData || studentsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{turmaName}</CardTitle>
              <CardDescription>{courseName}</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>Voltar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma avaliação encontrada para esta turma.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estatísticas gerais da turma
  const totalQuizResponses = studentsData.reduce((sum, s) => sum + s.quizStats.totalAnswered, 0);
  const totalTestSubmissions = studentsData.reduce((sum, s) => sum + s.testStats.totalTests, 0);
  const avgQuizAccuracy = studentsData.length > 0 
    ? Math.round(studentsData.reduce((sum, s) => sum + s.quizStats.accuracy, 0) / studentsData.length)
    : 0;
  const avgTestScore = studentsData.length > 0
    ? Math.round(studentsData.reduce((sum, s) => sum + s.testStats.averageScore, 0) / studentsData.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{turmaName}</CardTitle>
              <CardDescription className="text-base">{courseName}</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Voltar aos Relatórios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{studentsData.length}</div>
              <div className="text-sm text-muted-foreground">Estudantes Ativos</div>
            </div>
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{totalQuizResponses}</div>
              <div className="text-sm text-muted-foreground">Respostas Quiz</div>
            </div>
            <div className="text-center">
              <FileQuestion className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{totalTestSubmissions}</div>
              <div className="text-sm text-muted-foreground">Testes Submetidos</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{Math.round((avgQuizAccuracy + avgTestScore) / 2)}%</div>
              <div className="text-sm text-muted-foreground">Performance Média</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para Quiz e Testes */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="quiz">Quiz ({totalQuizResponses})</TabsTrigger>
          <TabsTrigger value="tests">Testes ({totalTestSubmissions})</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Estudantes</CardTitle>
              <CardDescription>Performance geral de cada estudante</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudante</TableHead>
                    <TableHead className="text-center">Quiz</TableHead>
                    <TableHead className="text-center">Testes</TableHead>
                    <TableHead className="text-center">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsData.map((student) => {
                    const overallPerformance = Math.round((student.quizStats.accuracy + student.testStats.averageScore) / 2);
                    return (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.studentName}</div>
                            <div className="text-sm text-muted-foreground">{student.studentEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{student.quizStats.accuracy}%</div>
                            <div className="text-xs text-muted-foreground">
                              {student.quizStats.correctAnswers}/{student.quizStats.totalAnswered}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{student.testStats.averageScore}%</div>
                            <div className="text-xs text-muted-foreground">
                              {student.testStats.testsPass}/{student.testStats.totalTests} aprovado
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">{overallPerformance}%</div>
                            <Progress value={overallPerformance} className="h-2" />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>Respostas de Quiz Detalhadas</CardTitle>
              <CardDescription>Todas as respostas de quiz dos estudantes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudante</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Pergunta</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsData.flatMap(student => 
                    student.quizResponses.map(response => (
                      <TableRow key={`${student.studentId}-${response.id}`}>
                        <TableCell>
                          <div className="text-sm font-medium">{student.studentName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{response.quizName}</div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm truncate">{response.question}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{response.selectedAnswer}</div>
                        </TableCell>
                        <TableCell>
                          {response.isCorrect ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Correto
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Incorreto
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(response.answeredAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testes Tab */}
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Submissões de Testes Detalhadas</CardTitle>
              <CardDescription>Todas as submissões de testes dos estudantes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudante</TableHead>
                    <TableHead>Teste</TableHead>
                    <TableHead className="text-center">Pontuação</TableHead>
                    <TableHead className="text-center">Percentual</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Tentativa</TableHead>
                    <TableHead className="text-center">Tempo</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsData.flatMap(student => 
                    student.testSubmissions.map(submission => (
                      <TableRow key={`${student.studentId}-${submission.id}`}>
                        <TableCell>
                          <div className="text-sm font-medium">{student.studentName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{submission.testName}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            {submission.totalScore}/{submission.maxPossibleScore}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm font-medium">{submission.percentage}%</div>
                        </TableCell>
                        <TableCell className="text-center">
                          {submission.passed ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Target className="h-3 w-3 mr-1" />
                              Aprovado
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Reprovado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">#{submission.attemptNumber}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm flex items-center justify-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {submission.timeTaken}min
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(submission.submittedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};