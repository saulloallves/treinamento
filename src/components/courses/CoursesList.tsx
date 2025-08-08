
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Users, BookOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditCourseDialog from "./EditCourseDialog";
import CreateCourseDialog from "./CreateCourseDialog";
import StudentEnrollmentsDialog from "./StudentEnrollmentsDialog";
import { useCourses, useDeleteCourse, Course } from "@/hooks/useCourses";

const CoursesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPublic, setFilterPublic] = useState("todos");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCourseName, setSelectedCourseName] = useState<string>("");
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);

  const { data: courses = [], isLoading } = useCourses();
  const deleteCourseMutation = useDeleteCourse();

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPublic === "todos" || course.public_target === filterPublic;
    return matchesSearch && matchesFilter;
  });

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditDialogOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este curso?")) {
      await deleteCourseMutation.mutateAsync(courseId);
    }
  };

  const handleViewStudents = (courseId: string, courseName: string) => {
    setSelectedCourseId(courseId);
    setSelectedCourseName(courseName);
    setStudentsDialogOpen(true);
  };

  const getPublicTargetLabel = (target: string) => {
    switch (target) {
      case "franqueado": return "Franqueado";
      case "colaborador": return "Colaborador";
      case "ambos": return "Ambos";
      default: return target;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-brand-gray-dark">Carregando cursos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Cursos</h1>
          <p className="text-brand-gray-dark">Gerencie os cursos de treinamento</p>
        </div>
        <Button 
          className="btn-primary"
          onClick={() => setCreateDialogOpen(true)}
        >
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
                        : course.status === "Em revisão"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                
                <p className="text-brand-gray-dark mb-4">{course.description || "Sem descrição"}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-blue" />
                    <span className="text-brand-gray-dark">
                      Público: {getPublicTargetLabel(course.public_target)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-blue" />
                    <span className="text-brand-gray-dark">{course.lessons_count} aulas</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={course.has_quiz ? "text-green-600" : "text-red-600"}>
                        {course.has_quiz ? "✓" : "✗"} Quiz
                      </span>
                      <span className={course.generates_certificate ? "text-green-600" : "text-red-600"}>
                        {course.generates_certificate ? "✓" : "✗"} Certificado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewStudents(course.id, course.name)}
                  title="Visualizar Alunos"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditCourse(course)}
                  disabled={deleteCourseMutation.isPending}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteCourse(course.id)}
                  disabled={deleteCourseMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-brand-gray-dark">
            {courses.length === 0 
              ? "Nenhum curso encontrado. Crie o primeiro curso!" 
              : "Nenhum curso corresponde aos filtros aplicados."
            }
          </p>
        </div>
      )}

      {/* Dialogs */}
      <CreateCourseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      
      <EditCourseDialog
        course={editingCourse}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <StudentEnrollmentsDialog
        courseId={selectedCourseId}
        courseName={selectedCourseName}
        open={studentsDialogOpen}
        onOpenChange={setStudentsDialogOpen}
      />
    </div>
  );
};

export default CoursesList;
