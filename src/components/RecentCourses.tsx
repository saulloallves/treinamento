
import { Clock, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecentCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Segurança no Trabalho",
      description: "Curso obrigatório sobre normas de segurança",
      students: 234,
      duration: "2h 30min",
      status: "Ativo",
      progress: 85,
    },
    {
      id: 2,
      title: "Atendimento ao Cliente",
      description: "Técnicas de relacionamento e vendas",
      students: 156,
      duration: "1h 45min",
      status: "Ativo",
      progress: 92,
    },
    {
      id: 3,
      title: "Gestão de Estoque",
      description: "Controle e organização do inventário",
      students: 89,
      duration: "3h 15min",
      status: "Em revisão",
      progress: 67,
    },
  ];

  return (
    <div className="card-clean p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-brand-black mb-2">
            Cursos Recentes
          </h2>
          <p className="text-brand-gray-dark">
            Últimos cursos adicionados ao sistema
          </p>
        </div>
        <Button className="btn-primary">
          <BookOpen className="w-4 h-4" />
          Novo Curso
        </Button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-clean-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-brand-black">
                    {course.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      course.status === "Ativo"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <p className="text-brand-gray-dark text-sm mb-3">
                  {course.description}
                </p>
                <div className="flex items-center gap-6 text-sm text-brand-gray-dark">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students} alunos
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-brand-blue mb-1">
                  {course.progress}%
                </div>
                <div className="text-xs text-brand-gray-dark">
                  Progresso médio
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCourses;
