import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import AdminRoute from "@/components/AdminRoute";
import Index from "@/pages/Index";

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checking } = useIsAdmin(user?.id || undefined);

  useEffect(() => {
    document.title = "Direcionando...";
  }, []);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isAdmin) {
    // Renderiza o dashboard protegido quando admin
    return (
      <AdminRoute>
        <Index />
      </AdminRoute>
    );
  }

  // Demais vão para a área do aluno
  return <Navigate to="/aluno" replace />;
};

export default RoleRedirect;
