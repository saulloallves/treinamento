import BaseLayout from "@/components/BaseLayout";
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTurmas } from "@/hooks/useTurmas";
import { useCourses } from "@/hooks/useCourses";
import { TurmasManagementCard } from "@/components/turmas/TurmasManagementCard";
import { CreateTurmaDialog } from "@/components/turmas/CreateTurmaDialog";

const TurmasPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCourseForCreate, setSelectedCourseForCreate] = useState("");

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
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Group turmas by course
  const turmasByCourse = filteredTurmas.reduce((acc, turma) => {
    const courseId = turma.course_id;
    if (!acc[courseId]) {
      const course = courses.find(c => c.id === courseId);
      acc[courseId] = {
        course,
        turmas: []
      };
    }
    acc[courseId].turmas.push(turma);
    return acc;
  }, {} as Record<string, { course: any; turmas: any[] }>);

  const handleCreateTurma = (courseId: string) => {
    setSelectedCourseForCreate(courseId);
    setCreateDialogOpen(true);
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Turmas</h1>
            <p className="text-muted-foreground">Gerencie as turmas dos cursos ao vivo</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Turma
          </Button>
        </div>

        {/* Filters */}
        <Accordion type="single" collapsible className="w-full" defaultValue="filters">
          <AccordionItem value="filters">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros e Busca
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Content */}
        {Object.keys(turmasByCourse).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {allTurmas?.length === 0 
                ? "Nenhuma turma criada ainda." 
                : "Nenhuma turma encontrada com os filtros aplicados."
              }
            </div>
            {liveCourses.length > 0 ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
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
          <div className="space-y-6">
            {Object.entries(turmasByCourse).map(([courseId, { course, turmas }]) => (
              <TurmasManagementCard
                key={courseId}
                course={course}
                turmas={turmas}
                onCreateTurma={() => handleCreateTurma(courseId)}
              />
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <CreateTurmaDialog
          courseId={selectedCourseForCreate}
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) setSelectedCourseForCreate("");
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default TurmasPage;