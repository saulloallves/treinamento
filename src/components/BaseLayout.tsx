
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface BaseLayoutProps {
  title: string;
  children: React.ReactNode;
}

const BaseLayout = ({ title, children }: BaseLayoutProps) => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-background w-full items-start">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header responsivo */}
        <header className="bg-background border-b border-border px-4 md:px-8 py-4 md:py-6">
          <div className={`max-w-7xl mx-auto flex justify-between items-center ${isMobile ? 'ml-16' : ''}`}>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2 truncate">
                {title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground truncate">
                Bem-vindo, {user?.user_metadata?.full_name || user?.email}!
              </p>
            </div>
            <Button 
              onClick={signOut}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-2 ml-4 shrink-0"
            >
              <LogOut className="h-4 w-4" />
              {!isMobile && "Sair"}
            </Button>
          </div>
        </header>

        {/* Conteúdo principal responsivo */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
