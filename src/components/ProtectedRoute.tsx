
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsProfessor } from '@/hooks/useIsProfessor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getAutoDetectedProfile, setSelectedProfile } from '@/lib/profile';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'Admin' | 'Aluno' | 'Professor';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false, isLoading: checkingProfessor } = useIsProfessor(user?.id || undefined);
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();

  if (loading || checkingAdmin || checkingProfessor || loadingCurrentUser) {
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

  // Auto-detect and set profile if needed
  const detectedProfile = getAutoDetectedProfile(isAdmin, isProfessor);
  
  // Auto-save the detected profile for consistency across sessions
  if (detectedProfile) {
    setSelectedProfile(detectedProfile);
  }
  
  console.log('ProtectedRoute Debug:', {
    requiredRole,
    detectedProfile,
    isAdmin,
    isProfessor,
    userId: user.id
  });
  
  if (requiredRole) {
    // Admins têm acesso a todas as áreas
    if (isAdmin) {
      return <>{children}</>;
    }
    
    if (requiredRole === 'Admin' && detectedProfile !== 'Admin') {
      console.log('Redirecting to /aluno because required Admin but detected:', detectedProfile);
      return <Navigate to="/aluno" replace />;
    }
    if (requiredRole === 'Aluno' && detectedProfile !== 'Aluno') {
      // Se é professor, vai para área do professor
      if (detectedProfile === 'Professor') {
        console.log('Redirecting to /professor because required Aluno but detected: Professor');
        return <Navigate to="/professor" replace />;
      }
      // Se é admin, vai para dashboard
      console.log('Redirecting to /dashboard because required Aluno but detected:', detectedProfile);
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRole === 'Professor' && detectedProfile !== 'Professor') {
      console.log('Redirecting based on detected profile:', detectedProfile);
      if (detectedProfile === 'Admin') return <Navigate to="/dashboard" replace />;
      return <Navigate to="/aluno" replace />;
    }
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
