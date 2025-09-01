import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { getSelectedProfile } from "@/lib/profile";

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checking } = useIsAdmin(user?.id || undefined);
  const [hasStudentProfile, setHasStudentProfile] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = "Direcionando...";
    
    const checkStudentProfile = async () => {
      if (!user?.id) {
        setHasStudentProfile(false);
        return;
      }
      
      try {
        const { data: studentData, error } = await supabase
          .from('users')
          .select('id, user_type, role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('RoleRedirect - Error fetching student data:', error);
          setHasStudentProfile(false);
        } else {
          setHasStudentProfile(!!studentData);
        }
      } catch (e) {
        console.error('RoleRedirect - Exception:', e);
        setHasStudentProfile(false);
      }
    };
    
    checkStudentProfile();
  }, [user?.id]);

  if (loading || checking || hasStudentProfile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const selectedProfile = getSelectedProfile();

  // Se o usuário tem ambos os perfis (admin E aluno), verificar preferência
  if (isAdmin && hasStudentProfile) {
    if (selectedProfile === 'Admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (selectedProfile === 'Aluno') {
      return <Navigate to="/aluno" replace />;
    } else {
      return <Navigate to="/perfil" replace />;
    }
  }

  // Se só é admin, vai para dashboard
  if (isAdmin && !hasStudentProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se só é aluno, vai para área do aluno
  if (!isAdmin && hasStudentProfile) {
    return <Navigate to="/aluno" replace />;
  }

  // Fallback - se não tem nenhum perfil válido
  return <Navigate to="/auth" replace />;
};

export default RoleRedirect;
