
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
        <h2 className="text-2xl font-black text-brand-brown flex items-center gap-3">
          <div className="w-10 h-10 gradient-warm rounded-2xl flex items-center justify-center shadow-medium">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          Cursos Recentes
        </h2>
        <button className="playful-button px-6 py-3 text-sm text-white font-black rounded-2xl gradient-accent shadow-medium hover:shadow-large">
          Ver todos
        </button>
      </div>

      <div className="space-y-6">
        {courses.map((course, index) => (
          <div key={course.id} className="group relative">
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-r from-white to-secondary/5 border-2 border-secondary/20 hover:border-primary/40 hover:shadow-large transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="w-16 h-16 gradient-accent rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:animate-wiggle transition-all duration-500 shadow-medium relative z-10">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-black text-brand-brown text-lg group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="text-sm font-bold text-brand-brown">4.8</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-brand-brown-light mb-3">
                  <span className="flex items-center gap-2 font-bold bg-white px-3 py-1 rounded-full shadow-soft">
                    <Users className="w-4 h-4 text-primary" />
                    {course.enrolled} inscritos
                  </span>
                  <span className="flex items-center gap-2 font-bold bg-white px-3 py-1 rounded-full shadow-soft">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    {course.completed} concluídos
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    <Clock className="w-4 h-4" />
                    {course.lastUpdated}
                  </span>
                </div>

                {/* Barra de progresso */}
                <div className="w-full bg-muted/30 rounded-full h-2 mb-2">
                  <div 
                    className="gradient-primary h-2 rounded-full transition-all duration-500 group-hover:shadow-glow"
                    style={{ width: `${Math.round((course.completed / course.enrolled) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs font-bold text-brand-brown-light">
                  {Math.round((course.completed / course.enrolled) * 100)}% concluído
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-xs font-black shadow-soft border-2 ${
                  course.status === 'active' 
                    ? 'bg-accent/10 text-accent border-accent/30' 
                    : 'bg-muted text-muted-foreground border-muted-foreground/30'
                }`}>
                  {course.status === 'active' ? 'Ativo' : 'Concluído'}
                </span>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-secondary/20 organic-shape-3 opacity-30 group-hover:opacity-60 transition-opacity"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCourses;
