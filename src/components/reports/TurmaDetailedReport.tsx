import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailedTurmaReports } from "@/hooks/useDetailedTurmaReports";
import { QuizDetailedView } from "./QuizDetailedView";
import { TestDetailedView } from "./TestDetailedView";
import { 
  MessageSquare, 
  FileQuestion, 
  TrendingUp,
  Users,
  Eye
} from "lucide-react";

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
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'quiz-detail' | 'test-detail'>('overview');
  const { data: studentsData, isLoading, error } = useDetailedTurmaReports(turmaId);

  // Função para voltar à visualização principal
  const handleBackToOverview = () => {
    setView('overview');
    setSelectedQuiz(null);
    setSelectedTest(null);
  };

  // Função para visualizar detalhes do quiz
  const handleViewQuizDetail = (quizName: string) => {
    setSelectedQuiz(quizName);
    setView('quiz-detail');
  };

  // Função para visualizar detalhes do teste
  const handleViewTestDetail = (testName: string) => {
    setSelectedTest(testName);
    setView('test-detail');
  };

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

  // Renderizar visualização detalhada do quiz
  if (view === 'quiz-detail' && selectedQuiz) {
    return (
      <QuizDetailedView
        turmaId={turmaId}
        quizName={selectedQuiz}
        turmaName={turmaName}
        courseName={courseName}
        onBack={handleBackToOverview}
      />
    );
  }

  // Renderizar visualização detalhada do teste
  if (view === 'test-detail' && selectedTest) {
    return (
      <TestDetailedView
        turmaId={turmaId}
        testName={selectedTest}
        onBack={handleBackToOverview}
      />
    );
  }

  // Agrupar quizzes únicos
  const uniqueQuizzes = Array.from(
    new Set(
      studentsData.flatMap(student => 
        student.quizResponses.map(response => response.quizName)
      )
    )
  );

  // Agrupar testes únicos
  const uniqueTests = Array.from(
    new Set(
      studentsData.flatMap(student => 
        student.testSubmissions.map(submission => submission.testName)
      )
    )
  );

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
    <div className="space-y-4">
      {/* Cabeçalho Compacto */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{turmaName}</CardTitle>
              <CardDescription className="text-sm">{courseName}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <div className="text-xl font-bold">{studentsData.length}</div>
              <div className="text-xs text-muted-foreground">Estudantes</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <MessageSquare className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <div className="text-xl font-bold">{totalQuizResponses}</div>
              <div className="text-xs text-muted-foreground">Respostas Quiz</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <FileQuestion className="h-5 w-5 mx-auto mb-1 text-purple-600" />
              <div className="text-xl font-bold">{totalTestSubmissions}</div>
              <div className="text-xs text-muted-foreground">Testes</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
              <div className="text-xl font-bold">{Math.round((avgQuizAccuracy + avgTestScore) / 2)}%</div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes e Testes em Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Seção de Quizzes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                Quizzes ({totalQuizResponses})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {uniqueQuizzes.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhum quiz encontrado
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {uniqueQuizzes.map((quizName) => {
                  const quizResponses = studentsData.flatMap(student => 
                    student.quizResponses.filter(response => response.quizName === quizName)
                  );
                  const correctResponses = quizResponses.filter(response => response.isCorrect).length;
                  const accuracy = quizResponses.length > 0 ? Math.round((correctResponses / quizResponses.length) * 100) : 0;
                  const studentsWithResponses = new Set(
                    studentsData.filter(student => 
                      student.quizResponses.some(response => response.quizName === quizName)
                    ).map(student => student.studentId)
                  ).size;
                  
                  return (
                    <Button
                      key={quizName}
                      variant="outline"
                      size="sm"
                      className="w-full h-auto p-3 text-left justify-start hover:bg-accent hover:border-primary/50"
                      onClick={() => handleViewQuizDetail(quizName)}
                    >
                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate flex-1">{quizName}</h4>
                          <Eye className="h-3 w-3 ml-2 shrink-0" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{studentsWithResponses} estudantes</span>
                          <span>{quizResponses.length} respostas</span>
                          <Badge variant="outline" className="text-xs h-5">
                            {accuracy}% acerto
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Testes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-purple-600" />
                Testes Avaliativos ({totalTestSubmissions})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {uniqueTests.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhum teste encontrado
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {uniqueTests.map((testName) => {
                  const testSubmissions = studentsData.flatMap(student => 
                    student.testSubmissions.filter(submission => submission.testName === testName)
                  );
                  const passedSubmissions = testSubmissions.filter(submission => submission.passed).length;
                  const avgScore = testSubmissions.length > 0 
                    ? Math.round(testSubmissions.reduce((sum, sub) => sum + sub.percentage, 0) / testSubmissions.length)
                    : 0;
                  const studentsWithSubmissions = new Set(
                    studentsData.filter(student => 
                      student.testSubmissions.some(submission => submission.testName === testName)
                    ).map(student => student.studentId)
                  ).size;
                  
                  return (
                    <Button
                      key={testName}
                      variant="outline"
                      size="sm"
                      className="w-full h-auto p-3 text-left justify-start hover:bg-accent hover:border-primary/50"
                      onClick={() => handleViewTestDetail(testName)}
                    >
                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate flex-1">{testName}</h4>
                          <Eye className="h-3 w-3 ml-2 shrink-0" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{studentsWithSubmissions} estudantes</span>
                          <span>{testSubmissions.length} submissões</span>
                          <Badge variant="outline" className="text-xs h-5">
                            {avgScore}% média
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {passedSubmissions} aprovados
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Estudantes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Performance Individual dos Estudantes</CardTitle>
          <CardDescription className="text-sm">Desempenho detalhado de cada aluno</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Estudante</TableHead>
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
                          <div className="font-medium text-sm">{student.studentName}</div>
                          <div className="text-xs text-muted-foreground">{student.studentEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">{student.quizStats.accuracy}%</div>
                          <div className="text-xs text-muted-foreground">
                            {student.quizStats.correctAnswers}/{student.quizStats.totalAnswered}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">{student.testStats.averageScore}%</div>
                          <div className="text-xs text-muted-foreground">
                            {student.testStats.testsPass}/{student.testStats.totalTests} aprovado
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1.5">
                          <div className="text-sm font-medium">{overallPerformance}%</div>
                          <Progress value={overallPerformance} className="h-1.5 w-20 mx-auto" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};