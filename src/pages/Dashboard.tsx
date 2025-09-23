
import { useState } from "react";
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
import PullToRefresh from "@/components/mobile/PullToRefresh";
import TouchCard from "@/components/mobile/TouchCard";
import { PaginationCustom } from "@/components/ui/pagination-custom";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useUpcomingLessons } from "@/hooks/useUpcomingLessons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [activityPage, setActivityPage] = useState(1);
  const [activityItemsPerPage, setActivityItemsPerPage] = useState(5);
  const [lessonsPage, setLessonsPage] = useState(1);
  const [lessonsItemsPerPage, setLessonsItemsPerPage] = useState(4);
  const isMobile = useIsMobile();
  const { data, isLoading, refetch, error } = useDashboardStats();
  
  console.log('🎯 Dashboard render - stats:', { data, isLoading, error });
  
  if (error) {
    console.error('❌ Dashboard stats error:', error);
    return <div className="p-6">
      <h1 className="page-title text-red-600">Erro no Dashboard</h1>
      <p className="description mt-2">{error.message}</p>
    </div>;
  }

  if (isLoading) {
    console.log('⏳ Dashboard loading...');
    return <div className="p-6">
      <h1 className="page-title">Carregando Dashboard...</h1>
    </div>;
  }

  console.log('✅ Dashboard rendering content...');

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

  const handleRefresh = async () => {
    await Promise.all([
      refetch(),
      // Add other refetch calls here if needed
    ]);
  };

  const content = (
    <div className={`space-y-6 ${isMobile ? 'space-y-4' : 'space-y-8'}`}>
      {/* Métricas Principais */}
      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-2' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
      }`}>
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
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3 gap-8'}`}>
        {/* Atividade Recente */}
        <div className="xl:col-span-2">
          <TouchCard className={isMobile ? 'p-4' : 'p-6'}>
            <h2 className={`section-title mb-4 ${
              isMobile ? 'text-lg mb-4' : 'text-xl mb-6'
            }`}>
              Atividade Recente
            </h2>
            <div className="space-y-3">
              {(() => {
                const activities = recentActivity ?? [];
                const totalPages = Math.ceil(activities.length / activityItemsPerPage);
                const startIndex = (activityPage - 1) * activityItemsPerPage;
                const paginatedActivities = activities.slice(startIndex, startIndex + activityItemsPerPage);
                
                return (
                  <div className={`space-y-2 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                    {paginatedActivities.map((activity) => (
                      <TouchCard 
                        key={activity.id} 
                        className={`${isMobile ? 'p-3' : 'p-3'} hover:bg-muted/30 transition-colors`}
                        variant="outlined"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full flex items-center justify-center ${
                            isMobile ? 'w-8 h-8' : 'w-7 h-7'
                          } ${
                            activity.type === 'course' ? 'bg-blue-100' :
                            activity.type === 'user' ? 'bg-green-100' :
                            activity.type === 'certificate' ? 'bg-yellow-100' :
                            'bg-purple-100'
                          }`}>
                            {activity.type === 'course' && <BookOpen className={`text-blue-600 ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />}
                            {activity.type === 'user' && <Users className={`text-green-600 ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />}
                            {activity.type === 'certificate' && <Award className={`text-yellow-600 ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />}
                            {activity.type === 'whatsapp' && <MessageSquare className={`text-purple-600 ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />}
                          </div>
                          <div className="flex-1">
                          <h3 className={`card-title mb-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                            {activity.action}
                          </h3>
                          <p className={`description ${isMobile ? 'text-xs' : 'text-xs'}`}>{activity.description}</p>
                          <p className={`metadata mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>{activity.time}</p>
                          </div>
                        </div>
                      </TouchCard>
                    ))}
                    
                    {activities.length > activityItemsPerPage && (
                      <div className="mt-4">
                        <PaginationCustom
                          currentPage={activityPage}
                          totalPages={totalPages}
                          totalItems={activities.length}
                          itemsPerPage={activityItemsPerPage}
                          onPageChange={setActivityPage}
                          onItemsPerPageChange={(newSize) => {
                            setActivityItemsPerPage(newSize);
                            setActivityPage(1);
                          }}
                          itemName="atividades"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </TouchCard>
        </div>

        {/* Próximas Aulas */}
        <div>
          <TouchCard className={isMobile ? 'p-4' : 'p-6'}>
            <h2 className={`section-title mb-4 ${
              isMobile ? 'text-lg mb-4' : 'text-xl mb-6'
            }`}>
              Próximas Aulas Ao Vivo
            </h2>
            
            {isUpcomingLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3 border border-gray-200 rounded-lg">
                    <Skeleton className="h-3 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-3" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingLessons && upcomingLessons.length > 0 ? (
              (() => {
                const lessons = upcomingLessons ?? [];
                const totalPages = Math.ceil(lessons.length / lessonsItemsPerPage);
                const startIndex = (lessonsPage - 1) * lessonsItemsPerPage;
                const paginatedLessons = lessons.slice(startIndex, startIndex + lessonsItemsPerPage);
                
                return (
                  <div className="space-y-4">
                    <div className={`space-y-2 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                      {paginatedLessons.map((lesson) => (
                        <TouchCard 
                          key={lesson.id} 
                          className={`${isMobile ? 'p-3' : 'p-3'} hover:shadow-clean-md transition-shadow`}
                          variant="outlined"
                        >
                          <h3 className={`card-title mb-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                            {lesson.title}
                          </h3>
                          <p className={`description mb-2 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            {lesson.course}
                          </p>
                          <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            <div className="flex items-center gap-1">
                              <Calendar className={`text-brand-blue ${isMobile ? 'w-3 h-3' : 'w-3 h-3'}`} />
                              <span className="text-brand-gray-dark">
                                {lesson.date} às {lesson.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className={`text-brand-blue ${isMobile ? 'w-3 h-3' : 'w-3 h-3'}`} />
                              <span className="text-brand-gray-dark">{lesson.participants}</span>
                            </div>
                          </div>
                        </TouchCard>
                      ))}
                    </div>
                    
                    {lessons.length > lessonsItemsPerPage && (
                      <div className="border-t border-gray-200 pt-4">
                        <PaginationCustom
                          currentPage={lessonsPage}
                          totalPages={totalPages}
                          totalItems={lessons.length}
                          itemsPerPage={lessonsItemsPerPage}
                          onPageChange={setLessonsPage}
                          onItemsPerPageChange={(newSize) => {
                            setLessonsItemsPerPage(newSize);
                            setLessonsPage(1);
                          }}
                          itemName="aulas"
                        />
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="caption">Nenhuma aula ao vivo agendada.</p>
            )}
          </TouchCard>
        </div>
      </div>
    </div>
  );

  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh}>
      {content}
    </PullToRefresh>
  ) : (
    content
  );
};

export default Dashboard;
