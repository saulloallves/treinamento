
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
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useUpcomingLessons } from "@/hooks/useUpcomingLessons";

const Dashboard = () => {
  const { data, isLoading } = useDashboardStats();

  const formatNumber = (n: number | undefined) =>
    typeof n === "number" ? n.toLocaleString("pt-BR") : "0";

  const metrics = [
    {
      title: "Usuários Ativos",
      value: isLoading ? "..." : formatNumber(data?.usersActive),
      change: "—",
      changeType: "neutral" as const,
      icon: Users,
    },
    {
      title: "Cursos Disponíveis",
      value: isLoading ? "..." : formatNumber(data?.coursesAvailable),
      change: "—",
      changeType: "neutral" as const,
      icon: BookOpen,
    },
    {
      title: "Certificados Emitidos",
      value: isLoading ? "..." : formatNumber(data?.certificatesIssued),
      change: "—",
      changeType: "neutral" as const,
      icon: Award,
    },
    {
      title: "Taxa de Conclusão",
      value: isLoading ? "..." : `${data?.completionRate ?? 0}%`,
      change: "—",
      changeType: "neutral" as const,
      icon: TrendingUp,
    },
    {
      title: "Unidades Ativas",
      value: isLoading ? "..." : formatNumber(data?.unitsActive),
      change: "—",
      changeType: "neutral" as const,
      icon: Building2,
    },
    {
      title: "Disparos WhatsApp",
      value: isLoading ? "..." : formatNumber(data?.whatsappDispatches),
      change: "—",
      changeType: "neutral" as const,
      icon: MessageSquare,
    },
    {
      title: "Aulas Agendadas",
      value: isLoading ? "..." : formatNumber(data?.lessonsScheduled),
      change: "—",
      changeType: "neutral" as const,
      icon: Calendar,
    },
    {
      title: "Presenças do Mês",
      value: isLoading ? "..." : formatNumber(data?.attendancesThisMonth),
      change: "—",
      changeType: "neutral" as const,
      icon: UserCheck,
    },
  ];

  const { data: recentActivity, isLoading: isActivityLoading } = useRecentActivity();

  const { data: upcomingLessons, isLoading: isUpcomingLoading } = useUpcomingLessons();

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
