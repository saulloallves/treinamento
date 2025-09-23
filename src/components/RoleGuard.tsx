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

  if (loading || authProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
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

  // Get user role from sessionStorage
  const userRoleClaim = sessionStorage.getItem('USER_ROLE_CLAIM');
  
  // Check if user has the required role
  if (userRoleClaim !== requiredRole) {
    // Redirect to appropriate page based on role
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
        // No valid role, redirect to home for role selection
        if (location.pathname !== '/') {
          return <Navigate to="/" replace />;
        }
    }
    
    // If already on correct page but wrong role, show access denied
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
          <Button onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;