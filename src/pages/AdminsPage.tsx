import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import AdminsList from "@/components/users/AdminsList";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const AdminsPage = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);

  useEffect(() => {
    document.title = "Gerenciar Administradores | Sistema";
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
    <BaseLayout title="Gerenciar Administradores">
      <div className="space-y-6">
        <AdminsList />
      </div>
    </BaseLayout>
  );
};

export default AdminsPage;