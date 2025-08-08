
import { Users, BookOpen, Award, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import RecentCourses from "@/components/RecentCourses";
import ActivityFeed from "@/components/ActivityFeed";

const Index = () => {
  const { user, signOut } = useAuth();

  const metrics = [
    {
      title: "Usuários Ativos",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users
    },
    {
      title: "Cursos Disponíveis",
      value: "87",
      change: "+5",
      changeType: "positive" as const,
      icon: BookOpen
    },
    {
      title: "Certificados Emitidos",
      value: "456",
      change: "+23%",
      changeType: "positive" as const,
      icon: Award
    },
    {
      title: "Taxa de Conclusão",
      value: "89%",
      change: "+3%",
      changeType: "positive" as const,
      icon: TrendingUp
    }
  ];

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
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <div 
                  key={index} 
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <MetricCard
                    title={metric.title}
                    value={metric.value}
                    change={metric.change}
                    changeType={metric.changeType}
                    icon={metric.icon}
                  />
                </div>
              ))}
            </div>

            {/* Seção principal */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <RecentCourses />
              </div>
              <div>
                <ActivityFeed />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
