
import Sidebar from "../components/Sidebar";
import MetricCard from "../components/MetricCard";
import RecentCourses from "../components/RecentCourses";
import ActivityFeed from "../components/ActivityFeed";
import { 
  GraduationCap, 
  Users, 
  Award, 
  TrendingUp,
  Bell,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-8 py-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
              <p className="text-muted-foreground font-medium">
                Visão geral dos treinamentos da rede Cresci & Perdi
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar cursos, usuários..."
                  className="pl-10 w-80 border-primary/30 focus:border-primary"
                />
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-secondary/50 hover:text-primary">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-8 animate-fade-in">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Cursos"
              value="48"
              change="+12%"
              changeType="positive"
              icon={GraduationCap}
            />
            <MetricCard
              title="Usuários Ativos"
              value="1,247"
              change="+8%"
              changeType="positive"
              icon={Users}
            />
            <MetricCard
              title="Certificados Emitidos"
              value="324"
              change="+23%"
              changeType="positive"
              icon={Award}
            />
            <MetricCard
              title="Taxa de Conclusão"
              value="87%"
              change="+5%"
              changeType="positive"
              icon={TrendingUp}
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecentCourses />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="training-card">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col gap-2 gradient-primary border-0 hover:scale-105 transition-transform shadow-medium hover:shadow-large">
                <GraduationCap className="w-6 h-6" />
                <span className="font-semibold">Criar Curso</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 border-primary/30 hover:bg-secondary/50 hover:text-primary hover:scale-105 transition-all">
                <Users className="w-6 h-6" />
                <span className="font-semibold">Adicionar Usuários</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 border-primary/30 hover:bg-secondary/50 hover:text-primary hover:scale-105 transition-all">
                <Award className="w-6 h-6" />
                <span className="font-semibold">Emitir Certificados</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
