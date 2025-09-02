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
      <div className="space-y-4">
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
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              • Quando um colaborador se cadastra no sistema usando o código da sua unidade ({currentUser.unit_code}), 
              uma solicitação de aprovação é criada automaticamente.
            </p>
            <p>
              • Você recebe uma notificação e pode aprovar ou rejeitar o acesso do colaborador.
            </p>
            <p>
              • Após a aprovação, o colaborador poderá acessar o sistema normalmente.
            </p>
            <p>
              • Colaboradores rejeitados não conseguirão fazer login no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default CollaboratorManagement;