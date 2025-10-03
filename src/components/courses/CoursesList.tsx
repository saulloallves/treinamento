
import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseCard } from "@/components/courses/CourseCard";
import { PaginationCustom } from "@/components/ui/pagination-custom";
import EditCourseDialog from "./EditCourseDialog";
import StudentEnrollmentsDialog from "./StudentEnrollmentsDialog";
import RecordedLessonsDialog from "./RecordedLessonsDialog";
import RecordedCoursesDialog from "./RecordedCoursesDialog";
import { CourseDetailDialog } from "./CourseDetailDialog";
import { useCourses, useDeleteCourse, Course } from "@/hooks/useCourses";

interface CoursesListProps {
  onCreateCourse?: () => void;
}

const CoursesList = ({ onCreateCourse }: CoursesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPublic, setFilterPublic] = useState("todos");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCourseName, setSelectedCourseName] = useState<string>("");
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [recordedLessonsDialogOpen, setRecordedLessonsDialogOpen] = useState(false);
  const [recordedCoursesDialogOpen, setRecordedCoursesDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

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
        <div className="text-muted-foreground">Carregando cursos...</div>
      </div>
    );
  }

  const renderCourseGrid = (coursesList: Course[]) => {
    const { courses: paginatedCourses, totalPages, totalItems } = getPaginatedCourses(coursesList);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
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
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filtros e Busca
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Buscar curso</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Público-alvo</label>
            <Select value={filterPublic} onValueChange={(value) => handleFilterChange(setFilterPublic, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="franqueado">Franqueado</SelectItem>
                <SelectItem value="colaborador">Colaborador</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo</label>
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange(setStatusFilter, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="gravado">Treinamento</SelectItem>
                <SelectItem value="ao_vivo">Curso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
      </div>

      {/* Content */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {courses.length === 0 ? "Nenhum curso encontrado" : "Nenhum curso corresponde aos filtros"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {courses.length === 0 
              ? "Crie o primeiro curso para começar!"
              : "Tente ajustar os filtros para encontrar cursos."
            }
          </p>
        </div>
      ) : (
        renderCourseGrid(filteredCourses)
      )}

      {/* Dialogs */}
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
