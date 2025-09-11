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

  // Debug logging to identify stuck loading states
  useEffect(() => {
    console.log('RoleRedirect Debug:', {
      user: !!user,
      userId: user?.id,
      loading,
      checking,
      checkingProfessor,
      loadingCurrentUser,
      isAdmin,
      isProfessor,
      currentUser: !!currentUser,
      authProcessing
    });
  }, [user, loading, checking, checkingProfessor, loadingCurrentUser, isAdmin, isProfessor, currentUser, authProcessing]);

  // Show loading only while essential auth data is loading
  if (loading || checking || checkingProfessor || loadingCurrentUser || authProcessing) {
    console.log('RoleRedirect - Still loading:', { loading, checking, checkingProfessor, loadingCurrentUser, authProcessing });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Approval status checking is now handled in useAuth.signIn
  // This prevents the "trembling" effect from multiple components checking the same thing

  // Auto-detect and set profile
  const detectedProfile = getAutoDetectedProfile(isAdmin, isProfessor);
  
  // Auto-save the detected profile for consistency across sessions
  if (detectedProfile) {
    setSelectedProfile(detectedProfile);
  }

  // Check if user has student profile (exists in users table)
  const hasStudentProfile = !!currentUser;

  // Professor redirect
  if (isProfessor && !isAdmin) {
    return <Navigate to="/professor" replace />;
  }

  // Se o usuário tem múltiplos perfis (admin + aluno/professor), verificar preferência
  if (isAdmin && (hasStudentProfile || isProfessor)) {
    console.log('RoleRedirect - Admin with multiple profiles, redirecting to:', detectedProfile);
    if (detectedProfile === 'Admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (detectedProfile === 'Aluno') {
      return <Navigate to="/aluno" replace />;
    } else if (detectedProfile === 'Professor') {
      return <Navigate to="/professor" replace />;
    } else {
      return <Navigate to="/perfil" replace />;
    }
  }

  // Se só é admin, vai para dashboard
  if (isAdmin && !hasStudentProfile && !isProfessor) {
    console.log('RoleRedirect - Admin only, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Se só é aluno, vai para área do aluno
  if (!isAdmin && !isProfessor && hasStudentProfile) {
    return <Navigate to="/aluno" replace />;
  }

  // Fallback - se não tem nenhum perfil válido
  return <Navigate to="/auth" replace />;
};

export default RoleRedirect;
