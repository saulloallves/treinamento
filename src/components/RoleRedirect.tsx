import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const RoleRedirect = () => {
  const { user, loading } = useAuth();

  console.log('RoleRedirect SIMPLES:', { user: !!user, loading });
  
  if (loading) {
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

  // Por enquanto, sempre redirecionar para dashboard
  console.log('RoleRedirect - User found, redirecting to dashboard');
  return <Navigate to="/dashboard" replace />;
};

export default RoleRedirect;