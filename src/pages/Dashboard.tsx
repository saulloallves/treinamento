
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Building2, 
  MessageSquare, 
  Calendar,
  UserCheck
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

const Dashboard = () => {
  const metrics = [
    {
      title: "Usuários Ativos",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users
    },
    {
      title: "Cursos Disponíveis",
      value: "87",
      change: "+5",
      changeType: "positive" as const,
      icon: BookOpen
    },
    {
      title: "Certificados Emitidos",
      value: "456",
      change: "+23%",
      changeType: "positive" as const,
      icon: Award
    },
    {
      title: "Taxa de Conclusão",
      value: "89%",
      change: "+3%",
      changeType: "positive" as const,
      icon: TrendingUp
    },
    {
      title: "Unidades Ativas",
      value: "723",
      change: "+8",
      changeType: "positive" as const,
      icon: Building2
    },
    {
      title: "Disparos WhatsApp",
      value: "2,341",
      change: "+15%",
      changeType: "positive" as const,
      icon: MessageSquare
    },
    {
      title: "Aulas Agendadas",
      value: "34",
      change: "+12",
      changeType: "positive" as const,
      icon: Calendar
    },
    {
      title: "Presenças do Mês",
      value: "5,678",
      change: "+18%",
      changeType: "positive" as const,
      icon: UserCheck
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Novo curso criado",
      description: "Segurança Digital foi adicionado ao sistema",
      time: "2 horas atrás",
      type: "course"
    },
    {
      id: 2,
      action: "Usuário cadastrado",
      description: "Maria Silva foi adicionada à Unidade SP-001",
      time: "4 horas atrás",
      type: "user"
    },
    {
      id: 3,
      action: "Certificado emitido",
      description: "João Santos concluiu Atendimento ao Cliente",
      time: "6 horas atrás",
      type: "certificate"
    },
    {
      id: 4,
      action: "Disparo WhatsApp",
      description: "123 usuários foram notificados sobre nova aula",
      time: "8 horas atrás",
      type: "whatsapp"
    }
  ];

  const upcomingLessons = [
    {
      id: 1,
      title: "Workshop - Vendas Avançadas",
      course: "Técnicas de Vendas",
      date: "15/01/2024",
      time: "14:00",
      participants: 45
    },
    {
      id: 2,
      title: "Treinamento - Liderança",
      course: "Gestão de Equipes",
      date: "16/01/2024",
      time: "09:00",
      participants: 28
    },
    {
      id: 3,
      title: "Apresentação - Resultados Q4",
      course: "Gestão Franqueado",
      date: "18/01/2024",
      time: "16:00",
      participants: 15
    }
  ];

  return (
    <div className="space-y-8">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="animate-fade-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType}
              icon={metric.icon}
            />
          </div>
        ))}
      </div>

      {/* Seções */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Atividade Recente */}
        <div className="xl:col-span-2">
          <div className="card-clean p-6">
            <h2 className="text-xl font-semibold text-brand-black mb-6">
              Atividade Recente
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'course' ? 'bg-blue-100' :
                    activity.type === 'user' ? 'bg-green-100' :
                    activity.type === 'certificate' ? 'bg-yellow-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'course' && <BookOpen className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'user' && <Users className="w-4 h-4 text-green-600" />}
                    {activity.type === 'certificate' && <Award className="w-4 h-4 text-yellow-600" />}
                    {activity.type === 'whatsapp' && <MessageSquare className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-brand-black">{activity.action}</h3>
                    <p className="text-sm text-brand-gray-dark">{activity.description}</p>
                    <p className="text-xs text-brand-gray-dark mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Próximas Aulas */}
        <div>
          <div className="card-clean p-6">
            <h2 className="text-xl font-semibold text-brand-black mb-6">
              Próximas Aulas Ao Vivo
            </h2>
            <div className="space-y-4">
              {upcomingLessons.map((lesson) => (
                <div key={lesson.id} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-brand-black text-sm mb-1">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-brand-gray-dark mb-2">
                    {lesson.course}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-brand-blue" />
                      <span className="text-brand-gray-dark">
                        {lesson.date} às {lesson.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-brand-blue" />
                      <span className="text-brand-gray-dark">{lesson.participants}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
