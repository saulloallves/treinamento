import { useState } from "react";
import { ArrowLeft, ClipboardList, Users, Calendar } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Turma } from "@/hooks/useTurmas";
import TurmaTestsList from "@/components/tests/TurmaTestsList";
import TurmaTestsManager from "@/components/tests/TurmaTestsManager";

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
        <TurmaTestsList onSelectTurma={handleSelectTurma} />
      ) : (
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
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