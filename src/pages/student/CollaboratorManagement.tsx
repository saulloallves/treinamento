import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import FranchiseeCollaboratorApprovals from "@/components/student/FranchiseeCollaboratorApprovals";
import ApprovedCollaboratorsList from "@/components/student/ApprovedCollaboratorsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useUnitCollaborationApprovals } from "@/hooks/useCollaborationApprovals";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CollaboratorManagement = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { refetch: refetchApprovals, isRefetching } = useUnitCollaborationApprovals(currentUser?.unit_code || "");
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Gestão de Colaboradores | Área do Aluno";
  }, []);

  const handleRefresh = async () => {
    try {
      if (currentUser?.unit_code) {
        await queryClient.invalidateQueries({ queryKey: ['unit-collaboration-approvals', currentUser.unit_code] });
        await queryClient.invalidateQueries({ queryKey: ['approved-collaborators', currentUser.unit_code] });
        await refetchApprovals();
        toast.success("Dados atualizados com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };

  if (isLoading) {
    return (
      <BaseLayout title="Gestão de Colaboradores">
        <div className="flex items-center justify-center py-8">
          <p>Carregando...</p>
        </div>
      </BaseLayout>
    );
  }

  // Verificar se o usuário tem permissão para acessar esta página
  if (!currentUser || currentUser.role !== 'Franqueado' || !currentUser.unit_code) {
    return (
      <BaseLayout title="Gestão de Colaboradores">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este módulo está disponível apenas para franqueados com código de unidade válido.
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Gestão de Colaboradores">
      <div className="space-y-6 w-full">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 rounded-xl p-3 sm:p-4 md:p-6">
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-foreground break-words">
                Gestão de Colaboradores
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                Gerencie colaboradores da unidade{" "}
                <span className="font-medium text-primary break-all">{currentUser.unit_code}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-4 md:gap-6 pb-4">
          <ApprovedCollaboratorsList 
            unitCode={currentUser.unit_code}
            onRefresh={handleRefresh}
            isRefreshing={isRefetching}
          />
          
          <FranchiseeCollaboratorApprovals 
            unitCode={currentUser.unit_code}
            onRefresh={handleRefresh}
            isRefreshing={isRefetching}
          />
          
          {/* Information Card */}
          <Card className="border-2 border-dashed border-muted">
            <CardHeader className="pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Como funciona?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5 shrink-0">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                      <strong>Cadastro automático:</strong> Quando um colaborador se cadastra usando o código{" "}
                      <span className="inline-block mx-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded font-mono break-all">
                        {currentUser.unit_code}
                      </span>{" "}
                      uma solicitação é criada automaticamente.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5 shrink-0">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                      <strong>Análise e aprovação:</strong> Você recebe uma notificação e pode aprovar ou rejeitar o acesso do colaborador.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5 shrink-0">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                      <strong>Acesso liberado:</strong> Após a aprovação, o colaborador poderá acessar o sistema normalmente.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-destructive/5 border border-destructive/10 rounded-lg">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-destructive/10 rounded-full flex items-center justify-center text-xs font-medium text-destructive mt-0.5 shrink-0">
                    !
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                      <strong>Colaboradores rejeitados</strong> não conseguirão fazer login no sistema.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
};

export default CollaboratorManagement;