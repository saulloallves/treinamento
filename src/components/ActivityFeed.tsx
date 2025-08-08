
import { Award, UserCheck, BookOpen, Users, Heart } from "lucide-react";

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
        <h2 className="text-2xl font-black text-brand-brown flex items-center gap-3">
          <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-medium">
            <Heart className="w-6 h-6 text-white" />
          </div>
          Atividades Recentes
        </h2>
        <button className="playful-button px-4 py-2 text-sm text-primary font-black rounded-xl hover:bg-secondary/20 transition-all duration-300">
          Ver histórico
        </button>
      </div>

      <div className="space-y-6 relative">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="activity-item group">
              <div className="absolute left-[-12px] top-3 w-6 h-6 rounded-full shadow-medium group-hover:scale-125 transition-all duration-300" 
                   style={{ background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))` }}>
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  <Icon className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-white to-secondary/5 p-4 rounded-2xl border-2 border-secondary/20 hover:border-primary/30 hover:shadow-medium transition-all duration-300 group-hover:scale-105">
                <p className="text-sm text-brand-brown font-bold mb-2">
                  <span className="text-primary font-black">{activity.user}</span>
                  {" "}{activity.action}{" "}
                  <span className="text-accent font-black">{activity.course}</span>
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-brand-brown-light font-bold">
                    {activity.time}
                  </p>
                  <div className="w-2 h-2 bg-gradient-to-r from-secondary to-primary rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Linha conectora decorativa */}
        <div className="absolute left-[-1px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary via-primary to-accent opacity-30"></div>
      </div>
    </div>
  );
};

export default ActivityFeed;
