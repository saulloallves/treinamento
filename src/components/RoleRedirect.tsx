import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { setSelectedProfile, getSelectedProfile } from "@/lib/profile";
import { toast } from 'sonner';

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checking } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();

  useEffect(() => {
    document.title = "Direcionando...";
  }, []);

  // Debug logging to identify stuck loading states
  useEffect(() => {
    console.log('🔍 RoleRedirect Debug:', {
      user: !!user,
      userId: user?.id,
      loading,
      checking,
      checkingProfessor,
      loadingCurrentUser,
      isAdmin,
      isProfessor,
      currentUser: !!currentUser,
      storedProfile: getSelectedProfile()
    });

    // Log the decision path
    if (!loading && !checking && !checkingProfessor && !loadingCurrentUser && user) {
      console.log('🎯 RoleRedirect Decision:', {
        hasStudentProfile: !!currentUser,
        isProfessorOnly: isProfessor && !isAdmin,
        isAdminOnly: isAdmin && !currentUser && !isProfessor,
        isStudentOnly: !isAdmin && !isProfessor && !!currentUser,
        hasMultipleProfiles: isAdmin && (!!currentUser || isProfessor),
        storedProfile: getSelectedProfile()
      });
    }
  }, [user, loading, checking, checkingProfessor, loadingCurrentUser, isAdmin, isProfessor, currentUser]);

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

  // Check if user has student profile (exists in users table)
  const hasStudentProfile = !!currentUser;

  // Professor redirect (se é APENAS professor)
  if (isProfessor && !isAdmin) {
    setSelectedProfile('Professor');
    return <Navigate to="/professor" replace />;
  }

  // Se é APENAS admin (sem perfil de aluno), vai direto para dashboard
  if (isAdmin && !hasStudentProfile && !isProfessor) {
    setSelectedProfile('Admin'); // Só agora salva o perfil
    return <Navigate to="/dashboard" replace />;
  }

  // Se é APENAS aluno (sem ser admin nem professor), vai para área do aluno
  if (!isAdmin && !isProfessor && hasStudentProfile) {
    setSelectedProfile('Aluno'); // Só agora salva o perfil
    return <Navigate to="/aluno" replace />;
  }

  // Se tem múltiplos perfis (admin + aluno/professor), verificar preferência stored
  if (isAdmin && (hasStudentProfile || isProfessor)) {
    const storedProfile = getSelectedProfile();
    
    // Se tem preferência armazenada e é válida para este usuário, usar ela
    if (storedProfile === 'Admin' && isAdmin) {
      return <Navigate to="/dashboard" replace />;
    } else if (storedProfile === 'Aluno' && hasStudentProfile) {
      return <Navigate to="/aluno" replace />;
    } else if (storedProfile === 'Professor' && isProfessor) {
      return <Navigate to="/professor" replace />;
    } else {
      // Se não tem preferência válida, ir para seleção de perfil
      return <Navigate to="/perfil" replace />;
    }
  }

  // Fallback - se não tem nenhum perfil válido
  return <Navigate to="/auth" replace />;
};

export default RoleRedirect;
