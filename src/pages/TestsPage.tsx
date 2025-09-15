import { useState } from "react";
import { Plus } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTestDialog } from "@/components/tests/CreateTestDialog";
import { TestsList } from "@/components/tests/TestsList";
import { TestsDashboard } from "@/components/tests/TestsDashboard";


const TestsPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTestCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setCreateDialogOpen(false);
  };

  return (
    <BaseLayout title="Testes Avaliativos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Testes Avaliativos</h1>
            <p className="text-muted-foreground">
              Sistema completo de avaliação com pontuação diferenciada
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Novo Teste
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tests" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tests">Meus Testes</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <TestsList 
              refreshTrigger={refreshTrigger} 
              onCreateTest={handleTestCreated}
            />
          </TabsContent>

          <TabsContent value="dashboard">
            <TestsDashboard />
          </TabsContent>

        </Tabs>

        <CreateTestDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onTestCreated={handleTestCreated}
        />
      </div>
    </BaseLayout>
  );
};

export default TestsPage;