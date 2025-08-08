
import { Award, UserCheck, BookOpen, Users, Activity } from "lucide-react";

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: "certificate",
      user: "Maria Silva",
      action: "recebeu certificado do curso",
      course: "Atendimento ao Cliente",
      time: "há 2 horas",
      icon: Award,
      color: "from-accent to-accent/80"
    },
    {
      id: 2,
      type: "completion",
      user: "João Santos",
      action: "concluiu o curso",
      course: "Gestão Financeira",
      time: "há 4 horas",
      icon: UserCheck,
      color: "from-primary to-secondary"
    },
    {
      id: 3,
      type: "enrollment",
      user: "Ana Costa",
      action: "se inscreveu no curso",
      course: "Vendas e Relacionamento",
      time: "há 1 dia",
      icon: BookOpen,
      color: "from-secondary to-primary"
    },
    {
      id: 4,
      type: "group",
      user: "15 colaboradores",
      action: "iniciaram o curso",
      course: "Segurança no Trabalho",
      time: "há 2 dias",
      icon: Users,
      color: "from-accent/80 to-accent"
    }
  ];

  return (
    <div className="training-card">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-brand-gray-dark flex items-center gap-3">
          <div className="w-12 h-12 rounded-[20px] flex items-center justify-center shadow-medium">
            <div className="absolute inset-0 gradient-primary rounded-[20px]"></div>
            <Activity className="w-6 h-6 text-white relative z-10" />
          </div>
          Atividades Recentes
        </h2>
        <button className="playful-button px-4 py-2 text-sm text-primary font-semibold rounded-[20px] hover:bg-primary/10 transition-all duration-200">
          Ver histórico
        </button>
      </div>

      <div className="space-y-6 relative">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="activity-item group">
              <div className="absolute left-[-11px] top-3 w-6 h-6 rounded-full shadow-medium group-hover:scale-110 transition-all duration-200 overflow-hidden">
                <div className="w-full h-full gradient-primary rounded-full flex items-center justify-center">
                  <Icon className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-white to-primary/5 p-4 rounded-[20px] border border-primary/10 hover:border-primary/20 hover:shadow-medium transition-all duration-200 group-hover:scale-[1.01]">
                <p className="text-sm text-brand-gray-dark font-medium mb-2">
                  <span className="text-primary font-semibold">{activity.user}</span>
                  {" "}{activity.action}{" "}
                  <span className="text-accent font-semibold">{activity.course}</span>
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-brand-gray font-medium">
                    {activity.time}
                  </p>
                  <div className="w-2 h-2 rounded-full group-hover:scale-125 transition-transform duration-200">
                    <div className="w-full h-full gradient-secondary rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Linha conectora decorativa */}
        <div className="absolute left-[-1px] top-0 bottom-0 w-0.5 rounded-full opacity-20">
          <div className="w-full h-full gradient-primary"></div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
