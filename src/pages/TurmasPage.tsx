import BaseLayout from "@/components/BaseLayout";
import { useState } from "react";
import { Plus, Search, Filter, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTurmas } from "@/hooks/useTurmas";
import { useCourses } from "@/hooks/useCourses";

import { TurmaDetailsDialog } from "@/components/turmas/TurmaDetailsDialog";
import { CreateTurmaDialog } from "@/components/turmas/CreateTurmaDialog";
import { EditTurmaDialog } from "@/components/turmas/EditTurmaDialog";
import { EnrollStudentDialog } from "@/components/turmas/EnrollStudentDialog";
import { TurmaKanbanBoard } from "@/components/turmas/TurmaKanbanBoard";
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

  // Filter turmas based on search and filters (for Kanban we show all status)
  const filteredTurmas = allTurmas.filter(turma => {
    const matchesSearch = !searchTerm || 
      (turma.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       turma.code?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCourse = selectedCourse === "todos" || turma.course_id === selectedCourse;
    const matchesProfessor = professorFilter === "todos" || 
      turma.responsavel_user_id === professorFilter ||
      turma.responsavel_user?.name?.toLowerCase().includes(professorFilter.toLowerCase());
    
    return matchesSearch && matchesCourse && matchesProfessor;
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
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Gestão de Turmas</h1>
                <p className="text-xs text-muted-foreground">Gerencie as turmas dos cursos ao vivo</p>
              </div>
            </div>
            
            {/* Desktop Create Button */}
            {!isMobile && (
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                size="sm"
                className="h-8"
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Nova Turma
              </Button>
            )}
          </div>
        </div>


        {/* Kanban Board Section */}  
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="w-4 h-4" />
            Painel Visual - Kanban
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar turma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[180px] h-8 text-sm">
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
            
            <Select value={professorFilter} onValueChange={setProfessorFilter}>
              <SelectTrigger className="w-[180px] h-8 text-sm">
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

        {/* Kanban Board */}
        {allTurmas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="section-title mb-2">
              Nenhuma turma encontrada
            </h3>
            <p className="description max-w-md mb-4">
              {liveCourses.length > 0 
                ? "Crie a primeira turma para começar!"
                : "Crie primeiro um curso 'Ao Vivo' para poder criar turmas."
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
          <TurmaKanbanBoard
            turmas={filteredTurmas}
            courses={courses}
            onViewDetails={handleViewTurmaDetails}
            onEnrollStudent={handleEnrollStudent}
            onEditTurma={handleEditTurma}
          />
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