import { useState } from "react";
import { Users, FileText, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTests } from "@/hooks/useTests";
import { ManageTestDialog } from "./ManageTestDialog";
import { TestResultsDialog } from "./TestResultsDialog";
import { useToast } from "@/hooks/use-toast";

interface TestsListProps {
  refreshTrigger: number;
  onCreateTest?: () => void;
  customTests?: any[];
}

export const TestsList = ({ refreshTrigger, onCreateTest, customTests }: TestsListProps) => {
  const { data: allTests, isLoading, deleteTest } = useTests();
  const { toast } = useToast();
  
  // Use custom tests if provided, otherwise use all tests
  const tests = customTests || allTests;
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Rascunho", variant: "secondary" as const },
      active: { label: "Ativo", variant: "default" as const },
      archived: { label: "Arquivado", variant: "outline" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDeleteTest = async (testId: string, testName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o teste "${testName}"? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      await deleteTest(testId);
      
      toast({
        title: "Teste excluído",
        description: "O teste foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir o teste.",
        variant: "destructive",
      });
    }
  };

  const handleTestClick = (testId: string, event: React.MouseEvent) => {
    // Prevent event if clicking on results button or delete button
    if ((event.target as HTMLElement).closest('[data-results-button]') ||
        (event.target as HTMLElement).closest('[data-delete-button]')) {
      return;
    }
    
    // Default action: open question management
    setSelectedTestId(testId);
    setManageDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
    );
  }

  if (!tests?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum teste encontrado</h3>
          <p className="text-muted-foreground text-center mb-4">
            Use o botão "Criar Novo Teste" no canto superior direito para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tests.map((test) => (
          <Card 
            key={test.id} 
            className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/50"
            onClick={(e) => handleTestClick(test.id, e)}
          >
            <CardHeader className="pb-3">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2 flex-1">{test.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(test.status)}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      data-delete-button="true"
                      onClick={(e) => handleDeleteTest(test.id, test.name, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {test.description || "Clique para gerenciar este teste"}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {test.max_attempts} tentativa{test.max_attempts > 1 ? 's' : ''}
                </span>
                <span className="text-sm font-medium">
                  {test.passing_percentage}% para aprovação
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Turma:</span>
                  <span className="font-medium">
                    {(test as any).turmas?.name || 'Turma não encontrada'}
                  </span>
                </div>

                {test.time_limit_minutes && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Tempo:</span>
                    <span className="font-medium">{test.time_limit_minutes} minutos</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    Clique para {test.status === 'draft' ? 'configurar perguntas' : 'gerenciar teste'}
                  </span>
                  {test.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-results-button="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTestId(test.id);
                        setResultsDialogOpen(true);
                      }}
                    >
                      Ver Resultados
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ManageTestDialog
        testId={selectedTestId}
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
      />

      <TestResultsDialog
        testId={selectedTestId}
        open={resultsDialogOpen}
        onOpenChange={setResultsDialogOpen}
      />

    </>
  );
};