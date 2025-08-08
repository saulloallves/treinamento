
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Video, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditLessonDialog from "./EditLessonDialog";

interface Lesson {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  type: string;
  link: string;
  order: number;
  duration: string;
  status: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

const LessonsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: 1,
      name: "Introdução à Segurança",
      courseId: 1,
      courseName: "Segurança no Trabalho",
      type: "gravada",
      link: "https://drive.google.com/...",
      order: 1,
      duration: "25min",
      status: "Ativo"
    },
    {
      id: 2,
      name: "EPI - Equipamentos de Proteção",
      courseId: 1,
      courseName: "Segurança no Trabalho",
      type: "gravada",
      link: "https://drive.google.com/...",
      order: 2,
      duration: "30min",
      status: "Ativo"
    },
    {
      id: 3,
      name: "Workshop - Primeiros Socorros",
      courseId: 1,
      courseName: "Segurança no Trabalho",
      type: "ao_vivo",
      link: "https://zoom.us/j/...",
      order: 3,
      scheduledDate: "2024-01-15",
      scheduledTime: "14:00",
      duration: "60min",
      status: "Agendada"
    },
    {
      id: 4,
      name: "Técnicas de Abordagem",
      courseId: 2,
      courseName: "Atendimento ao Cliente",
      type: "gravada",
      link: "https://drive.google.com/...",
      order: 1,
      duration: "20min",
      status: "Ativo"
    }
  ]);

  const courses = [
    { id: 1, name: "Segurança no Trabalho" },
    { id: 2, name: "Atendimento ao Cliente" },
    { id: 3, name: "Gestão Franqueado" }
  ];

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsEditDialogOpen(true);
  };

  const handleSaveLesson = (updatedLesson: Lesson) => {
    setLessons(lessons.map(lesson => 
      lesson.id === updatedLesson.id ? updatedLesson : lesson
    ));
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "todos" || lesson.courseId.toString() === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const isLinkActive = (lesson: Lesson) => {
    if (lesson.type === "gravada") return true;
    if (lesson.type === "ao_vivo" && lesson.scheduledDate) {
      const now = new Date();
      const scheduledDateTime = new Date(`${lesson.scheduledDate}T${lesson.scheduledTime}`);
      return scheduledDateTime > now;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Aulas</h1>
          <p className="text-brand-gray-dark">Gerencie as aulas dos cursos</p>
        </div>
        <Button className="btn-primary">
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
                <option key={course.id} value={course.id.toString()}>
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
                    {lesson.name}
                  </h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-brand-blue-light text-brand-blue">
                    Ordem {lesson.order}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lesson.type === "gravada" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {lesson.type === "gravada" ? "Gravada" : "Ao Vivo"}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      lesson.status === "Ativo"
                        ? "bg-green-100 text-green-700"
                        : lesson.status === "Agendada"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {lesson.status}
                  </span>
                </div>
                
                <p className="text-brand-gray-dark mb-3">
                  Curso: <span className="font-medium">{lesson.courseName}</span>
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-brand-blue" />
                    <span className="text-brand-gray-dark">
                      Duração: {lesson.duration}
                    </span>
                  </div>
                  
                  {lesson.type === "ao_vivo" && lesson.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-blue" />
                      <span className="text-brand-gray-dark">
                        {lesson.scheduledDate} às {lesson.scheduledTime}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-brand-blue" />
                    <span className={`${
                      isLinkActive(lesson) ? "text-green-600" : "text-red-600"
                    }`}>
                      Link {isLinkActive(lesson) ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                
                {lesson.link && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <span className="text-brand-gray-dark">Link: </span>
                    <span className="text-brand-blue">{lesson.link}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditLesson(lesson)}>
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

      <EditLessonDialog
        lesson={editingLesson}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveLesson}
      />
    </div>
  );
};

export default LessonsList;
