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
      <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
        {!selectedTurma ? (
          <>
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Testes Avaliativos</h1>
                  <p className="text-muted-foreground">Sistema completo de avaliação com pontuação diferenciada</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="turmas" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="turmas">Testes por Turma</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>

              <TabsContent value="turmas">
                <TurmaTestsList onSelectTurma={handleSelectTurma} />
              </TabsContent>

              <TabsContent value="dashboard">
                <TestsDashboard />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para turmas
              </Button>
              
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-foreground">
                    {selectedTurma.name || `Turma ${selectedTurma.code}` || "Turma"}
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
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
            </div>
            
            <TurmaTestsManager 
              turma={selectedTurma} 
              onBack={handleBack}
            />
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export default TestsPage;