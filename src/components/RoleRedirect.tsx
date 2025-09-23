import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();
  const [hasStudentProfile, setHasStudentProfile] = useState(false);
  const [redirectExecuted, setRedirectExecuted] = useState(false);
  
  useEffect(() => {
    const checkStudentProfile = async () => {
      if (!user?.id) return;
      
      // Verificar se o usuário tem inscrições (enrollments) ou existe na tabela users
      const [{ data: studentData }, { data: enrollmentData }] = await Promise.all([
        supabase
          .from('users')
          .select('id, user_type, role')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
      ]);
        
      // Considera que tem perfil de estudante se existe na tabela users OU tem enrollments
      setHasStudentProfile(!!studentData || (enrollmentData && enrollmentData.length > 0));
    };
    
    if (user?.id) {
      checkStudentProfile();
    }
  }, [user?.id]);

  console.log('🏠 RoleRedirect check:', {
    user: !!user,
    loading,
    checkingAdmin,
    checkingProfessor,
    loadingCurrentUser,
    isAdmin,
    isProfessor,
    hasStudentProfile,
    redirectExecuted
  });

  if (loading || checkingAdmin || checkingProfessor || loadingCurrentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Evitar múltiplos redirecionamentos
  if (redirectExecuted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // SOLUÇÃO: Verificar a escolha do usuário PRIMEIRO
  const selectedRole = (() => {
    try {
      return sessionStorage.getItem('SELECTED_ROLE');
    } catch {
      return null;
    }
  })();

  // EXECUTAR A ESCOLHA DO USUÁRIO SEM QUESTIONAMENTO
  if (selectedRole) {
    console.log('🎯 Executing user role choice:', selectedRole);
    
    // Limpar imediatamente para evitar loops e marcar redirect como executado
    try {
      sessionStorage.removeItem('SELECTED_ROLE');
      setRedirectExecuted(true);
    } catch {}

    // Redirecionar baseado APENAS na escolha
    if (selectedRole === 'Aluno') {
      return <Navigate to="/aluno" replace />;
    }
    if (selectedRole === 'Professor') { 
      return <Navigate to="/professor" replace />;
    }
    if (selectedRole === 'Admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // FALLBACK APENAS se não há escolha específica
  console.log('📋 Using fallback role detection');
  setRedirectExecuted(true);
  
  // Prioridade: Admin > Professor > Aluno
  if (isAdmin) {
    console.log('👑 Redirecting to admin dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isProfessor) {
    console.log('👨‍🏫 Redirecting to professor dashboard');
    return <Navigate to="/professor" replace />;
  }
  
  if (hasStudentProfile) {
    console.log('🎓 Redirecting to student portal');
    return <Navigate to="/aluno" replace />;
  }

  // Se não tem nenhum perfil válido, redirecionar para auth
  console.log('❌ No valid profile found, redirecting to auth');
  return <Navigate to="/auth" replace />;
};

export default RoleRedirect;