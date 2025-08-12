
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'Admin' | 'Aluno';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const role = isAdmin ? 'Admin' : 'Aluno';
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'Admin' ? '/' : '/aluno'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
