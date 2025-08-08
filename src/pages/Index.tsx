
import { Users, BookOpen, Award, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import RecentCourses from "@/components/RecentCourses";
import ActivityFeed from "@/components/ActivityFeed";

const Index = () => {
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
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header profissional */}
        <header className="header-bg border-b border-border p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-brand-gray-dark mb-2">
              Dashboard de Treinamentos
            </h1>
            <p className="text-brand-gray font-medium">
              Gerencie e acompanhe o progresso dos treinamentos da sua organização
            </p>
          </div>
        </header>

        {/* Conteúdo principal centralizado */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  changeType={metric.changeType}
                  icon={metric.icon}
                />
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
