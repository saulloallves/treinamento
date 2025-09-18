
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import ModernSidebar from "@/components/modern/ModernSidebar";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { getSelectedProfile } from "@/lib/profile";
import { useSidebarState } from "@/hooks/useSidebarState";

interface BaseLayoutProps {
  title: string;
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const BaseLayout = ({ title, children, showBottomNav = true }: BaseLayoutProps) => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const { data: isProfessor } = useIsProfessor(user?.id);
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { isOpen: sidebarOpen } = useSidebarState();
  
  // Determinar se deve mostrar sidebar baseado no perfil selecionado
  const selectedProfile = getSelectedProfile();
  const shouldShowSidebar = selectedProfile === 'Admin' || selectedProfile === 'Professor' || isAdmin || isProfessor;

  return (
    <div className="min-h-screen min-h-[100dvh] flex bg-gradient-to-br from-background via-background to-muted/20 w-full min-w-0">
      {/* Mostrar sidebar para admins/professores mesmo no mobile */}
      {(shouldShowSidebar || !(isMobile && showBottomNav)) && (
        <ModernSidebar showInMobile={shouldShowSidebar || !showBottomNav} />
      )}
      
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-400 ease-out ${
        !isMobile && shouldShowSidebar ? (sidebarOpen ? 'ml-68' : 'ml-18') : ''
      }`}>
        {/* Header responsivo */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 px-3 md:px-8 py-3 md:py-6 relative z-10 rounded-xl m-2 shadow-sm">
          <div className={`w-full flex justify-between items-center ${
            isMobile && shouldShowSidebar ? 'pl-16' : isMobile && !showBottomNav ? 'pl-16' : ''
          }`}>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-1 md:mb-2 truncate">
                {title}
              </h1>
              <p className="text-xs md:text-base text-muted-foreground truncate">
                Bem-vindo, {user?.user_metadata?.full_name || user?.email}!
              </p>
            </div>
            <Button 
              onClick={signOut}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-2 shrink-0 h-8 md:h-10 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 rounded-full border-white/20"
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4" />
              {!isMobile && "Sair"}
            </Button>
          </div>
        </header>

        {/* Conteúdo principal responsivo */}
        <main className={`flex-1 min-h-0 p-3 md:p-6 overflow-y-auto overflow-x-hidden ${
          isMobile && showBottomNav ? 'pb-[calc(8rem+env(safe-area-inset-bottom))]' : 'pb-6'
        }`}>
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
