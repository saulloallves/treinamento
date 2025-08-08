
import { Award, UserCheck, BookOpen, Users, Activity, Clock } from "lucide-react";

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
      color: "text-green-500"
    },
    {
      id: 2,
      type: "completion",
      user: "João Santos",
      action: "concluiu o curso",
      course: "Gestão Financeira",
      time: "há 4 horas",
      icon: UserCheck,
      color: "text-brand-blue"
    },
    {
      id: 3,
      type: "enrollment",
      user: "Ana Costa",
      action: "se inscreveu no curso",
      course: "Vendas e Relacionamento",
      time: "há 1 dia",
      icon: BookOpen,
      color: "text-purple-500"
    },
    {
      id: 4,
      type: "group",
      user: "15 colaboradores",
      action: "iniciaram o curso",
      course: "Segurança no Trabalho",
      time: "há 2 dias",
      icon: Users,
      color: "text-orange-500"
    },
    {
      id: 5,
      type: "certificate",
      user: "Pedro Lima",
      action: "recebeu certificado do curso", 
      course: "Liderança e Gestão",
      time: "há 3 dias",
      icon: Award,
      color: "text-green-500"
    }
  ];

  return (
    <div className="card-clean p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-blue-light flex items-center justify-center">
            <Activity className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-black">Atividades Recentes</h2>
            <p className="text-brand-gray-dark text-sm">Últimas movimentações do sistema</p>
          </div>
        </div>
        <button className="text-sm text-brand-blue hover:text-blue-600 font-medium px-3 py-1 rounded-md hover:bg-brand-blue-light transition-colors duration-200">
          Ver histórico
        </button>
      </div>

      {/* Lista de atividades */}
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div 
              key={activity.id} 
              className="flex items-start gap-4 p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Ícone da atividade */}
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-brand-black mb-1 leading-relaxed">
                  <span className="font-medium">{activity.user}</span>
                  {" "}{activity.action}{" "}
                  <span className="font-medium text-brand-blue">{activity.course}</span>
                </p>
                
                <div className="flex items-center gap-1 text-xs text-brand-gray-dark">
                  <Clock className="w-3 h-3" />
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão para ver mais */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <button className="text-brand-blue hover:text-blue-600 font-medium text-sm px-4 py-2 rounded-md hover:bg-brand-blue-light transition-colors duration-200">
          Carregar mais atividades
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
