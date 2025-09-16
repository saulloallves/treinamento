
import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Users, BookOpen, Eye, Video, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CourseCard } from "@/components/courses/CourseCard";
import { PaginationCustom } from "@/components/ui/pagination-custom";
import CreateCourseDialog from "./CreateCourseDialog";
import EditCourseDialog from "./EditCourseDialog";
import StudentEnrollmentsDialog from "./StudentEnrollmentsDialog";
import RecordedLessonsDialog from "./RecordedLessonsDialog";
import RecordedCoursesDialog from "./RecordedCoursesDialog";
import { CourseDetailDialog } from "./CourseDetailDialog";
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
  const [recordedLessonsDialogOpen, setRecordedLessonsDialogOpen] = useState(false);
  const [recordedCoursesDialogOpen, setRecordedCoursesDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: courses = [], isLoading } = useCourses();
  const deleteCourseMutation = useDeleteCourse();

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterPublic === "todos" || course.public_target === filterPublic;
      const matchesType = statusFilter === "todos" || 
        (statusFilter === "gravado" && course.tipo === "gravado") ||
        (statusFilter === "ao_vivo" && course.tipo === "ao_vivo");
      return matchesSearch && matchesFilter && matchesType;
    });
  }, [courses, searchTerm, filterPublic, statusFilter]);

  // Pagination logic
  const getPaginatedCourses = (coursesList: Course[]) => {
    const totalPages = Math.ceil(coursesList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      courses: coursesList.slice(startIndex, endIndex),
      totalPages,
      totalItems: coursesList.length
    };
  };

  // Reset to first page when filters change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

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

  const handleViewRecordedLessons = (courseId: string, courseName: string) => {
    setSelectedCourseId(courseId);
    setSelectedCourseName(courseName);
    setRecordedLessonsDialogOpen(true);
  };

  const handleViewRecordedCourses = (courseId: string, courseName: string) => {
    setSelectedCourseId(courseId);
    setSelectedCourseName(courseName);
    setRecordedCoursesDialogOpen(true);
  };

  const handleViewCourseDetail = (course: Course) => {
    setSelectedCourse(course);
    setDetailDialogOpen(true);
  };

  const handleViewAsStudent = (course: Course) => {
    // For recorded courses, open the dialog in preview mode
    if (course.tipo === 'gravado') {
      setSelectedCourseId(course.id);
      setSelectedCourseName(course.name);
      setRecordedCoursesDialogOpen(true);
    }
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

  const renderCourseGrid = (coursesList: Course[]) => {
    const { courses: paginatedCourses, totalPages, totalItems } = getPaginatedCourses(coursesList);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {paginatedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              onViewStudents={(course) => handleViewStudents(course.id, course.name)}
              onViewDetails={handleViewCourseDetail}
              onViewRecordedLessons={handleViewRecordedLessons}
              onViewRecordedCourses={handleViewRecordedCourses}
              
            />
          ))}
        </div>
        
        {totalPages > 1 && (
          <PaginationCustom
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="cursos"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-brand-black">Cursos</h1>
          <p className="text-xs sm:text-base text-brand-gray-dark">Gerencie os cursos de treinamento</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="btn-primary h-10 md:h-11 w-full sm:w-auto text-sm md:text-base"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Criar Novo Curso</span>
            <span className="sm:hidden">Novo Curso</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Accordion type="single" collapsible className="w-full" defaultValue="filters">
        <AccordionItem value="filters">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Filtros e Busca
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="card-clean p-3 md:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">
                    Buscar curso
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray-dark w-4 h-4" />
                    <Input
                      placeholder="Digite o nome do curso..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
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
                    onChange={(e) => handleFilterChange(setFilterPublic, e.target.value)}
                    className="h-10 w-full px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="todos">Todos</option>
                    <option value="franqueado">Franqueado</option>
                    <option value="colaborador">Colaborador</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">
                    Tipo
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                    className="h-10 w-full px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="todos">Todos</option>
                    <option value="gravado">Treinamento</option>
                    <option value="ao_vivo">Curso</option>
                  </select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Conteúdo dos Cursos */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-brand-gray-dark">
            {courses.length === 0 
              ? "Nenhum curso encontrado. Crie o primeiro curso!" 
              : "Nenhum curso corresponde aos filtros aplicados."
            }
          </p>
        </div>
      ) : (
        renderCourseGrid(filteredCourses)
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

      <RecordedLessonsDialog
        courseId={selectedCourseId}
        courseName={selectedCourseName}
        open={recordedLessonsDialogOpen}
        onOpenChange={setRecordedLessonsDialogOpen}
      />

      <RecordedCoursesDialog
        courseId={selectedCourseId}
        courseName={selectedCourseName}
        open={recordedCoursesDialogOpen}
        onOpenChange={setRecordedCoursesDialogOpen}
      />

      <CourseDetailDialog
        course={selectedCourse}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
};

export default CoursesList;
