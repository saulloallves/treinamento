import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
}

const RoleGuard = ({ children, requiredRole }: RoleGuardProps) => {
  const { user, loading, authProcessing } = useAuth();
  const location = useLocation();

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
    console.log('RoleGuard: Access denied', { userRoleClaim, requiredRole, path: location.pathname });
    
    // Redirect based on the user's actual role claim
    switch (userRoleClaim) {
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      case 'teacher':
        return <Navigate to="/professor" replace />;
      case 'student':
        return <Navigate to="/aluno" replace />;
      default:
        // If no valid role claim, redirect to auth
        return <Navigate to="/auth" replace />;
    }
  }

  return <>{children}</>;
};

export default RoleGuard;