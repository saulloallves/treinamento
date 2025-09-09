import BaseLayout from "@/components/BaseLayout";
import { useState } from "react";
import { Plus, Search, Filter, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTurmas } from "@/hooks/useTurmas";
import { useCourses } from "@/hooks/useCourses";
import { TurmaCard } from "@/components/turmas/TurmaCard";
import { TurmaDetailsDialog } from "@/components/turmas/TurmaDetailsDialog";
import { CreateTurmaDialog } from "@/components/turmas/CreateTurmaDialog";
import { EditTurmaDialog } from "@/components/turmas/EditTurmaDialog";
import { EnrollStudentDialog } from "@/components/turmas/EnrollStudentDialog";
import FilterDrawer from "@/components/mobile/FilterDrawer";
import FloatingActionButton from "@/components/mobile/FloatingActionButton";
import MobileCreateButton from "@/components/mobile/MobileCreateButton";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { useIsMobile } from "@/hooks/use-mobile";

const TurmasPage = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [professorFilter, setProfessorFilter] = useState("todos");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCourseForCreate, setSelectedCourseForCreate] = useState("");
  const [selectedTurmaForDetails, setSelectedTurmaForDetails] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTurmaForEdit, setSelectedTurmaForEdit] = useState<any>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedTurmaId, setSelectedTurmaId] = useState("");

  const { data: allTurmas, isLoading } = useTurmas();
  const { data: courses = [] } = useCourses();

  // Filter only live courses
  const liveCourses = courses.filter(course => course.tipo === 'ao_vivo');

  // Filter turmas based on search and filters
  const filteredTurmas = (allTurmas || []).filter(turma => {
    const matchesSearch = !searchTerm || 
      (turma.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       turma.code?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCourse = selectedCourse === "todos" || turma.course_id === selectedCourse;
    const matchesStatus = statusFilter === "todos" || turma.status === statusFilter;
    const matchesProfessor = professorFilter === "todos" || 
      turma.responsavel_user_id === professorFilter ||
      turma.responsavel_user?.name?.toLowerCase().includes(professorFilter.toLowerCase());
    
    return matchesSearch && matchesCourse && matchesStatus && matchesProfessor;
  });

  // Get unique professors for filter
  const professors = Array.from(
    new Set(
      (allTurmas || [])
        .filter(turma => turma.responsavel_user?.name)
        .map(turma => ({
          id: turma.responsavel_user_id,
          name: turma.responsavel_user?.name
        }))
    )
  );

  const handleCreateTurma = (courseId?: string) => {
    setSelectedCourseForCreate(courseId || "");
    setCreateDialogOpen(true);
  };

  const handleViewTurmaDetails = (turma: any) => {
    setSelectedTurmaForDetails(turma);
    setDetailsDialogOpen(true);
  };

  const handleEnrollStudent = (turmaId: string) => {
    setSelectedTurmaId(turmaId);
    setEnrollDialogOpen(true);
  };

  const handleEditTurma = (turma: any) => {
    setSelectedTurmaForEdit(turma);
    setEditDialogOpen(true);
  };

  // Get active filters count for mobile drawer
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCourse !== "todos") count++;
    if (statusFilter !== "todos") count++;
    if (professorFilter !== "todos") count++;
    return count;
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCourse("todos");
    setStatusFilter("todos");
    setProfessorFilter("todos");
  };

  const filterOptions = [
    {
      key: 'course',
      label: 'Curso',
      value: selectedCourse,
      onChange: setSelectedCourse,
      options: [
        { value: 'todos', label: 'Todos os cursos' },
        ...liveCourses.map(course => ({ value: course.id, label: course.name }))
      ]
    },
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'todos', label: 'Todos' },
        { value: 'agendada', label: 'Agendada' },
        { value: 'em_andamento', label: 'Em Andamento' },
        { value: 'encerrada', label: 'Encerrada' },
        { value: 'cancelada', label: 'Cancelada' }
      ]
    },
    {
      key: 'professor',
      label: 'Professor',
      value: professorFilter,
      onChange: setProfessorFilter,
      options: [
        { value: 'todos', label: 'Todos os professores' },
        ...professors.map(professor => ({ value: professor.id, label: professor.name }))
      ]
    }
  ];

  if (isLoading) {
    return (
      <BaseLayout title="Gerenciar Turmas">
        <div className={`${isMobile ? 'mobile-spacing' : 'space-y-6'}`}>
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className={`${isMobile ? 'h-6 w-32' : 'h-8 w-48'} bg-muted animate-pulse rounded`} />
              {!isMobile && (
                <div className="h-4 w-64 bg-muted animate-pulse rounded mt-1" />
              )}
            </div>
            <div className={`${isMobile ? 'h-10 w-24' : 'h-11 w-32'} bg-muted animate-pulse rounded`} />
          </div>

          {/* Loading cards */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} variant={isMobile ? 'compact' : 'default'} />
            ))}
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Gerenciar Turmas">
      <div className={`${isMobile ? 'mobile-spacing pb-20' : 'space-y-6'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
              {isMobile ? 'Turmas' : 'Gestão de Turmas'}
            </h1>
            {!isMobile && (
              <p className="text-muted-foreground">Gerencie as turmas dos cursos ao vivo</p>
            )}
          </div>
          {!isMobile && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          )}
        </div>

        {/* Filters */}
        {isMobile ? (
          <FilterDrawer
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filterOptions}
            activeFiltersCount={getActiveFiltersCount()}
            onClearFilters={clearAllFilters}
          >
            <Accordion type="single" collapsible className="w-full" defaultValue="filters">
              <AccordionItem value="filters">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros e Busca
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    {/* Desktop filters content */}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </FilterDrawer>
        ) : (
          <Accordion type="single" collapsible className="w-full" defaultValue="filters">
            <AccordionItem value="filters">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros e Busca
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Buscar turma
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Nome ou código da turma..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Curso
                    </label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar curso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os cursos</SelectItem>
                        {liveCourses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="agendada">Agendada</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="encerrada">Encerrada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Professor
                    </label>
                    <Select value={professorFilter} onValueChange={setProfessorFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar professor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os professores</SelectItem>
                        {professors.map(professor => (
                          <SelectItem key={professor.id} value={professor.id}>
                            {professor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Content */}
        {filteredTurmas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {allTurmas?.length === 0 
                ? "Nenhuma turma criada ainda." 
                : "Nenhuma turma encontrada com os filtros aplicados."
              }
            </div>
            {liveCourses.length > 0 ? (
              <Button onClick={() => handleCreateTurma()}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira turma
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                Crie primeiro um curso "Ao Vivo" para poder criar turmas.
              </div>
            )}
          </div>
        ) : (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {filteredTurmas.map((turma) => {
              const course = courses.find(c => c.id === turma.course_id);
              return (
                <TurmaCard
                  key={turma.id}
                  turma={turma}
                  course={course}
                  onViewDetails={handleViewTurmaDetails}
                  onEnrollStudent={handleEnrollStudent}
                  onEditTurma={handleEditTurma}
                />
              );
            })}
          </div>
        )}

        {/* Mobile FAB */}
        <FloatingActionButton 
          onClick={() => setCreateDialogOpen(true)}
          label="Nova Turma"
          className="z-50"
        />

        {/* Dialogs */}
        <CreateTurmaDialog
          courseId={selectedCourseForCreate}
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) setSelectedCourseForCreate("");
          }}
        />

        <TurmaDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          turma={selectedTurmaForDetails}
          course={selectedTurmaForDetails ? courses.find(c => c.id === selectedTurmaForDetails.course_id) : null}
        />

        <EditTurmaDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          turma={selectedTurmaForEdit}
        />

        <EnrollStudentDialog
          open={enrollDialogOpen}
          onOpenChange={setEnrollDialogOpen}
          turmaId={selectedTurmaId}
          courseId={selectedTurmaForDetails?.course_id || ""}
        />
      </div>
    </BaseLayout>
  );
};

export default TurmasPage;