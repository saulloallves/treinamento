import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import AdminsList from "@/components/users/AdminsList";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { ShieldCheck } from "lucide-react";

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
        {/* Header Compacto */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Gestão de Administradores</h1>
              <p className="text-xs text-muted-foreground">Gerencie administradores do sistema</p>
            </div>
          </div>
        </div>

        <AdminsList />
      </div>
    </BaseLayout>
  );
};

export default AdminsPage;