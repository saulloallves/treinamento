
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsProfessor } from '@/hooks/useIsProfessor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getAutoDetectedProfile, setSelectedProfile, getSelectedProfile } from '@/lib/profile';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'Admin' | 'Aluno' | 'Professor';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, authProcessing } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();

  if (loading || checkingAdmin || checkingProfessor || loadingCurrentUser || authProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    // If there's a stored Supabase session token, wait for rehydration instead of redirecting immediately
    const hasToken = (() => {
      try {
        return !!localStorage.getItem('sb-tctkacgbhqvkqovctrzf-auth-token');
      } catch {
        return false;
      }
    })();

    if (hasToken) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    return <Navigate to="/auth" replace />;
  }

  // Approval status checking is now handled in useAuth.signIn
  // This prevents the "trembling" effect from multiple components checking the same thing

  // Check for profile selection if user has multiple profiles
  const profileCount = [isAdmin, isProfessor, !!currentUser].filter(Boolean).length;
  const selectedProfile = getSelectedProfile();
  
  // If user has multiple profiles but no selection, redirect to profile selection
  if (profileCount > 1 && !selectedProfile) {
    return <Navigate to="/perfil" replace />;
  }
  
  // If user has single profile, auto-detect and set it
  if (profileCount === 1 && !selectedProfile) {
    const autoProfile = getAutoDetectedProfile(isAdmin, isProfessor);
    if (autoProfile) {
      setSelectedProfile(autoProfile);
    }
  }
  
  console.log('ProtectedRoute Debug:', {
    requiredRole,
    selectedProfile,
    isAdmin,
    isProfessor,
    userId: user.id
  });
  
  // Role-based access control with profile selection respect
  if (requiredRole) {
    if (requiredRole === 'Admin') {
      if (!isAdmin) {
        return <Navigate to="/aluno" replace />;
      }
      // If user selected a different profile, redirect accordingly
      if (selectedProfile && selectedProfile !== 'Admin') {
        if (selectedProfile === 'Professor') return <Navigate to="/professor" replace />;
        if (selectedProfile === 'Aluno') return <Navigate to="/aluno" replace />;
      }
    }
    
    if (requiredRole === 'Professor') {
      if (!isProfessor && !isAdmin) {
        return <Navigate to="/aluno" replace />;
      }
      // If user selected a different profile, redirect accordingly
      if (selectedProfile && selectedProfile !== 'Professor' && selectedProfile !== 'Admin') {
        if (selectedProfile === 'Aluno') return <Navigate to="/aluno" replace />;
        if (isAdmin) return <Navigate to="/dashboard" replace />;
      }
    }
    
    if (requiredRole === 'Aluno') {
      if (!currentUser && !isAdmin && !isProfessor) {
        return <Navigate to="/auth" replace />;
      }
      // If user selected a different profile, redirect accordingly
      if (selectedProfile && selectedProfile !== 'Aluno') {
        if (selectedProfile === 'Admin' && isAdmin) return <Navigate to="/dashboard" replace />;
        if (selectedProfile === 'Professor' && isProfessor) return <Navigate to="/professor" replace />;
      }
    }
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
