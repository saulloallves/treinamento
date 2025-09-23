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
    return <Navigate to="/auth" replace />;
  }

  // Verificar se há uma preferência de perfil salva
  let selectedProfile: string | null = null;
  try {
    selectedProfile = localStorage.getItem('selected_profile');
  } catch {
    // Silent fail
  }

  // Redirecionar baseado na preferência do usuário, se existir
  if (selectedProfile) {
    if (selectedProfile === 'Admin' && isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    
    if (selectedProfile === 'Professor' && isProfessor) {
      return <Navigate to="/professor" replace />;
    }
    
    if (selectedProfile === 'Aluno') {
      // Para aluno, permitir acesso mesmo que seja admin/professor
      // Qualquer usuário autenticado pode acessar como aluno
      return <Navigate to="/aluno" replace />;
    }
    
    // Se a preferência não é válida, limpar e continuar
    try {
      localStorage.removeItem('selected_profile');
    } catch {
      // Silent fail
    }
  }

  // Redirecionar baseado na hierarquia de permissões (fallback quando não há preferência)
  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isProfessor) {
    return <Navigate to="/professor" replace />;
  }
  
  if (hasStudentProfile) {
    return <Navigate to="/aluno" replace />;
  }

  // Se não conseguiu determinar o perfil, redirecionar para auth
  return <Navigate to="/auth" replace />;
};

export default RoleRedirect;