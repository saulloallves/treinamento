
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditCourseDialog from "./EditCourseDialog";

interface Course {
  id: number;
  name: string;
  description: string;
  theme: string;
  publicTarget: string;
  mandatory: boolean;
  hasQuiz: boolean;
  generatesCertificate: boolean;
  studentsCount: number;
  lessonsCount: number;
  status: string;
}

const CoursesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPublic, setFilterPublic] = useState("todos");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      name: "Segurança no Trabalho",
      description: "Curso obrigatório sobre normas de segurança e prevenção de acidentes",
      theme: "Segurança",
      publicTarget: "ambos",
      mandatory: true,
      hasQuiz: true,
      generatesCertificate: true,
      studentsCount: 234,
      lessonsCount: 8,
      status: "Ativo"
    },
    {
      id: 2,
      name: "Atendimento ao Cliente",
      description: "Técnicas de relacionamento, vendas e fidelização",
      theme: "Vendas",
      publicTarget: "colaborador",
      mandatory: false,
      hasQuiz: true,
      generatesCertificate: true,
      studentsCount: 156,
      lessonsCount: 5,
      status: "Ativo"
    },
    {
      id: 3,
      name: "Gestão Franqueado",
      description: "Curso específico para gestão de franquias",
      theme: "Gestão",
      publicTarget: "franqueado",
      mandatory: true,
      hasQuiz: false,
      generatesCertificate: true,
      studentsCount: 45,
      lessonsCount: 12,
      status: "Em revisão"
    }
  ]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPublic === "todos" || course.publicTarget === filterPublic;
    return matchesSearch && matchesFilter;
  });

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditDialogOpen(true);
  };

  const handleSaveCourse = (updatedCourse: Course) => {
    setCourses(courses.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    ));
    console.log("Curso atualizado:", updatedCourse);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Cursos</h1>
          <p className="text-brand-gray-dark">Gerencie os cursos de treinamento</p>
        </div>
        <Button className="btn-primary">
          <Plus className="w-4 h-4" />
          Criar Novo Curso
        </Button>
      </div>

      {/* Filtros */}
      <div className="card-clean p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-brand-black mb-1">
              Buscar curso
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray-dark w-4 h-4" />
              <Input
                placeholder="Digite o nome do curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Público-alvo
            </label>
            <select
              value={filterPublic}
              onChange={(e) => setFilterPublic(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="todos">Todos</option>
              <option value="franqueado">Franqueado</option>
              <option value="colaborador">Colaborador</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Cursos */}
      <div className="grid gap-4">
        {filteredCourses.map((course) => (
          <div key={course.id} className="card-clean p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-brand-black">
                    {course.name}
                  </h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-brand-blue-light text-brand-blue">
                    {course.theme}
                  </span>
                  {course.mandatory && (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                      Obrigatório
                    </span>
                  )}
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
                
                <p className="text-brand-gray-dark mb-4">{course.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-blue" />
                    <span className="text-brand-gray-dark">
                      Público: {course.publicTarget === "ambos" ? "Ambos" : 
                      course.publicTarget === "franqueado" ? "Franqueado" : "Colaborador"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-blue" />
                    <span className="text-brand-gray-dark">{course.lessonsCount} aulas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-blue" />
                    <span className="text-brand-gray-dark">{course.studentsCount} inscritos</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={course.hasQuiz ? "text-green-600" : "text-red-600"}>
                        {course.hasQuiz ? "✓" : "✗"} Quiz
                      </span>
                      <span className={course.generatesCertificate ? "text-green-600" : "text-red-600"}>
                        {course.generatesCertificate ? "✓" : "✗"} Certificado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditCourse(course)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog de Edição */}
      <EditCourseDialog
        course={editingCourse}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveCourse}
      />
    </div>
  );
};

export default CoursesList;
