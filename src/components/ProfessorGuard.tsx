import { ReactNode } from 'react';
import { useProfessorAccess } from '@/hooks/useProfessorAccess';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/hooks/useAuth';

interface ProfessorGuardProps {
  children: ReactNode;
  module: string;
  permission?: 'view' | 'edit';
  field?: string;
  fallback?: ReactNode;
  adminBypass?: boolean; // Se true, admins sempre veem o conteúdo
}

/**
 * Componente que controla a visibilidade de elementos baseado nas permissões do professor
 * 
 * @param children - Conteúdo a ser renderizado se houver permissão
 * @param module - Nome do módulo a verificar
 * @param permission - Tipo de permissão ('view' ou 'edit')
 * @param field - Campo específico a verificar (opcional)
 * @param fallback - Conteúdo a ser renderizado se não houver permissão
 * @param adminBypass - Se admins devem sempre ver o conteúdo (padrão: true)
 */
const ProfessorGuard = ({ 
  children, 
  module, 
  permission = 'view', 
  field,
  fallback = null,
  adminBypass = true
}: ProfessorGuardProps) => {
  const { user } = useAuth();
  const { data: isAdmin = false } = useIsAdmin(user?.id);
  const { canView, canEdit, hasField, isLoading } = useProfessorAccess();

  // Admins sempre têm acesso se adminBypass for true
  if (adminBypass && isAdmin) {
    return <>{children}</>;
  }

  // Enquanto carrega, não mostra nada para evitar flash
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Verificar permissão do módulo
  const hasModulePermission = permission === 'edit' ? canEdit(module) : canView(module);
  
  // Se não tem permissão no módulo, não mostra
  if (!hasModulePermission) {
    return <>{fallback}</>;
  }

  // Se tem um campo específico para verificar
  if (field) {
    const hasFieldPermission = hasField(module, field);
    if (!hasFieldPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default ProfessorGuard;