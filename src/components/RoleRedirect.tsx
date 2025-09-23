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
  
  useEffect(() => {
    const checkStudentProfile = async () => {
      if (!user?.id) return;
      
      console.log('🔍 CHECKING STUDENT PROFILE FOR USER:', user.id, user.email);
      
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
      
      console.log('🔍 STUDENT DATA CHECK:', {
        studentData,
        enrollmentData,
        enrollmentCount: enrollmentData?.length || 0
      });
        
      // Considera que tem perfil de estudante se existe na tabela users OU tem enrollments
      const hasStudent = !!studentData || (enrollmentData && enrollmentData.length > 0);
      console.log('🔍 FINAL hasStudentProfile VALUE:', hasStudent);
      setHasStudentProfile(hasStudent);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('RoleRedirect - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // SOLUÇÃO DEFINITIVA: Ler o role selecionado DIRETAMENTE
  const selectedRole = (() => {
    try {
      return sessionStorage.getItem('SELECTED_ROLE');
    } catch {
      return null;
    }
  })();

  console.log('🎯 SELECTED ROLE FROM SESSION:', selectedRole);
  console.log('🎯 USER PERMISSIONS:', { isAdmin, isProfessor, hasStudentProfile });

  // EXECUTAR ESCOLHA DO USUÁRIO SEM QUESTIONAMENTO
  if (selectedRole === 'Aluno') {
    console.log('🟢 REDIRECTING TO STUDENT AREA');
    try { sessionStorage.removeItem('SELECTED_ROLE'); } catch {}
    return <Navigate to="/aluno" replace />;
  }
  
  if (selectedRole === 'Professor') {
    console.log('🟡 REDIRECTING TO PROFESSOR AREA');
    try { sessionStorage.removeItem('SELECTED_ROLE'); } catch {}
    return <Navigate to="/professor" replace />;
  }
  
  if (selectedRole === 'Admin') {
    console.log('🔵 REDIRECTING TO ADMIN AREA');
    try { sessionStorage.removeItem('SELECTED_ROLE'); } catch {}
    return <Navigate to="/dashboard" replace />;
  }

  // Se não há preferência ou a preferência não é válida, usar prioridade padrão
  // Prioridade: Admin > Professor > Aluno
  if (isAdmin) {
    console.log('RoleRedirect - User is admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isProfessor) {
    console.log('RoleRedirect - User is professor, redirecting to professor area');
    return <Navigate to="/professor" replace />;
  }
  
  if (hasStudentProfile) {
    console.log('RoleRedirect - User is student, redirecting to student area');
    return <Navigate to="/aluno" replace />;
  }

  // Se não tem nenhum perfil válido, redirecionar para auth
  console.log('RoleRedirect - No valid profile found, redirecting to auth');
  return <Navigate to="/auth" replace />;
};

export default RoleRedirect;