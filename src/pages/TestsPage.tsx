import { useState } from "react";
import { Plus, FileText, Users, Calendar, BarChart3 } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTests } from "@/hooks/useTests";
import CreateTestDialog from "@/components/tests/CreateTestDialog";
import TestCard from "@/components/tests/TestCard";
import TestDashboard from "@/components/tests/TestDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import FloatingActionButton from "@/components/mobile/FloatingActionButton";

const TestsPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const { data: tests, isLoading } = useTests();
  const isMobile = useIsMobile();

  if (selectedTestId) {
    return (
      <TestDashboard 
        testId={selectedTestId} 
        onBack={() => setSelectedTestId(null)} 
      />
    );
  }

  const activeTests = tests?.filter(test => test.status === 'active') || [];
  const draftTests = tests?.filter(test => test.status === 'draft') || [];
  const archivedTests = tests?.filter(test => test.status === 'archived') || [];

  return (
    <BaseLayout title="Testes de Avaliação">
      <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">Testes de Avaliação</h1>
              <p className="text-muted-foreground">Crie e gerencie testes para avaliar o aprendizado dos alunos</p>
            </div>
            {!isMobile && (
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Teste
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tests?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Testes Ativos</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeTests.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{draftTests.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Arquivados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{archivedTests.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tests List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tests && tests.length > 0 ? (
          <div className="space-y-6">
            {/* Active Tests */}
            {activeTests.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Testes Ativos</h2>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {activeTests.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeTests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onViewDashboard={() => setSelectedTestId(test.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Draft Tests */}
            {draftTests.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Rascunhos</h2>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    {draftTests.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftTests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onViewDashboard={() => setSelectedTestId(test.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Archived Tests */}
            {archivedTests.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Arquivados</h2>
                  <Badge variant="secondary">
                    {archivedTests.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {archivedTests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onViewDashboard={() => setSelectedTestId(test.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum teste criado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece criando seu primeiro teste de avaliação para os alunos
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Teste
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mobile FAB */}
        {isMobile && (
          <FloatingActionButton
            onClick={() => setCreateDialogOpen(true)}
            icon={Plus}
            label="Novo Teste"
          />
        )}

        <CreateTestDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </BaseLayout>
  );
};

export default TestsPage;