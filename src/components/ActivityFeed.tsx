
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
      color: "from-yellow-400 to-yellow-500"
    },
    {
      id: 2,
      type: "completion",
      user: "João Santos",
      action: "concluiu o curso",
      course: "Gestão Financeira",
      time: "há 4 horas",
      icon: UserCheck,
      color: "from-green-400 to-green-500"
    },
    {
      id: 3,
      type: "enrollment",
      user: "Ana Costa",
      action: "se inscreveu no curso",
      course: "Vendas e Relacionamento",
      time: "há 1 dia",
      icon: BookOpen,
      color: "from-blue-400 to-blue-500"
    },
    {
      id: 4,
      type: "group",
      user: "15 colaboradores",
      action: "iniciaram o curso",
      course: "Segurança no Trabalho",
      time: "há 2 dias",
      icon: Users,
      color: "from-purple-400 to-purple-500"
    },
    {
      id: 5,
      type: "certificate",
      user: "Pedro Lima",
      action: "recebeu certificado do curso", 
      course: "Liderança e Gestão",
      time: "há 3 dias",
      icon: Award,
      color: "from-pink-400 to-pink-500"
    }
  ];

  return (
    <div className="card-modern">
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Atividades Recentes</h2>
              <p className="text-gray-600 text-sm">Últimas movimentações do sistema</p>
            </div>
          </div>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200">
            Ver histórico
          </button>
        </div>

        {/* Timeline de atividades */}
        <div className="activity-timeline space-y-6">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div 
                key={activity.id} 
                className="activity-item group animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Dot da timeline */}
                <div className={`activity-dot bg-gradient-to-br ${activity.color} border-4 border-white group-hover:scale-125 transition-all duration-300`}>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
                </div>
                
                {/* Card da atividade */}
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/30 hover:bg-white/80 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] relative overflow-hidden">
                  {/* Ícone da atividade */}
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1 leading-relaxed">
                        <span className="font-semibold text-purple-700">{activity.user}</span>
                        {" "}{activity.action}{" "}
                        <span className="font-semibold text-pink-600">{activity.course}</span>
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Efeito de brilho */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão para ver mais */}
        <div className="mt-6 text-center">
          <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm hover:bg-purple-50 px-4 py-2 rounded-lg transition-all duration-200">
            Carregar mais atividades
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
