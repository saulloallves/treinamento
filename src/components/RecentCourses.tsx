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
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-black text-brand-brown flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl flex items-center justify-center shadow-large">
            <div className="absolute inset-0 gradient-warm rounded-3xl"></div>
            <BookOpen className="w-8 h-8 text-white relative z-10" />
          </div>
          Cursos Recentes
        </h2>
        <button className="brand-button">
          Ver todos
        </button>
      </div>

      <div className="space-y-8">
        {courses.map((course, index) => (
          <div key={course.id} className="group relative">
            <div className="flex items-center gap-8 p-8 rounded-3xl bg-gradient-to-r from-white to-primary/5 border-2 border-primary/20 hover:border-primary/40 hover:shadow-large transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:animate-wiggle transition-all duration-500 shadow-large relative z-10">
                <div className="absolute inset-0 gradient-accent rounded-3xl"></div>
                <BookOpen className="w-10 h-10 text-white relative z-10" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-black text-brand-brown text-xl group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-medium">
                    <Star className="w-5 h-5 text-secondary fill-secondary" />
                    <span className="text-sm font-bold text-brand-brown">4.8</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 text-sm text-brand-brown-light mb-4">
                  <span className="flex items-center gap-3 font-bold bg-white px-4 py-2 rounded-full shadow-soft">
                    <Users className="w-5 h-5 text-primary" />
                    {course.enrolled} inscritos
                  </span>
                  <span className="flex items-center gap-3 font-bold bg-white px-4 py-2 rounded-full shadow-soft">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    {course.completed} concluídos
                  </span>
                  <span className="flex items-center gap-3 font-bold">
                    <Clock className="w-5 h-5" />
                    {course.lastUpdated}
                  </span>
                </div>

                {/* Barra de progresso */}
                <div className="w-full bg-muted/30 rounded-full h-3 mb-3 overflow-hidden">
                  <div 
                    className="h-3 rounded-full transition-all duration-500 group-hover:shadow-glow relative overflow-hidden"
                    style={{ width: `${Math.round((course.completed / course.enrolled) * 100)}%` }}
                  >
                    <div className="w-full h-full gradient-primary"></div>
                  </div>
                </div>
                <div className="text-sm font-bold text-brand-brown-light">
                  {Math.round((course.completed / course.enrolled) * 100)}% concluído
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-6 py-3 rounded-full text-sm font-black shadow-medium border-2 ${
                  course.status === 'active' 
                    ? 'bg-accent/10 text-accent border-accent/30' 
                    : 'bg-muted text-muted-foreground border-muted-foreground/30'
                }`}>
                  {course.status === 'active' ? 'Ativo' : 'Concluído'}
                </span>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute top-3 right-3 w-8 h-8 organic-shape-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="w-full h-full bg-secondary/30"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCourses;
