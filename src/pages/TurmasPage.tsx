import BaseLayout from "@/components/BaseLayout";
import { useState } from "react";
import { Plus, Search, Filter, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTurmas } from "@/hooks/useTurmas";
import { useCourses } from "@/hooks/useCourses";
import { TurmaCard } from "@/components/turmas/TurmaCard";
import { TurmaDetailsDialog } from "@/components/turmas/TurmaDetailsDialog";
import { CreateTurmaDialog } from "@/components/turmas/CreateTurmaDialog";
import { EditTurmaDialog } from "@/components/turmas/EditTurmaDialog";
import { EnrollStudentDialog } from "@/components/turmas/EnrollStudentDialog";
import TurmaStatusFilters from "@/components/common/TurmaStatusFilters";
import FloatingActionButton from "@/components/mobile/FloatingActionButton";
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

  const { data: allTurmas = [], isLoading } = useTurmas();
  const { data: courses = [] } = useCourses();

  // Filter only live courses
  const liveCourses = courses.filter(course => course.tipo === 'ao_vivo');

  // Filter turmas based on search and filters
  const filteredTurmas = allTurmas.filter(turma => {
    const matchesSearch = !searchTerm || 
      (turma.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       turma.code?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCourse = selectedCourse === "todos" || turma.course_id === selectedCourse;
    const matchesProfessor = professorFilter === "todos" || 
      turma.responsavel_user_id === professorFilter ||
      turma.responsavel_user?.name?.toLowerCase().includes(professorFilter.toLowerCase());
    
    // Status filter logic
    let matchesStatus;
    if (statusFilter === "todos") {
      // Default view: show only active turmas (exclude 'encerrada')
      matchesStatus = turma.status !== 'encerrada';
    } else if (statusFilter === "encerrada") {
      // Archive view: show only archived turmas
      matchesStatus = turma.status === 'encerrada';
    } else {
      // Specific status filter
      matchesStatus = turma.status === statusFilter;
    }
    
    return matchesSearch && matchesCourse && matchesStatus && matchesProfessor;
  });

  // Get unique professors for filter
  const professors = Array.from(
    new Map(
      allTurmas
        .filter(turma => turma.responsavel_user?.name)
        .map(turma => {
          const id = turma.responsavel_user_id;
          const name = turma.responsavel_user?.name;
          return [id, { id, name }];
        })
    ).values()
  ).filter(professor => professor.name);

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

  if (isLoading) {
    return (
      <BaseLayout title="Gerenciar Turmas">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Carregando turmas...</div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Gerenciar Turmas">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão de Turmas</h1>
              <p className="text-muted-foreground">Gerencie as turmas dos cursos ao vivo</p>
            </div>
          </div>
          
          {/* Desktop Create Button */}
          {!isMobile && (
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="h-11 px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Turma
            </Button>
          )}
        </div>

        {/* Filters Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="w-4 h-4" />
            Filtros e Busca
          </div>
          
          {/* Status Filters */}
          <TurmaStatusFilters 
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
          
          {/* Other Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Buscar turma</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou código da turma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Curso</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os cursos" />
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Professor</label>
              <Select value={professorFilter} onValueChange={setProfessorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os professores" />
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
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {filteredTurmas.length} turma{filteredTurmas.length !== 1 ? 's' : ''} encontrada{filteredTurmas.length !== 1 ? 's' : ''}
        </div>

        {/* Content */}
        {filteredTurmas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {allTurmas.length === 0 ? "Nenhuma turma encontrada" : "Nenhuma turma corresponde aos filtros"}
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {allTurmas.length === 0 
                ? liveCourses.length > 0 
                  ? "Crie a primeira turma para começar!"
                  : "Crie primeiro um curso 'Ao Vivo' para poder criar turmas."
                : "Tente ajustar os filtros para encontrar turmas."
              }
            </p>
            {liveCourses.length > 0 && (
              <Button onClick={() => handleCreateTurma()}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira turma
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
        {isMobile && (
          <FloatingActionButton 
            onClick={() => setCreateDialogOpen(true)}
            icon={Plus}
            label="Nova Turma"
          />
        )}

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
          courseId={filteredTurmas.find(t => t.id === selectedTurmaId)?.course_id || ""}
        />
      </div>
    </BaseLayout>
  );
};

export default TurmasPage;