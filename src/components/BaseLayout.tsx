
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen min-h-[100dvh] flex bg-background w-full items-start">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header responsivo */}
        <header className="bg-background border-b border-border px-3 md:px-8 py-3 md:py-6 relative z-10">
          <div className={`w-full flex justify-between items-center ${isMobile ? 'pl-12' : 'max-w-7xl mx-auto'}`}>
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
        <main className={`flex-1 p-3 md:p-6 overflow-auto ${isMobile && showBottomNav ? 'pb-20' : ''} ${isMobile ? 'no-x-scroll' : ''}`}>
          <div className={`w-full ${!isMobile ? 'max-w-7xl mx-auto' : 'no-x-scroll'}`}>
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
