import { useState } from "react";
import { BarChart3, Filter, Download, FileText } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvaluationReports } from "@/components/reports/EvaluationReports";
import { useTurmas } from "@/hooks/useTurmas";
import { useCourses } from "@/hooks/useCourses";
import TurmaStatusFilters from "@/components/common/TurmaStatusFilters";

const ReportsPage = () => {
  const [selectedTurma, setSelectedTurma] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");
  const [statusFilter, setStatusFilter] = useState("ativas");
  
  const { data: turmas } = useTurmas();
  const { data: courses } = useCourses();

  // Filter turmas by status
  const filteredTurmas = turmas?.filter(turma => {
    if (statusFilter === "ativas") {
      return turma.status === 'em_andamento' || turma.status === 'agendada';
    } else if (statusFilter === "arquivadas") {
      return turma.status === 'encerrada' || turma.status === 'cancelada';
    } else {
      return turma.status === statusFilter;
    }
  }) || [];

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: Implementar exportação
    console.log(`Exportando relatório em ${format}`);
  };

  return (
    <BaseLayout title="">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios de Avaliações</h1>
            <p className="text-muted-foreground">
              Análise completa do desempenho em quizzes e testes avaliativos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')} className="gap-2">
              <FileText className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>
              Filtre os dados por turma, curso e período para análises específicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status da Turma</label>
              <TurmaStatusFilters 
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Turma</label>
                <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as turmas filtradas</SelectItem>
                    {filteredTurmas?.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.name || turma.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Curso</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cursos</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="180">Últimos 6 meses</SelectItem>
                    <SelectItem value="all">Todo o período</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="detailed">Relatório Detalhado</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <EvaluationReports 
              filters={{
                turmaId: selectedTurma !== "all" ? selectedTurma : undefined,
                courseId: selectedCourse !== "all" ? selectedCourse : undefined,
                statusFilter: statusFilter,
                startDate: selectedPeriod !== "all" ? 
                  new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString() : 
                  undefined
              }}
            />
          </TabsContent>

          <TabsContent value="detailed">
            <EvaluationReports 
              detailed={true}
              filters={{
                turmaId: selectedTurma !== "all" ? selectedTurma : undefined,
                courseId: selectedCourse !== "all" ? selectedCourse : undefined,
                statusFilter: statusFilter,
                startDate: selectedPeriod !== "all" ? 
                  new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString() : 
                  undefined
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </BaseLayout>
  );
};

export default ReportsPage;