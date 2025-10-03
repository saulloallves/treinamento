import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import ProfessorsList from "@/components/professors/ProfessorsList";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { GraduationCap } from "lucide-react";

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
        {/* Header Compacto */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Gestão de Professores</h1>
              <p className="text-xs text-muted-foreground">Gerencie professores e suas permissões</p>
            </div>
          </div>
        </div>

        <ProfessorsList />
      </div>
    </BaseLayout>
  );
};

export default ProfessorsPage;