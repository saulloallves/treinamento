import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTestDetailedData } from "@/hooks/useTestDetailedData";
import { Target, XCircle, ArrowLeft, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface TestDetailedViewProps {
  turmaId: string;
  testName: string;
  onBack: () => void;
}

export const TestDetailedView = ({ turmaId, testName, onBack }: TestDetailedViewProps) => {
  const { data: testData, isLoading, error } = useTestDetailedData(turmaId, testName);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Record<string, boolean>>({});

  const toggleSubmission = (submissionId: string) => {
    setExpandedSubmissions(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
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
            Erro ao carregar dados detalhados do teste.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!testData || testData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{testName}</CardTitle>
              <CardDescription>Nenhuma submissão encontrada</CardDescription>
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

  const testInfo = testData[0]; // Assumindo que todos os dados são do mesmo teste

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{testName}</CardTitle>
              <CardDescription>Submissões detalhadas por estudante</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Submissões dos Estudantes */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Submissões</CardTitle>
          <CardDescription>Clique em uma submissão para ver as respostas detalhadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudante</TableHead>
                <TableHead className="text-center">Pontuação</TableHead>
                <TableHead className="text-center">Percentual</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Tentativa</TableHead>
                <TableHead className="text-center">Tempo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testInfo.submissions.map((submission) => (
                <>
                  <TableRow key={submission.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.studentName}</div>
                        <div className="text-sm text-muted-foreground">{submission.studentEmail}</div>
                      </div>
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
                    <TableCell className="text-center">
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSubmission(submission.id)}
                          >
                            {expandedSubmissions[submission.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                  
                  {expandedSubmissions[submission.id] && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/30">
                        <div className="p-4">
                          <h4 className="font-medium mb-3">Respostas Detalhadas</h4>
                          <div className="space-y-3">
                            {submission.responses.map((response, index) => (
                              <div key={response.questionId} className="border rounded-lg p-3 bg-background">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium">Pergunta {index + 1}</h5>
                                  <div className="text-sm text-muted-foreground">
                                    {response.scoreObtained}/{response.maxScore} pontos
                                  </div>
                                </div>
                                <p className="text-sm mb-2">{response.questionText}</p>
                                <div className="text-sm">
                                  <strong>Resposta:</strong> {response.selectedOptionText}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};