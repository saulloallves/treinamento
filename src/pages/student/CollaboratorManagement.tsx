import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import FranchiseeCollaboratorApprovals from "@/components/student/FranchiseeCollaboratorApprovals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, AlertCircle } from "lucide-react";

const CollaboratorManagement = () => {
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    document.title = "Gestão de Colaboradores | Área do Aluno";
  }, []);

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
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">Gestão de Colaboradores</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie as solicitações de acesso dos colaboradores da unidade {currentUser.unit_code}
        </p>
      </header>

      <main>
        <FranchiseeCollaboratorApprovals unitCode={currentUser.unit_code} />
        
        <div className="mt-6">
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
      </main>
    </BaseLayout>
  );
};

export default CollaboratorManagement;