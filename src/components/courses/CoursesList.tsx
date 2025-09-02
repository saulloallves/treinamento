
import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Users, BookOpen, Eye, Video, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationCustom } from "@/components/ui/pagination-custom";
import EditCourseDialog from "./EditCourseDialog";
import CreateCourseDialog from "./CreateCourseDialog";
import StudentEnrollmentsDialog from "./StudentEnrollmentsDialog";
import RecordedLessonsDialog from "./RecordedLessonsDialog";
import RecordedCoursesDialog from "./RecordedCoursesDialog";
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: courses = [], isLoading } = useCourses();
  const deleteCourseMutation = useDeleteCourse();

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterPublic === "todos" || course.public_target === filterPublic;
      const matchesStatus = statusFilter === "todos" || course.status === statusFilter;
      return matchesSearch && matchesFilter && matchesStatus;
    });
  }, [courses, searchTerm, filterPublic, statusFilter]);

  // Group courses by status for tabs
  const activeCourses = useMemo(() => filteredCourses.filter(c => c.status === "Ativo"), [filteredCourses]);
  const inReviewCourses = useMemo(() => filteredCourses.filter(c => c.status === "Em revisão"), [filteredCourses]);
  const draftCourses = useMemo(() => filteredCourses.filter(c => c.status === "Rascunho"), [filteredCourses]);

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
      <div className="space-y-4">
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid gap-3'}`}>
          {paginatedCourses.map((course) => (
            <div key={course.id} className={`card-clean ${viewMode === 'grid' ? 'p-3' : 'p-4'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold text-brand-black ${viewMode === 'grid' ? 'text-sm' : 'text-base'} line-clamp-1`}>
                      {course.name}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-brand-blue-light text-brand-blue">
                      {course.theme}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      course.tipo === 'gravado' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {course.tipo === 'gravado' ? 'Gravado' : 'Ao Vivo'}
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
                  
                  {viewMode === 'list' && (
                    <p className="text-brand-gray-dark text-sm mb-2 line-clamp-1">{course.description || "Sem descrição"}</p>
                  )}
                  
                  <div className={`${viewMode === 'grid' ? 'flex flex-col gap-1' : 'grid grid-cols-2 md:grid-cols-4 gap-3'} text-xs`}>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-brand-blue" />
                      <span className="text-brand-gray-dark truncate">
                        {getPublicTargetLabel(course.public_target)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-brand-blue" />
                      <span className="text-brand-gray-dark">{course.lessons_count} aulas</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className={course.has_quiz ? "text-green-600" : "text-red-600"}>
                        {course.has_quiz ? "✓" : "✗"} Quiz
                      </span>
                      <span className={course.generates_certificate ? "text-green-600" : "text-red-600"}>
                        {course.generates_certificate ? "✓" : "✗"} Cert
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1 ml-2">
                  {course.tipo === 'gravado' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewRecordedCourses(course.id, course.name)}
                      title="Gerenciar Módulos e Aulas"
                    >
                      <Video className="w-3 h-3" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewStudents(course.id, course.name)}
                    title="Visualizar Alunos"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditCourse(course)}
                    disabled={deleteCourseMutation.isPending}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                    disabled={deleteCourseMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
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
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Cursos</h1>
          <p className="text-brand-gray-dark">Gerencie os cursos de treinamento</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-md p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            className="btn-primary"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Criar Novo Curso
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
            <div className="card-clean p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                    className="h-10 w-full px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="todos">Todos os status</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Em revisão">Em revisão</option>
                    <option value="Rascunho">Rascunho</option>
                  </select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tabs por Status */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Todos ({filteredCourses.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativos ({activeCourses.length})
          </TabsTrigger>
          <TabsTrigger value="review">
            Em Revisão ({inReviewCourses.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Rascunhos ({draftCourses.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
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
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          {activeCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-gray-dark">Nenhum curso ativo encontrado.</p>
            </div>
          ) : (
            renderCourseGrid(activeCourses)
          )}
        </TabsContent>
        
        <TabsContent value="review" className="mt-4">
          {inReviewCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-gray-dark">Nenhum curso em revisão encontrado.</p>
            </div>
          ) : (
            renderCourseGrid(inReviewCourses)
          )}
        </TabsContent>
        
        <TabsContent value="draft" className="mt-4">
          {draftCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-gray-dark">Nenhum rascunho encontrado.</p>
            </div>
          ) : (
            renderCourseGrid(draftCourses)
          )}
        </TabsContent>
      </Tabs>

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
    </div>
  );
};

export default CoursesList;
