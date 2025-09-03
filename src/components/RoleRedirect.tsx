import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getAutoDetectedProfile, setSelectedProfile } from "@/lib/profile";
import { toast } from 'sonner';

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checking } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();

  useEffect(() => {
    document.title = "Direcionando...";
  }, []);

  // Show loading only while essential auth data is loading
  if (loading || checking || checkingProfessor || loadingCurrentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if collaborator is pending or rejected - redirect to auth with message
  if (currentUser?.role === 'Colaborador' && currentUser?.approval_status !== 'aprovado') {
    const message = currentUser?.approval_status === 'pendente' 
      ? "Seu cadastro como colaborador está em análise pelo franqueado da unidade. Aguarde a aprovação para acessar o sistema."
      : "Seu cadastro como colaborador foi rejeitado pelo franqueado da unidade.";
    
    toast.error("Acesso negado", { description: message });
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

  // Professor redirect
  if (isProfessor && !isAdmin) {
    return <Navigate to="/professor" replace />;
  }

  // Se o usuário tem múltiplos perfis (admin + aluno/professor), verificar preferência
  if (isAdmin && (hasStudentProfile || isProfessor)) {
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
