import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsProfessor } from '@/hooks/useIsProfessor';
import { useCheckProfessorPermission } from '@/hooks/useProfessorAccess';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface ProtectedProfessorRouteProps {
  children: ReactNode;
  module: string;
  permissionType?: 'view' | 'edit';
  fallbackPath?: string;
}

const ProtectedProfessorRoute = ({ 
  children, 
  module, 
  permissionType = 'view',
  fallbackPath = '/professor'
}: ProtectedProfessorRouteProps) => {
  const { user, loading } = useAuth();
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id);
  const { data: isAdmin = false } = useIsAdmin(user?.id);
  const { data: hasPermission = false, isLoading: checkingPermission } = useCheckProfessorPermission(module, permissionType);

  if (loading || checkingProfessor || checkingPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins sempre têm acesso total
  if (isAdmin) {
    return <>{children}</>;
  }

  if (!isProfessor) {
    return <Navigate to="/aluno" replace />;
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar este módulo ({module}).
          </p>
          <p className="text-sm text-gray-500">
            Entre em contato com o administrador para solicitar acesso.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedProfessorRoute;