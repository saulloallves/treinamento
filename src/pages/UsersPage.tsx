
import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import UsersList from "@/components/users/UsersList";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Users } from "lucide-react";

const UsersPage = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);

  useEffect(() => {
    document.title = "Usuários | Sistema";
  }, []);

  return (
    <BaseLayout title="Gerenciar Usuários">
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Gestão de Alunos</h1>
              <p className="text-xs text-muted-foreground">Gerencie alunos e suas informações</p>
            </div>
          </div>
        </div>

        <UsersList />
      </div>
    </BaseLayout>
  );
};

export default UsersPage;
