import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getAutoDetectedProfile, setSelectedProfile } from "@/lib/profile";
import { toast } from 'sonner';

const RoleRedirect = () => {
  const { user, loading, authProcessing } = useAuth();
  const { data: isAdmin = false, isLoading: checking } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();

  useEffect(() => {
    document.title = "Direcionando...";
  }, []);

  // Debug logging detalhado
  console.log('RoleRedirect Debug State:', {
    user: !!user,
    userId: user?.id,
    loading,
    checking,
    checkingProfessor,
    loadingCurrentUser,
    isAdmin,
    isProfessor,
    currentUser: !!currentUser,
    authProcessing,
    currentUrl: window.location.href,
    currentPath: window.location.pathname
  });

  // Show loading only while essential auth data is loading
  if (loading || checking || checkingProfessor || loadingCurrentUser || authProcessing) {
    console.log('RoleRedirect - Still loading, waiting...', { 
      loading, 
      checking, 
      checkingProfessor, 
      loadingCurrentUser, 
      authProcessing,
      currentPath: window.location.pathname 
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('RoleRedirect - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Auto-detect and set profile
  const detectedProfile = getAutoDetectedProfile(isAdmin, isProfessor);
  
  // Auto-save the detected profile for consistency across sessions
  if (detectedProfile) {
    setSelectedProfile(detectedProfile);
  }

  // Check if user has student profile (exists in users table)
  const hasStudentProfile = !!currentUser;
  
  console.log('RoleRedirect - Profile Detection:', {
    isAdmin,
    isProfessor,
    detectedProfile,
    hasStudentProfile,
    currentPath: window.location.pathname,
    willRedirectTo: isAdmin ? '/dashboard' : (isProfessor && !isAdmin ? '/professor' : (!isAdmin && !isProfessor && hasStudentProfile ? '/aluno' : '/auth'))
  });

  // PRIORIDADE ABSOLUTA: Se é admin, SEMPRE vai para dashboard (independente de outros perfis)
  if (isAdmin) {
    console.log('RoleRedirect - ADMIN DETECTED - redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Professor redirect (apenas se não for admin)
  if (isProfessor && !isAdmin) {
    console.log('RoleRedirect - Professor detected, redirecting to professor area');
    return <Navigate to="/professor" replace />;
  }

  // Se só é aluno, vai para área do aluno
  if (!isAdmin && !isProfessor && hasStudentProfile) {
    console.log('RoleRedirect - Student profile detected, redirecting to student area');
    return <Navigate to="/aluno" replace />;
  }

  // Fallback - se não tem nenhum perfil válido
  console.log('RoleRedirect - No valid profile detected, redirecting to auth');
  return <Navigate to="/auth" replace />;
};

export default RoleRedirect;