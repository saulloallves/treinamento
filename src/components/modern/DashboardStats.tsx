import { Users, Calendar, CheckCircle, Clock } from "lucide-react";
import { useTurmas } from "@/hooks/useTurmas";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, description, color }: StatCardProps) => (
  <div className="metric-modern animate-fade-in-up">
    <div className={`metric-icon ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="text-xl font-bold text-foreground mb-1">{value}</div>
    <div className="text-sm font-medium text-foreground mb-0.5">{title}</div>
    <div className="text-xs text-muted-foreground">{description}</div>
  </div>
);

export const DashboardStats = () => {
  const { data: turmas = [] } = useTurmas();
  
  const activeTurmas = turmas.filter(t => t.status !== 'encerrada').length;
  const totalEnrollments = turmas.reduce((acc, turma) => {
    // Buscar inscrições relacionadas à turma através de uma query separada seria ideal
    // Por enquanto, vamos usar um valor estimado ou placeholder
    return acc + 0; // Ajustar quando tivermos acesso aos dados de enrollment
  }, 0);
  const recentTurmas = turmas.filter(t => {
    const created = new Date(t.created_at || '');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  }).length;
  const pendingTurmas = turmas.filter(t => t.status === 'agendada').length;

  const stats = [
    {
      title: "Turmas Ativas", 
      value: activeTurmas, 
      icon: Users, 
      description: "Em andamento",
      color: "bg-status-active"
    },
    {
      title: "Alunos Inscritos", 
      value: totalEnrollments, 
      icon: CheckCircle, 
      description: "Total de matrículas",
      color: "bg-primary"
    },
    {
      title: "Novas Turmas", 
      value: recentTurmas, 
      icon: Calendar, 
      description: "Última semana",
      color: "bg-status-pending"
    },
    {
      title: "Planejadas", 
      value: pendingTurmas, 
      icon: Clock, 
      description: "Aguardando início",
      color: "bg-muted-foreground"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-animation">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};