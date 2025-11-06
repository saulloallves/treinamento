
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsProfessor } from '@/hooks/useIsProfessor';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'Admin' | 'Aluno' | 'Professor';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, authProcessing } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();

  // Adicionado 'currentUser === null' para aguardar o carregamento inicial do perfil
  if (loading || checkingAdmin || checkingProfessor || loadingCurrentUser || authProcessing || currentUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    // If there's a stored Supabase session token, wait for rehydration instead of redirecting immediately
    const hasToken = (() => {
      try {
        return !!localStorage.getItem('sb-yhjwdoiaafaajhlsxoyt-auth-token');
      } catch {
        return false;
      }
    })();

    if (hasToken) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    return <Navigate to="/auth" replace />;
  }

  // Approval status checking is now handled in useAuth.signIn
  // This prevents the "trembling" effect from multiple components checking the same thing
  
  console.log('ProtectedRoute Debug:', {
    requiredRole,
    isAdmin,
    isProfessor,
    userId: user.id
  });
  
  // Role-based access control
  if (requiredRole) {
    if (requiredRole === 'Admin') {
      if (!isAdmin) {
        return <Navigate to="/aluno" replace />;
      }
    }
    
    if (requiredRole === 'Professor') {
      if (!isProfessor && !isAdmin) {
        return <Navigate to="/aluno" replace />;
      }
    }
    
    if (requiredRole === 'Aluno') {
      if (!currentUser && !isAdmin && !isProfessor) {
        return <Navigate to="/auth" replace />;
      }
    }
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
