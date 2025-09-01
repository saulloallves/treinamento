
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getSelectedProfile } from '@/lib/profile';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'Admin' | 'Aluno';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();

  if (loading || checkingAdmin || loadingCurrentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if collaborator is pending or rejected
  if (currentUser?.role === 'Colaborador' && currentUser?.approval_status === 'pendente') {
    toast.error("Cadastro em análise", {
      description: "Seu cadastro como colaborador está em análise pelo franqueado da unidade. Aguarde a aprovação para acessar o sistema.",
    });
    return <Navigate to="/auth" replace />;
  }

  if (currentUser?.role === 'Colaborador' && currentUser?.approval_status === 'rejeitado') {
    toast.error("Acesso negado", {
      description: "Seu cadastro como colaborador foi rejeitado pelo franqueado da unidade.",
    });
    return <Navigate to="/auth" replace />;
  }

  const selectedProfile = getSelectedProfile();
  
  console.log('ProtectedRoute Debug:', {
    requiredRole,
    selectedProfile,
    isAdmin,
    userId: user.id
  });
  
  if (requiredRole) {
    if (requiredRole === 'Admin' && selectedProfile !== 'Admin') {
      console.log('Redirecting to /aluno because required Admin but selected:', selectedProfile);
      return <Navigate to="/aluno" replace />;
    }
    if (requiredRole === 'Aluno' && selectedProfile !== 'Aluno') {
      console.log('Redirecting to /dashboard because required Aluno but selected:', selectedProfile);
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
