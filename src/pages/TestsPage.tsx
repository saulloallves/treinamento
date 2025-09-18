import { useState } from "react";
import { ArrowLeft, ClipboardList, Users, Calendar } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Turma } from "@/hooks/useTurmas";
import TurmaTestsList from "@/components/tests/TurmaTestsList";
import TurmaTestsManager from "@/components/tests/TurmaTestsManager";
import { TestsDashboard } from "@/components/tests/TestsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TestsPage = () => {
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

  const handleSelectTurma = (turma: Turma) => {
    setSelectedTurma(turma);
  };

  const handleBack = () => {
    setSelectedTurma(null);
  };

  return (
    <BaseLayout title="Testes Avaliativos">
      {!selectedTurma ? (
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Sistema completo de avaliação com pontuação diferenciada</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="turmas" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-2 w-auto">
                <TabsTrigger value="turmas">Testes por Turma</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="turmas" className="space-y-0">
              <TurmaTestsList onSelectTurma={handleSelectTurma} />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-0">
              <TestsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para turmas
          </Button>
          
          {/* Selected Turma Header */}
          <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-lg border-l-4 border-primary">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {selectedTurma.name || `Turma ${selectedTurma.code}` || "Turma"}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {selectedTurma.enrollments_count || 0} inscritos
                </div>
                {selectedTurma.start_at && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedTurma.start_at).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <TurmaTestsManager 
            turma={selectedTurma} 
            onBack={handleBack}
          />
        </div>
      )}
    </BaseLayout>
  );
};

export default TestsPage;