
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface BaseLayoutProps {
  title: string;
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const BaseLayout = ({ title, children, showBottomNav = true }: BaseLayoutProps) => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider 
      defaultOpen={!isMobile}
    >
      <div className="min-h-screen min-h-[100dvh] flex bg-background w-full min-w-0">
        <Sidebar />
        
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header responsivo */}
          <header className="bg-background border-b border-border px-3 md:px-8 py-3 md:py-6 relative z-10">
            <div className={`w-full flex justify-between items-center ${isMobile ? 'pl-12' : 'max-w-7xl mx-auto'}`}>
              {/* Mobile Sidebar Trigger */}
              {isMobile && (
                <SidebarTrigger className="absolute top-3 left-3 z-50" />
              )}
              
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-3xl font-bold text-foreground mb-1 md:mb-2 truncate">
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
                className="flex items-center gap-2 ml-3 shrink-0 h-8 md:h-10"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                {!isMobile && "Sair"}
              </Button>
            </div>
          </header>

          {/* Conteúdo principal responsivo */}
          <main className={`flex-1 min-h-0 p-3 md:p-6 overflow-y-auto overflow-x-hidden ${isMobile && showBottomNav ? 'pb-20' : ''}`}>
            <div className={`w-full min-w-0 ${!isMobile ? 'max-w-7xl mx-auto' : ''}`}>
              {children}
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        {isMobile && showBottomNav && <BottomNavigation />}
      </div>
    </SidebarProvider>
  );
};

export default BaseLayout;
