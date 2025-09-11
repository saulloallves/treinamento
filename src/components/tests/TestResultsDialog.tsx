import { useState } from "react";
import { Eye, Download, TrendingUp, Users, Award, FileX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TestResultsDialogProps {
  testId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TestResultsDialog = ({ testId, open, onOpenChange }: TestResultsDialogProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - replace with real data from hooks
  const mockResults = {
    totalSubmissions: 45,
    averageScore: 78.5,
    passRate: 82.2,
    completionRate: 91.1,
    submissions: [
      {
        id: "1",
        student: { name: "Ana Silva", email: "ana@email.com", unit: "Loja Centro" },
        score: 85,
        percentage: 85,
        passed: true,
        attempts: 1,
        submittedAt: "2024-01-15T10:30:00Z",
        timeTaken: 15
      },
      {
        id: "2", 
        student: { name: "Carlos Santos", email: "carlos@email.com", unit: "Loja Norte" },
        score: 92,
        percentage: 92,
        passed: true,
        attempts: 1,
        submittedAt: "2024-01-15T11:15:00Z",
        timeTaken: 12
      },
      {
        id: "3",
        student: { name: "Maria Oliveira", email: "maria@email.com", unit: "Loja Sul" },
        score: 65,
        percentage: 65,
        passed: false,
        attempts: 2,
        submittedAt: "2024-01-15T14:20:00Z",
        timeTaken: 18
      }
    ]
  };

  const handleExportResults = () => {
    // Implementation for exporting results
    console.log("Exporting results...");
  };

  if (!testId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resultados do Teste
          </DialogTitle>
          <DialogDescription>
            Análise detalhada de performance e resultados dos alunos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="individual">Resultados Individuais</TabsTrigger>
            <TabsTrigger value="analytics">Análise por Questão</TabsTrigger>
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Submissões</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockResults.totalSubmissions}</div>
                  <p className="text-xs text-muted-foreground">
                    de 50 alunos matriculados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockResults.averageScore}%</div>
                  <Progress value={mockResults.averageScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {mockResults.passRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    37 de 45 aprovados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                  <FileX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockResults.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    5 não completaram
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Performance</CardTitle>
                <CardDescription>
                  Análise da distribuição de notas dos alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">90-100%</span>
                    <div className="flex items-center gap-2">
                      <Progress value={20} className="w-32" />
                      <span className="text-sm text-muted-foreground">9 alunos</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">80-89%</span>
                    <div className="flex items-center gap-2">
                      <Progress value={35} className="w-32" />
                      <span className="text-sm text-muted-foreground">16 alunos</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">70-79%</span>
                    <div className="flex items-center gap-2">
                      <Progress value={27} className="w-32" />
                      <span className="text-sm text-muted-foreground">12 alunos</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Abaixo de 70%</span>
                    <div className="flex items-center gap-2">
                      <Progress value={18} className="w-32" />
                      <span className="text-sm text-muted-foreground">8 alunos</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleExportResults}>
                <Download className="h-4 w-4 mr-1" />
                Exportar Relatório
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Resultados por Aluno</h3>
              <Button variant="outline" onClick={handleExportResults}>
                <Download className="h-4 w-4 mr-1" />
                Exportar Lista
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tentativas</TableHead>
                      <TableHead>Tempo</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockResults.submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {submission.student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{submission.student.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {submission.student.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{submission.student.unit}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{submission.percentage}%</span>
                            <Progress value={submission.percentage} className="w-16" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={submission.passed ? "default" : "destructive"}>
                            {submission.passed ? "Aprovado" : "Reprovado"}
                          </Badge>
                        </TableCell>
                        <TableCell>{submission.attempts}</TableCell>
                        <TableCell>{submission.timeTaken} min</TableCell>
                        <TableCell>
                          {new Date(submission.submittedAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Análise por Questão</CardTitle>
                <CardDescription>
                  Performance detalhada em cada questão do teste
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Análise detalhada por questão será implementada aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evolution">
            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Alunos</CardTitle>
                <CardDescription>
                  Comparação de performance entre múltiplos testes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Análise de evolução será implementada aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};