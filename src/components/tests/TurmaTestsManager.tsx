import { useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTests } from "@/hooks/useTests";
import { TestsList } from "./TestsList";
import { CreateTestDialog } from "./CreateTestDialog";
import { Turma } from "@/hooks/useTurmas";

interface TurmaTestsManagerProps {
  turma: Turma;
  onBack: () => void;
}

const TurmaTestsManager = ({ turma, onBack }: TurmaTestsManagerProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: allTests } = useTests();
  
  // Filter tests for this turma
  const turmaTests = allTests?.filter(test => test.turma_id === turma.id) || [];

  const handleTestCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            Testes - {turma.name || turma.code || 'Turma'}
          </h2>
          <p className="text-muted-foreground">
            {turmaTests.length} teste{turmaTests.length !== 1 ? 's' : ''} cadastrado{turmaTests.length !== 1 ? 's' : ''} para esta turma
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Novo Teste
        </Button>
      </div>

      {/* Custom TestsList component that shows only tests for this turma */}
      <TurmaSpecificTestsList 
        tests={turmaTests}
        refreshTrigger={refreshTrigger}
      />

      {/* Create Test Dialog */}
      <CreateTestDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onTestCreated={handleTestCreated}
        preSelectedTurma={turma}
      />
    </div>
  );
};

// Component to show only tests for specific turma
const TurmaSpecificTestsList = ({ tests, refreshTrigger }: { tests: any[], refreshTrigger: number }) => {
  if (!tests || tests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhum teste encontrado
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Esta turma ainda não possui testes cadastrados.
        </p>
        <p className="text-xs text-muted-foreground">
          Clique em "Criar Novo Teste" para adicionar o primeiro teste.
        </p>
      </div>
    );
  }

  return <TestsList refreshTrigger={refreshTrigger} customTests={tests} />;
};

export default TurmaTestsManager;