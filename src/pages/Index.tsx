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
        <div className="absolute top-16 right-24 w-80 h-80 organic-shape-1 animate-float opacity-60">
          <div className="w-full h-full gradient-soft"></div>
        </div>
        <div className="absolute bottom-24 left-24 w-64 h-64 organic-shape-2 opacity-40">
          <div className="w-full h-full gradient-accent"></div>
        </div>
        <div className="absolute top-1/2 right-12 w-40 h-40 organic-shape-3 animate-bounce-playful opacity-30">
          <div className="w-full h-full gradient-secondary"></div>
        </div>
      </div>

      <Sidebar />
      
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="header-bg border-b-4 border-primary/30 px-10 py-8 shadow-large">
          <div className="flex items-center justify-between">
            <div className="relative">
              <h1 className="text-5xl font-black text-brand-brown mb-3 flex items-center gap-4">
                <Sparkles className="w-10 h-10 text-accent animate-pulse-glow" />
                Dashboard
              </h1>
              <p className="text-brand-brown-light font-bold text-xl">
                Visão geral dos treinamentos da rede Cresci & Perdi
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-brand-brown-light" />
                <Input 
                  placeholder="Buscar cursos, usuários..."
                  className="pl-14 w-96 h-14 border-3 border-primary/40 focus:border-primary rounded-3xl bg-white/90 backdrop-blur-sm font-bold text-brand-brown placeholder:text-brand-brown-light placeholder:font-semibold shadow-medium"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-14 h-14 rounded-3xl hover:scale-110 transition-all duration-300 border-2 border-primary/20 shadow-medium hover:shadow-large"
              >
                <Bell className="w-7 h-7 text-brand-brown" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-10 space-y-12 animate-fade-in relative">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <RecentCourses />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="training-card">
            <h2 className="text-3xl font-black text-brand-brown mb-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-medium">
                <div className="absolute inset-0 gradient-accent rounded-2xl"></div>
                <Award className="w-7 h-7 text-white relative z-10" />
              </div>
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Button 
                variant="brand"
                className="h-28 flex flex-col gap-4 text-xl shadow-large hover:shadow-glow"
              >
                <GraduationCap className="w-10 h-10" />
                <span>Criar Curso</span>
              </Button>
              <Button 
                variant="outline"
                className="h-28 flex flex-col gap-4 text-xl border-4 border-accent text-accent hover:bg-accent hover:text-white shadow-large"
              >
                <Users className="w-10 h-10" />
                <span>Adicionar Usuários</span>
              </Button>
              <Button 
                variant="brand"
                className="h-28 flex flex-col gap-4 text-xl shadow-large hover:shadow-glow"
              >
                <Award className="w-10 h-10" />
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
