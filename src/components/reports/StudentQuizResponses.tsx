import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentQuizData } from "@/hooks/useStudentQuizData";
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  User,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StudentQuizResponsesProps {
  turmaId: string;
  studentId: string;
  studentName: string;
  quizName: string;
  onBack: () => void;
}

export const StudentQuizResponses = ({ 
  turmaId, 
  studentId,
  studentName,
  quizName,
  onBack
}: StudentQuizResponsesProps) => {
  const { data: studentData, isLoading, error } = useStudentQuizData(turmaId, studentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
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
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Erro ao carregar respostas do quiz.
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedQuiz = studentData?.quizzes.find(quiz => quiz.quizName === quizName);

  if (!selectedQuiz) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{quizName}</CardTitle>
              <CardDescription>Quiz não encontrado</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-xl">{studentName}</CardTitle>
                <CardDescription className="text-base">{quizName}</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Quizzes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{selectedQuiz.stats.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total de Perguntas</div>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{selectedQuiz.stats.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Respostas Corretas</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{selectedQuiz.stats.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Precisão</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Respostas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas Detalhadas</CardTitle>
          <CardDescription>Todas as perguntas e respostas deste quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Pergunta</TableHead>
                <TableHead>Resposta Correta</TableHead>
                <TableHead>Resposta Selecionada</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedQuiz.responses.map((response, index) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm">{response.question}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-green-700">
                      {response.correctAnswer}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm font-medium ${
                      response.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {response.selectedAnswer}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};