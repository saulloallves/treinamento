import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const [hasStudentProfile, setHasStudentProfile] = useState(false);
  const [checkingStudent, setCheckingStudent] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  
  useEffect(() => {
    const checkStudentProfile = async () => {
      if (!user?.id) return;
      
      try {
        const [{ data: studentData }, { data: enrollmentData }] = await Promise.all([
          supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
        ]);
          
        setHasStudentProfile(!!studentData || (enrollmentData && enrollmentData.length > 0));
      } catch (error) {
        console.error('Error checking student profile:', error);
        setHasStudentProfile(false);
      } finally {
        setCheckingStudent(false);
      }
    };
    
    if (user?.id && !hasRedirected) {
      checkStudentProfile();
    }
  }, [user?.id, hasRedirected]);

  // Loading state
  if (loading || checkingAdmin || checkingProfessor || checkingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Prevent multiple redirects
  if (hasRedirected) {
    return null;
  }

  // Check for user role selection
  const selectedRole = (() => {
    try {
      return sessionStorage.getItem('SELECTED_ROLE');
    } catch {
      return null;
    }
  })();

  // Execute user choice if available
  if (selectedRole) {
    try {
      sessionStorage.removeItem('SELECTED_ROLE');
      sessionStorage.setItem('USER_ROLE_CLAIM', 
        selectedRole === 'Aluno' ? 'student' : 
        selectedRole === 'Professor' ? 'teacher' : 
        selectedRole === 'Admin' ? 'admin' : ''
      );
    } catch {}
    
    setHasRedirected(true);
    
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

  // Automatic role detection - set role claim for RoleGuard
  try {
    if (isAdmin) {
      sessionStorage.setItem('USER_ROLE_CLAIM', 'admin');
      setHasRedirected(true);
      return <Navigate to="/dashboard" replace />;
    }
    
    if (isProfessor) {
      sessionStorage.setItem('USER_ROLE_CLAIM', 'teacher');
      setHasRedirected(true);
      return <Navigate to="/professor" replace />;
    }
    
    if (hasStudentProfile) {
      sessionStorage.setItem('USER_ROLE_CLAIM', 'student');
      setHasRedirected(true);
      return <Navigate to="/aluno" replace />;
    }
  } catch {}

  // No valid profile found
  setHasRedirected(true);
  return <Navigate to="/auth" replace />;
};

export default RoleRedirect;