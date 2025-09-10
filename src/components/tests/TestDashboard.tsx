import { useState } from "react";
import { ArrowLeft, Plus, Settings, BarChart3, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BaseLayout from "@/components/BaseLayout";
import { useTest } from "@/hooks/useTests";
import TestQuestionsManager from "./TestQuestionsManager";
import TestResultsView from "./TestResultsView";
import TestReportsView from "./TestReportsView";

interface TestDashboardProps {
  testId: string;
  onBack: () => void;
}

const TestDashboard = ({ testId, onBack }: TestDashboardProps) => {
  const { data: test, isLoading } = useTest(testId);

  if (isLoading) {
    return (
      <BaseLayout title="Carregando...">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (!test) {
    return (
      <BaseLayout title="Teste não encontrado">
        <div className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Teste não encontrado</p>
            <Button onClick={onBack} variant="outline">
              Voltar
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'draft':
        return 'Rascunho';
      case 'archived':
        return 'Arquivado';
      default:
        return status;
    }
  };

  return (
    <BaseLayout title={`Dashboard: ${test.name}`}>
      <div className="p-3 sm:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para testes
          </Button>
          
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-foreground">
                  {test.name}
                </h1>
                <Badge variant="outline" className={getStatusColor(test.status)}>
                  {getStatusText(test.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Curso: {test.courses?.name}</span>
                <span>Turma: {test.turmas?.name}</span>
                <span>Taxa de Aprovação: {test.passing_percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perguntas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {test.test_questions?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {test.passing_percentage}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tentativas Máx.</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {test.max_attempts}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="questions">Perguntas</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            <TestQuestionsManager testId={testId} />
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <TestResultsView testId={testId} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <TestReportsView testId={testId} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Teste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configurações do teste em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </BaseLayout>
  );
};

export default TestDashboard;