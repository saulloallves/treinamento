import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();

  console.log('RoleRedirect:', { 
    user: !!user, 
    loading, 
    isAdmin, 
    isProfessor, 
    hasCurrentUser: !!currentUser,
    checkingAdmin, 
    checkingProfessor, 
    loadingCurrentUser 
  });
  
  if (loading || checkingAdmin || checkingProfessor || loadingCurrentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('RoleRedirect - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Redirecionar baseado no perfil do usuário
  if (isAdmin) {
    console.log('RoleRedirect - Admin user, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isProfessor) {
    console.log('RoleRedirect - Professor user, redirecting to professor area');
    return <Navigate to="/professor" replace />;
  }
  
  if (currentUser) {
    console.log('RoleRedirect - Student user, redirecting to student area');
    return <Navigate to="/aluno" replace />;
  }

  // Se não conseguiu determinar o perfil, redirecionar para seleção de perfil
  console.log('RoleRedirect - Unable to determine user role, redirecting to profile selection');
  return <Navigate to="/perfil" replace />;
};

export default RoleRedirect;