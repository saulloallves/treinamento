
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { Button } from "@/components/ui/button";
import ModernSidebar from "@/components/ModernSidebar";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useState, useEffect } from "react";

interface BaseLayoutProps {
  title: string;
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const BaseLayout = ({ title, children, showBottomNav = true }: BaseLayoutProps) => {
  const { user, signOut } = useAuth();
  const { selectedProfile } = useProfile();
  const isMobile = useIsMobile();
  const { data: isProfessor } = useIsProfessor(user?.id);
  const { data: isAdmin } = useIsAdmin(user?.id);
  
  console.log('🔍 BaseLayout - User info:', {
    userId: user?.id,
    isAdmin,
    isProfessor,
    selectedProfile
  });
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

  // Listen for localStorage changes to update layout
  useEffect(() => {
    const handleStorageChange = () => {
      setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for direct localStorage changes in the same tab
    const interval = setInterval(() => {
      const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      if (collapsed !== sidebarCollapsed) {
        setSidebarCollapsed(collapsed);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [sidebarCollapsed]);
  
  // Determinar se deve mostrar sidebar baseado na preferência do usuário
  const shouldShowSidebar = (() => {
    console.log('🔍 BaseLayout - Determining sidebar visibility:', { selectedProfile, isAdmin, isProfessor });
    
    // Se o usuário escolheu "Aluno", não mostrar sidebar de admin/professor
    if (selectedProfile === 'Aluno') {
      console.log('🔍 BaseLayout - User chose Aluno, hiding sidebar');
      return false;
    }
    
    // Se escolheu Admin e é admin, mostrar
    if (selectedProfile === 'Admin' && isAdmin) {
      console.log('🔍 BaseLayout - User chose Admin and is admin, showing sidebar');
      return true;
    }
    
    // Se escolheu Professor e é professor, mostrar
    if (selectedProfile === 'Professor' && isProfessor) {
      console.log('🔍 BaseLayout - User chose Professor and is professor, showing sidebar');
      return true;
    }
    
    // Se não há preferência, usar lógica padrão
    if (!selectedProfile) {
      const result = isAdmin || isProfessor;
      console.log('🔍 BaseLayout - No preference, using default logic:', result);
      return result;
    }
    
    // Por padrão, não mostrar se a preferência não combina
    console.log('🔍 BaseLayout - Profile preference does not match permissions, hiding sidebar');
    return false;
  })();

  return (
    <div className="min-h-screen min-h-[100dvh] flex bg-background w-full min-w-0 items-start">
      {/* Mostrar sidebar apenas quando shouldShowSidebar for true */}
      {shouldShowSidebar && (
        <ModernSidebar showInMobile={shouldShowSidebar} />
      )}
      
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${
        !isMobile && shouldShowSidebar
          ? sidebarCollapsed 
            ? 'ml-16' 
            : 'ml-64' 
          : ''
      }`}>
        {/* Header responsivo - sticky e sem border inferior */}
        <header className="bg-background sticky top-0 z-20 px-3 md:px-8 py-4 md:py-6">
          <div className={`w-full flex justify-between items-center ${isMobile && shouldShowSidebar ? 'pl-12' : ''}`}>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-1 truncate">
                {title}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                Bem-vindo, {user?.user_metadata?.full_name || user?.email}!
              </p>
            </div>
            <Button 
              onClick={signOut}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-2 ml-3 shrink-0 h-8 md:h-10"
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4" />
              {!isMobile && "Sair"}
            </Button>
          </div>
        </header>

        {/* Conteúdo principal responsivo - com padding top reduzido */}
        <main className={`flex-1 min-h-0 p-3 md:p-6 pt-2 md:pt-4 overflow-y-auto overflow-x-hidden ${isMobile && showBottomNav ? 'pb-[calc(8rem+env(safe-area-inset-bottom))]' : 'pb-6'}`}>
          <div className="w-full min-w-0 space-y-4">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default BaseLayout;
