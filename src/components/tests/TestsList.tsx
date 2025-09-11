import { useState, useEffect } from "react";
import { Edit, Eye, Play, Users, FileText, MoreVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTests } from "@/hooks/useTests";
import { ManageTestDialog } from "./ManageTestDialog";
import { TestResultsDialog } from "./TestResultsDialog";
import { CreateTestDialog } from "./CreateTestDialog";

interface TestsListProps {
  refreshTrigger: number;
  onCreateTest?: () => void;
}

export const TestsList = ({ refreshTrigger, onCreateTest }: TestsListProps) => {
  const { data: tests, isLoading } = useTests();
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    console.log("TestsList createDialogOpen state changed to:", createDialogOpen);
  }, [createDialogOpen]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Rascunho", variant: "secondary" as const },
      active: { label: "Ativo", variant: "default" as const },
      archived: { label: "Arquivado", variant: "outline" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleManageTest = (testId: string) => {
    setSelectedTestId(testId);
    setManageDialogOpen(true);
  };

  const handleViewResults = (testId: string) => {
    setSelectedTestId(testId);
    setResultsDialogOpen(true);
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
            Comece criando seu primeiro teste avaliativo
          </p>
          <Button onClick={() => {
            console.log("Criar Primeiro Teste button clicked, current createDialogOpen:", createDialogOpen);
            setCreateDialogOpen(true);
            console.log("setCreateDialogOpen(true) called");
          }}>Criar Primeiro Teste</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg line-clamp-2">{test.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {test.description || "Sem descrição"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleManageTest(test.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Gerenciar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewResults(test.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Resultados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                {getStatusBadge(test.status)}
                <span className="text-sm text-muted-foreground">
                  {test.max_attempts} tentativa{test.max_attempts > 1 ? 's' : ''}
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
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Taxa de Aprovação:</span>
                  <span className="font-medium">{test.passing_percentage}%</span>
                </div>

                {test.time_limit_minutes && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Tempo Limite:</span>
                    <span className="font-medium">{test.time_limit_minutes} minutos</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleManageTest(test.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Gerenciar
                </Button>
                
                {test.status === 'active' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleViewResults(test.id)}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Resultados
                  </Button>
                )}
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

      <CreateTestDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          console.log("CreateTestDialog onOpenChange called with:", open);
          setCreateDialogOpen(open);
        }}
        onTestCreated={() => {
          console.log("onTestCreated called");
          setCreateDialogOpen(false);
          onCreateTest?.();
        }}
      />
    </>
  );
};