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
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-black text-brand-brown flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl flex items-center justify-center shadow-large">
            <div className="absolute inset-0 gradient-primary rounded-3xl"></div>
            <Heart className="w-8 h-8 text-white relative z-10" />
          </div>
          Atividades Recentes
        </h2>
        <button className="playful-button px-6 py-3 text-sm text-primary font-black rounded-3xl hover:bg-primary/20 transition-all duration-300">
          Ver histórico
        </button>
      </div>

      <div className="space-y-8 relative">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="activity-item group">
              <div className="absolute left-[-15px] top-4 w-8 h-8 rounded-full shadow-large group-hover:scale-125 transition-all duration-300 overflow-hidden">
                <div className="w-full h-full gradient-primary rounded-full flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-white to-primary/5 p-6 rounded-3xl border-2 border-primary/20 hover:border-primary/30 hover:shadow-large transition-all duration-300 group-hover:scale-105">
                <p className="text-base text-brand-brown font-bold mb-3">
                  <span className="text-primary font-black">{activity.user}</span>
                  {" "}{activity.action}{" "}
                  <span className="text-accent font-black">{activity.course}</span>
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-brand-brown-light font-bold">
                    {activity.time}
                  </p>
                  <div className="w-3 h-3 rounded-full group-hover:scale-150 transition-transform duration-300">
                    <div className="w-full h-full gradient-secondary rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Linha conectora decorativa */}
        <div className="absolute left-[-1px] top-0 bottom-0 w-1 rounded-full opacity-40">
          <div className="w-full h-full gradient-warm"></div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
