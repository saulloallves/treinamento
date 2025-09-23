import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
}

const RoleGuard = ({ children, requiredRole }: RoleGuardProps) => {
  const { user, loading, authProcessing } = useAuth();
  const location = useLocation();

  console.log('🔍 RoleGuard check:', {
    requiredRole,
    path: location.pathname,
    USER_ROLE_CLAIM: sessionStorage.getItem('USER_ROLE_CLAIM'),
    user: !!user,
    loading,
    authProcessing
  });

  if (loading || authProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If no specific role required, just check authentication
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Get the current user's role claim from sessionStorage
  const userRoleClaim = sessionStorage.getItem('USER_ROLE_CLAIM');
  
  // Check if user has the required role claim
  if (userRoleClaim !== requiredRole) {
    // Only log once to prevent spam
    if (Math.random() < 0.01) {
      console.log('RoleGuard: Access denied', { userRoleClaim, requiredRole, path: location.pathname });
    }
    
    // Redirect based on the user's actual role claim, avoid loops
    switch (userRoleClaim) {
      case 'admin':
        if (location.pathname !== '/dashboard') {
          return <Navigate to="/dashboard" replace />;
        }
        break;
      case 'teacher':
        if (location.pathname !== '/professor') {
          return <Navigate to="/professor" replace />;
        }
        break;
      case 'student':
        if (location.pathname !== '/aluno') {
          return <Navigate to="/aluno" replace />;
        }
        break;
      default:
        // If no valid role claim, redirect to auth only if not already there
        if (location.pathname !== '/auth') {
          return <Navigate to="/auth" replace />;
        }
    }
    
    // If we're already on the correct path for current role or auth, show access denied
    if (userRoleClaim && location.pathname === '/auth') {
      return <Navigate to="/auth" replace />;
    }
    
    // Block access but don't redirect if already on target page
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
        <Button onClick={() => window.location.href = '/auth'}>Fazer Login</Button>
      </div>
    </div>;
  }

  return <>{children}</>;
};

export default RoleGuard;