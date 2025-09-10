import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();
  const { data: isAdmin = false, isLoading } = useIsAdmin(user?.id || undefined);

  if (loading || isLoading || loadingCurrentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if collaborator is pending or rejected - block completely
  if (currentUser?.role === 'Colaborador' && currentUser?.approval_status !== 'aprovado') {
    const message = currentUser?.approval_status === 'pendente' 
      ? "Seu cadastro como colaborador está em análise pelo franqueado da unidade. Aguarde a aprovação para acessar o sistema."
      : "Seu cadastro como colaborador foi rejeitado pelo franqueado da unidade.";
    
    toast.error("Acesso negado", { description: message });
    return <Navigate to="/auth" replace />;
  }

  // Only check if user is admin - don't redirect based on profile selection
  if (!isAdmin) {
    console.log('AdminRoute: Redirecting non-admin to /aluno', { isAdmin });
    return <Navigate to="/aluno" replace />;
  }

  // Admin has access to all areas - no profile restriction
  return <>{children}</>;
};

export default AdminRoute;
