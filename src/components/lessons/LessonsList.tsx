
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Video, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditLessonDialog from "./EditLessonDialog";
import CreateLessonDialog from "./CreateLessonDialog";
import { useLessons, useDeleteLesson, Lesson } from "@/hooks/useLessons";
import { useCourses } from "@/hooks/useCourses";

const LessonsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: lessons = [], isLoading } = useLessons();
  const { data: courses = [] } = useCourses();
  const deleteLessonMutation = useDeleteLesson();

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsEditDialogOpen(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta aula?")) {
      await deleteLessonMutation.mutateAsync(lessonId);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "todos" || lesson.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-brand-gray-dark">Carregando aulas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Aulas</h1>
          <p className="text-brand-gray-dark">Gerencie as aulas dos cursos</p>
        </div>
        <Button 
          className="btn-primary"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Nova Aula
        </Button>
      </div>

      {/* Filtros */}
      <div className="card-clean p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-brand-black mb-1">
              Buscar aula
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray-dark w-4 h-4" />
              <Input
                placeholder="Digite o nome da aula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Curso
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="todos">Todos os cursos</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Aulas */}
      <div className="grid gap-4">
        {filteredLessons.map((lesson) => (
          <div key={lesson.id} className="card-clean p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-brand-black">
                    {lesson.title}
                  </h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-brand-blue-light text-brand-blue">
                    Ordem {lesson.order_index}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      lesson.status === "Ativo"
                        ? "bg-green-100 text-green-700"
                        : lesson.status === "Em revisão"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {lesson.status}
                  </span>
                </div>
                
                <p className="text-brand-gray-dark mb-3">
                  Curso: <span className="font-medium">{lesson.courses?.name}</span>
                </p>

                {lesson.description && (
                  <p className="text-brand-gray-dark mb-3">{lesson.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-blue" />
                    <span className="text-brand-gray-dark">
                      {lesson.duration_minutes} minutos
                    </span>
                  </div>
                  
                  {lesson.video_url && (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-brand-blue" />
                      <span className="text-brand-gray-dark">Vídeo disponível</span>
                    </div>
                  )}
                  
                  {lesson.video_url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-brand-blue" />
                      <span className="text-green-600">Link Ativo</span>
                    </div>
                  )}
                </div>
                
                {lesson.video_url && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <span className="text-brand-gray-dark">Link: </span>
                    <span className="text-brand-blue">{lesson.video_url}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditLesson(lesson)}
                  disabled={deleteLessonMutation.isPending}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteLesson(lesson.id)}
                  disabled={deleteLessonMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLessons.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-brand-gray-dark">
            {lessons.length === 0 
              ? "Nenhuma aula encontrada. Crie a primeira aula!" 
              : "Nenhuma aula corresponde aos filtros aplicados."
            }
          </p>
        </div>
      )}

      {/* Dialogs */}
      <CreateLessonDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      <EditLessonDialog
        lesson={editingLesson}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default LessonsList;
