
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
  Search,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-20 w-64 h-64 bg-gradient-to-br from-secondary/10 to-primary/10 organic-shape-1 animate-bounce-playful"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent organic-shape-2"></div>
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-gradient-to-br from-primary/15 to-secondary/15 organic-shape-3"></div>
      </div>

      <Sidebar />
      
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="header-bg border-b-4 border-secondary/30 px-8 py-6 shadow-large">
          <div className="flex items-center justify-between">
            <div className="relative">
              <h1 className="text-4xl font-black text-brand-brown mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-accent animate-pulse-glow" />
                Dashboard
              </h1>
              <p className="text-brand-brown-light font-bold text-lg">
                Visão geral dos treinamentos da rede Cresci & Perdi
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-brown-light" />
                <Input 
                  placeholder="Buscar cursos, usuários..."
                  className="pl-12 w-80 h-12 border-3 border-secondary/40 focus:border-primary rounded-2xl bg-white/80 backdrop-blur-sm font-bold text-brand-brown placeholder:text-brand-brown-light placeholder:font-semibold"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-12 h-12 rounded-2xl hover:bg-gradient-to-br hover:from-secondary/20 hover:to-primary/20 hover:scale-110 transition-all duration-300 border-2 border-secondary/20"
              >
                <Bell className="w-6 h-6 text-brand-brown" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-10 animate-fade-in relative">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <RecentCourses />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="training-card">
            <h2 className="text-2xl font-black text-brand-brown mb-8 flex items-center gap-3">
              <div className="w-8 h-8 gradient-accent rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button className="playful-button h-24 flex flex-col gap-3 gradient-primary border-0 text-white font-black text-lg shadow-large">
                <GraduationCap className="w-8 h-8" />
                <span>Criar Curso</span>
              </Button>
              <Button className="playful-button h-24 flex flex-col gap-3 bg-white border-4 border-accent text-accent hover:bg-accent hover:text-white font-black text-lg shadow-large">
                <Users className="w-8 h-8" />
                <span>Adicionar Usuários</span>
              </Button>
              <Button className="playful-button h-24 flex flex-col gap-3 gradient-accent border-0 text-white font-black text-lg shadow-large">
                <Award className="w-8 h-8" />
                <span>Emitir Certificados</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
