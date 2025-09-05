import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import ProfessorsList from "@/components/professors/ProfessorsList";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const ProfessorsPage = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);

  useEffect(() => {
    document.title = "Gerenciar Professores | Sistema";
  }, []);

  if (!isAdmin) {
    return (
      <BaseLayout title="Acesso Negado">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Gerenciar Professores">
      <div className="space-y-6">
        <ProfessorsList />
      </div>
    </BaseLayout>
  );
};

export default ProfessorsPage;