import { useState } from "react";
import { BarChart3, Filter } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <BaseLayout title="Relatórios de Avaliações">
      <div className="space-y-6">
        {/* Header Section - Compacto */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Análise de Desempenho</h2>
              <p className="text-sm text-muted-foreground">Análise completa do desempenho em quizzes e testes avaliativos</p>
            </div>
          </div>
        </div>

        {/* Filtros - Mais compactos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
            <CardDescription className="text-sm">
              Filtre os dados por turma, curso e período
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Status Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status da Turma</label>
              <TurmaStatusFilters 
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Turma</label>
                <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as turmas</SelectItem>
                    {filteredTurmas
                      ?.filter((turma) => turma.status === 'agendada' || turma.status === 'em_andamento' || turma.status === 'encerrada')
                      ?.map((turma) => (
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