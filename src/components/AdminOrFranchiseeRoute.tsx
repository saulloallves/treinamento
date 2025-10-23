import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import BaseLayout from '@/components/BaseLayout';

const AdminOrFranchiseeRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const loading = authLoading || profileLoading;

  if (loading) {
    return <div>Carregando...</div>; // Ou um spinner de carregamento
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const userRole = profile?.role;
  const isAuthorized = userRole === 'Admin' || userRole === 'Franqueado';

  if (!isAuthorized) {
    // Redireciona para uma página inicial apropriada se não for autorizado
    return <Navigate to="/" />;
  }

  return <BaseLayout>{children}</BaseLayout>;
};

export default AdminOrFranchiseeRoute;
