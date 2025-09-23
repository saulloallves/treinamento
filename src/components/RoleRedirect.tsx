import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getSelectedProfile } from "@/lib/profile";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();
  const [hasStudentProfile, setHasStudentProfile] = useState(false);
  
  useEffect(() => {
    const checkStudentProfile = async () => {
      if (!user?.id) return;
      
      const { data: studentData } = await supabase
        .from('users')
        .select('id, user_type, role')
        .eq('id', user.id)
        .maybeSingle();
        
      setHasStudentProfile(!!studentData);
    };
    
    if (user?.id) {
      checkStudentProfile();
    }
  }, [user?.id]);

  console.log('RoleRedirect:', { 
    user: !!user, 
    loading, 
    isAdmin, 
    isProfessor, 
    hasStudentProfile,
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

  // Contar quantos perfis o usuário possui
  const profileCount = [isAdmin, isProfessor, hasStudentProfile].filter(Boolean).length;
  
  // Se o usuário não é Admin nem Professor, mas tem um perfil na tabela users, é um Aluno
  if (!isAdmin && !isProfessor && hasStudentProfile) {
    console.log('RoleRedirect - Student only profile, redirecting to student area');
    return <Navigate to="/aluno" replace />;
  }
  
  // Se tem apenas um perfil, redirecionar diretamente
  if (isAdmin && profileCount === 1) {
    console.log('RoleRedirect - Single admin profile, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isProfessor && profileCount === 1) {
    console.log('RoleRedirect - Single professor profile, redirecting to professor area');
    return <Navigate to="/professor" replace />;
  }
  
  // Se o usuário tem múltiplos perfis, verificar se já selecionou um
  if (profileCount > 1) {
    const selectedProfile = getSelectedProfile();
    if (!selectedProfile) {
      console.log('RoleRedirect - Multiple profiles, no selection, redirecting to profile selection');
      return <Navigate to="/perfil" replace />;
    }
    
    // Redirecionar baseado no perfil selecionado
    if (selectedProfile === 'Admin' && isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    if (selectedProfile === 'Professor' && isProfessor) {
      return <Navigate to="/professor" replace />;
    }
    if (selectedProfile === 'Aluno' && hasStudentProfile) {
      return <Navigate to="/aluno" replace />;
    }
  }

  // Se não conseguiu determinar o perfil, redirecionar para seleção de perfil
  console.log('RoleRedirect - Unable to determine user role, redirecting to profile selection');
  return <Navigate to="/perfil" replace />;
};

export default RoleRedirect;