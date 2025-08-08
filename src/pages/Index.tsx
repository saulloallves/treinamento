
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header clean e moderno */}
        <header className="bg-brand-white border-b border-gray-200 px-8 py-6 shadow-clean">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-brand-black mb-2">
                Dashboard de Treinamentos
              </h1>
              <p className="text-brand-gray-dark">
                Bem-vindo, {user?.user_metadata?.full_name || user?.email}!
              </p>
            </div>
            <Button 
              onClick={signOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Dashboard />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
