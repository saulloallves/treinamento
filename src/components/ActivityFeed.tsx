
import { Award, UserCheck, BookOpen, Users, Activity, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const ActivityFeed = () => {
  const isMobile = useIsMobile();
  
  const activities = [
    {
      id: 1,
      type: "certificate",
      user: "Maria Silva",
      action: "recebeu certificado",
      course: "Atendimento ao Cliente",
      time: "há 2h",
      icon: Award,
      color: "text-success"
    },
    {
      id: 2,
      type: "completion",
      user: "João Santos",
      action: "concluiu o curso",
      course: "Gestão Financeira",
      time: "há 4h",
      icon: UserCheck,
      color: "text-primary"
    },
    {
      id: 3,
      type: "enrollment",
      user: "Ana Costa",
      action: "se inscreveu no curso",
      course: "Vendas e Relacionamento",
      time: "há 1d",
      icon: BookOpen,
      color: "text-secondary"
    },
    {
      id: 4,
      type: "group",
      user: "15 colaboradores",
      action: "iniciaram o curso",
      course: "Segurança no Trabalho",
      time: "há 2d",
      icon: Users,
      color: "text-accent"
    },
    {
      id: 5,
      type: "certificate",
      user: "Pedro Lima",
      action: "recebeu certificado", 
      course: "Liderança e Gestão",
      time: "há 3d",
      icon: Award,
      color: "text-success"
    }
  ];

  return (
    <div className={`card-clean ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'mb-4 pb-3' : 'mb-6 pb-4'} border-b border-border`}>
        <div className="flex items-center gap-3">
          <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-primary/10 flex items-center justify-center`}>
            <Activity className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
          </div>
          <div>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>
              {isMobile ? 'Atividades' : 'Atividades Recentes'}
            </h2>
            {!isMobile && (
              <p className="text-muted-foreground text-sm">Últimas movimentações do sistema</p>
            )}
          </div>
        </div>
        {!isMobile && (
          <button className="text-sm text-primary hover:text-primary/80 font-medium px-3 py-1 rounded-md hover:bg-primary/10 transition-colors duration-200">
            Ver histórico
          </button>
        )}
      </div>

      {/* Lista de atividades */}
      <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div 
              key={activity.id} 
              className={`flex items-start gap-3 ${isMobile ? 'p-2' : 'p-3'} rounded-md hover:bg-muted/50 transition-colors duration-200 active:scale-[0.98]`}
            >
              {/* Ícone da atividade */}
              <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-background flex items-center justify-center flex-shrink-0 ${activity.color} shadow-sm`}>
                <Icon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground mb-1 leading-relaxed`}>
                  <span className="font-medium">{activity.user}</span>
                  {" "}{activity.action}
                  {isMobile ? '' : ' do curso'}{" "}
                  <span className="font-medium text-primary truncate block sm:inline">
                    {activity.course}
                  </span>
                </p>
                
                <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                  <Clock className="w-3 h-3" />
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão para ver mais */}
      <div className={`${isMobile ? 'mt-4 pt-3' : 'mt-6 pt-4'} border-t border-border text-center`}>
        <button className="text-primary hover:text-primary/80 font-medium text-sm px-4 py-2 rounded-md hover:bg-primary/10 transition-colors duration-200 active:scale-95">
          {isMobile ? 'Ver mais' : 'Carregar mais atividades'}
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
