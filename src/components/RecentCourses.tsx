
import { BookOpen, Clock, Users, CheckCircle, Star } from "lucide-react";

const RecentCourses = () => {
  const courses = [
    {
      id: 1,
      name: "Atendimento ao Cliente Excelente",
      category: "Atendimento",
      enrolled: 45,
      completed: 32,
      status: "active",
      lastUpdated: "2 dias atrás"
    },
    {
      id: 2,
      name: "Gestão Financeira para Franqueados",
      category: "Gestão",
      enrolled: 23,
      completed: 18,
      status: "active",
      lastUpdated: "1 semana atrás"
    },
    {
      id: 3,
      name: "Segurança no Trabalho",
      category: "Compliance",
      enrolled: 67,
      completed: 67,
      status: "completed",
      lastUpdated: "3 dias atrás"
    },
    {
      id: 4,
      name: "Vendas e Relacionamento",
      category: "Vendas",
      enrolled: 34,
      completed: 12,
      status: "active",
      lastUpdated: "5 dias atrás"
    }
  ];

  return (
    <div className="training-card">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-brand-gray-dark flex items-center gap-3">
          <div className="w-12 h-12 rounded-[20px] flex items-center justify-center shadow-medium">
            <div className="absolute inset-0 gradient-primary rounded-[20px]"></div>
            <BookOpen className="w-6 h-6 text-white relative z-10" />
          </div>
          Cursos Recentes
        </h2>
        <button className="brand-button">
          Ver todos
        </button>
      </div>

      <div className="space-y-6">
        {courses.map((course, index) => (
          <div key={course.id} className="group relative">
            <div className="flex items-center gap-6 p-6 rounded-[20px] bg-gradient-to-r from-white to-primary/5 border border-primary/10 hover:border-primary/20 hover:shadow-medium transition-all duration-200 hover:scale-[1.01] relative overflow-hidden">
              <div className="w-16 h-16 rounded-[20px] flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-medium relative z-10">
                <div className="absolute inset-0 gradient-accent rounded-[20px]"></div>
                <BookOpen className="w-8 h-8 text-white relative z-10" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-brand-gray-dark text-lg group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-soft">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="text-xs font-semibold text-brand-gray-dark">4.8</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-xs text-brand-gray mb-3">
                  <span className="flex items-center gap-2 font-medium bg-white px-3 py-1 rounded-full shadow-soft">
                    <Users className="w-4 h-4 text-primary" />
                    {course.enrolled} inscritos
                  </span>
                  <span className="flex items-center gap-2 font-medium bg-white px-3 py-1 rounded-full shadow-soft">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    {course.completed} concluídos
                  </span>
                  <span className="flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4" />
                    {course.lastUpdated}
                  </span>
                </div>

                {/* Barra de progresso */}
                <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden">
                  <div 
                    className="h-2 rounded-full transition-all duration-300 group-hover:shadow-soft relative overflow-hidden"
                    style={{ width: `${Math.round((course.completed / course.enrolled) * 100)}%` }}
                  >
                    <div className="w-full h-full gradient-primary"></div>
                  </div>
                </div>
                <div className="text-xs font-medium text-brand-gray">
                  {Math.round((course.completed / course.enrolled) * 100)}% concluído
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-xs font-semibold shadow-soft border ${
                  course.status === 'active' 
                    ? 'bg-accent/10 text-accent border-accent/20' 
                    : 'bg-muted text-muted-foreground border-muted-foreground/20'
                }`}>
                  {course.status === 'active' ? 'Ativo' : 'Concluído'}
                </span>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute top-2 right-2 w-6 h-6 organic-shape-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="w-full h-full bg-primary/20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCourses;
