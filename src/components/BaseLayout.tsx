
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";

interface BaseLayoutProps {
  title: string;
  children: React.ReactNode;
}

const BaseLayout = ({ title, children }: BaseLayoutProps) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header moderno e responsivo */}
        <header className="page-header px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="container-modern flex justify-between items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-foreground mb-1 lg:mb-2">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Bem-vindo, {user?.user_metadata?.full_name || user?.email}!
              </p>
            </div>
            <Button 
              onClick={signOut}
              variant="outline"
              className="flex items-center gap-2 hover-lift focus-ring"
            >
              <LogOut className="h-4 w-4" />
              <span className="mobile-hidden">Sair</span>
            </Button>
          </div>
        </header>

        {/* Conteúdo principal com espaçamento responsivo */}
        <main className="page-content">
          <div className="container-modern">
            <div className="animate-fade-in-up">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
