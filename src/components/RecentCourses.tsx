
import { BookOpen, Clock, Users, CheckCircle } from "lucide-react";

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">
          Cursos Recentes
        </h2>
        <button className="text-sm text-primary hover:text-primary-foreground transition-colors">
          Ver todos
        </button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors duration-200 group">
            <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <BookOpen className="w-5 h-5 text-accent-foreground" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-card-foreground mb-1">
                {course.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.enrolled} inscritos
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {course.completed} concluídos
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.lastUpdated}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.status === 'active' 
                  ? 'bg-accent/10 text-accent' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {course.status === 'active' ? 'Ativo' : 'Concluído'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCourses;
