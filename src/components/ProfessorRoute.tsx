import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsProfessor } from '@/hooks/useIsProfessor';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface ProfessorRouteProps {
  children: ReactNode;
}

const ProfessorRoute = ({ children }: ProfessorRouteProps) => {
  const { user, loading } = useAuth();
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id);
  const { data: isAdmin = false } = useIsAdmin(user?.id);

  if (loading || checkingProfessor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins sempre têm acesso às rotas de professor
  if (isAdmin) {
    return <>{children}</>;
  }

  if (!isProfessor) {
    return <Navigate to="/aluno" replace />;
  }

  return <>{children}</>;
};

export default ProfessorRoute;