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
  
  // Prioridade: Admin > Professor > Aluno
  if (isAdmin) {
    console.log('RoleRedirect - Admin user, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isProfessor) {
    console.log('RoleRedirect - Professor user, redirecting to professor area');
    return <Navigate to="/professor" replace />;
  }
  
  if (hasStudentProfile) {
    console.log('RoleRedirect - Student user, redirecting to student area');
    return <Navigate to="/aluno" replace />;
  }

  // Se não conseguiu determinar o perfil, redirecionar para auth
  console.log('RoleRedirect - Unable to determine user role, redirecting to auth');
  return <Navigate to="/auth" replace />;
};

export default RoleRedirect;