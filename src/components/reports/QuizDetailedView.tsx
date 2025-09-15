import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizDetailedData } from "@/hooks/useQuizDetailedData";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QuizDetailedViewProps {
  turmaId: string;
  quizName: string;
  onBack: () => void;
}

export const QuizDetailedView = ({ turmaId, quizName, onBack }: QuizDetailedViewProps) => {
  const { data: quizData, isLoading, error } = useQuizDetailedData(turmaId, quizName);

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
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Erro ao carregar dados detalhados do quiz.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quizData || quizData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{quizName}</CardTitle>
              <CardDescription>Nenhuma resposta encontrada</CardDescription>
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
            <div>
              <CardTitle className="text-xl">{quizName}</CardTitle>
              <CardDescription>Respostas detalhadas por pergunta</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Perguntas e Respostas */}
      {quizData.map((questionData, index) => (
        <Card key={`${questionData.quizId}-${index}`}>
          <CardHeader>
            <CardTitle className="text-lg">Pergunta {index + 1}</CardTitle>
            <CardDescription className="text-base">{questionData.question}</CardDescription>
            <div className="text-sm text-muted-foreground">
              <strong>Resposta Correta:</strong> {questionData.correctAnswer}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudante</TableHead>
                  <TableHead>Resposta Selecionada</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionData.responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{response.studentName}</div>
                        <div className="text-sm text-muted-foreground">{response.studentEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{response.selectedAnswer}</div>
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
      ))}
    </div>
  );
};