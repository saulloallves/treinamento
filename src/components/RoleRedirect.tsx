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
  const [timeout, setTimeout] = useState(false);

  console.log('RoleRedirect - Current state:', {
    user: !!user,
    userId: user?.id,
    loading,
    checking,
    isAdmin,
    hasStudentProfile,
    timeout,
    timestamp: new Date().toISOString()
  });

  // Add a timeout fallback to prevent infinite loading
  useEffect(() => {
    const timer = window.setTimeout(() => {
      console.log('RoleRedirect - Timeout reached, redirecting to auth');
      setTimeout(true);
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('RoleRedirect - useEffect running for user:', user?.id);
    document.title = "Direcionando...";
    
    const checkStudentProfile = async () => {
      if (!user?.id) {
        console.log('RoleRedirect - No user ID, returning early');
        setHasStudentProfile(false);
        return;
      }
      
      console.log('RoleRedirect - Checking student profile for user:', user?.id);
      try {
        const { data: studentData, error } = await supabase
          .from('users')
          .select('id, user_type, role')
          .eq('id', user.id)
          .maybeSingle();
          
        console.log('RoleRedirect - Student query result:', { studentData, error });
        
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

  // If timeout occurred, redirect to auth
  if (timeout) {
    console.log('RoleRedirect - Timeout fallback, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

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
  
  console.log('RoleRedirect Debug:', {
    isAdmin,
    hasStudentProfile,
    selectedProfile,
    userId: user.id
  });

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
