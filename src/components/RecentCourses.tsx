
import { BookOpen, Clock, Users, CheckCircle, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecentCourses = () => {
  const courses = [
    {
      id: 1,
      name: "Atendimento ao Cliente Excelente",
      category: "Atendimento",
      enrolled: 45,
      completed: 32,
      status: "active",
      lastUpdated: "2 dias atrás",
      progress: Math.round((32 / 45) * 100),
      color: "from-purple-500 to-purple-600"
    },
    {
      id: 2,
      name: "Gestão Financeira para Franqueados",
      category: "Gestão",
      enrolled: 23,
      completed: 18,
      status: "active", 
      lastUpdated: "1 semana atrás",
      progress: Math.round((18 / 23) * 100),
      color: "from-pink-500 to-pink-600"
    },
    {
      id: 3,
      name: "Segurança no Trabalho",
      category: "Compliance",
      enrolled: 67,
      completed: 67,
      status: "completed",
      lastUpdated: "3 dias atrás",
      progress: 100,
      color: "from-green-500 to-green-600"
    },
    {
      id: 4,
      name: "Vendas e Relacionamento",
      category: "Vendas",
      enrolled: 34,
      completed: 12,
      status: "active",
      lastUpdated: "5 dias atrás",
      progress: Math.round((12 / 34) * 100),
      color: "from-blue-500 to-blue-600"
    }
  ];

  return (
    <div className="card-modern">
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Cursos Recentes</h2>
              <p className="text-gray-600 text-sm">Acompanhe o progresso dos seus cursos</p>
            </div>
          </div>
          <Button variant="gradient" className="shadow-lg">
            Ver todos
          </Button>
        </div>

        {/* Lista de cursos */}
        <div className="space-y-6">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className="group relative bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/70 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-6">
                {/* Ícone do curso */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative overflow-hidden`}>
                  <BookOpen className="w-8 h-8 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Conteúdo principal */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg group-hover:text-purple-700 transition-colors">
                        {course.name}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold rounded-full mt-1">
                        {course.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-lg shadow-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">4.8</span>
                    </div>
                  </div>
                  
                  {/* Estatísticas */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">{course.enrolled} inscritos</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{course.completed} concluídos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{course.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Barra de progresso moderna */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progresso</span>
                      <span className="text-sm font-bold text-purple-600">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 bg-gradient-to-r ${course.color} rounded-full transition-all duration-500 shadow-sm relative overflow-hidden`}
                        style={{ width: `${course.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão de ação */}
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant={course.status === 'completed' ? 'success' : 'default'}
                    size="sm"
                    className="min-w-[100px]"
                  >
                    {course.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Concluído
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Continuar
                      </>
                    )}
                  </Button>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {course.status === 'active' ? 'Ativo' : 'Concluído'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentCourses;
