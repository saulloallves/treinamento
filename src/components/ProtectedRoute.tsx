
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getAutoDetectedProfile, setSelectedProfile } from '@/lib/profile';
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

  // Auto-detect and set profile if needed
  const detectedProfile = getAutoDetectedProfile(isAdmin);
  
  // Auto-save the detected profile for consistency across sessions
  if (detectedProfile) {
    setSelectedProfile(detectedProfile);
  }
  
  console.log('ProtectedRoute Debug:', {
    requiredRole,
    detectedProfile,
    isAdmin,
    userId: user.id
  });
  
  if (requiredRole) {
    if (requiredRole === 'Admin' && detectedProfile !== 'Admin') {
      console.log('Redirecting to /aluno because required Admin but detected:', detectedProfile);
      return <Navigate to="/aluno" replace />;
    }
    if (requiredRole === 'Aluno' && detectedProfile !== 'Aluno') {
      console.log('Redirecting to /dashboard because required Aluno but detected:', detectedProfile);
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
