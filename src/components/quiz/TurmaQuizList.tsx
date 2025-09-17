import { useState } from "react";
import { Search, Filter, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTurmas, Turma } from "@/hooks/useTurmas";
import { useCourses } from "@/hooks/useCourses";
import { useQuiz } from "@/hooks/useQuiz";
import TurmaQuizCard from "./TurmaQuizCard";
import TurmaStatusFilters from "@/components/common/TurmaStatusFilters";

interface TurmaQuizListProps {
  onSelectTurma: (turma: Turma) => void;
}

const TurmaQuizList = ({ onSelectTurma }: TurmaQuizListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");

  const { data: turmas = [], isLoading: turmasLoading } = useTurmas();
  const { data: courses = [] } = useCourses();
  const { data: quizQuestions = [] } = useQuiz();

  // Count quizzes per turma
  const turmasWithQuizCount = turmas.map(turma => {
    const quizCount = quizQuestions.filter(q => q.turma_id === turma.id).length;
    const course = courses.find(c => c.id === turma.course_id);
    return {
      ...turma,
      quizCount,
      course
    };
  });

  // Filter turmas
  const filteredTurmas = turmasWithQuizCount.filter(turma => {
    const matchesSearch = !searchTerm || 
      turma.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.course?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = !selectedCourse || selectedCourse === "all" || turma.course_id === selectedCourse;
    
    // Status filter logic (same as TurmasPage)
    let matchesStatus;
    if (selectedStatus === "todos" || selectedStatus === "all") {
      // Default view: show only active turmas (exclude 'encerrada')
      matchesStatus = turma.status !== 'encerrada';
    } else if (selectedStatus === "encerrada") {
      // Archive view: show only archived turmas
      matchesStatus = turma.status === 'encerrada';
    } else {
      // Specific status filter
      matchesStatus = turma.status === selectedStatus;
    }
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (turmasLoading) {
    return <div className="text-center py-8">Carregando turmas...</div>;
  }

  if (turmas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma turma encontrada.</p>
        <p className="text-sm mt-2">Crie turmas primeiro para gerenciar quizzes por turma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filtrar Turmas
        </div>
        <TurmaStatusFilters 
          statusFilter={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {/* Search and Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nome da turma, código ou curso..."
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
              <SelectItem value="all">Todos os cursos</SelectItem>
              {courses.map((course: any) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredTurmas.length} turma{filteredTurmas.length !== 1 ? 's' : ''} encontrada{filteredTurmas.length !== 1 ? 's' : ''}
      </div>

      {/* Grid das turmas */}
      {filteredTurmas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredTurmas.map((turma) => (
            <TurmaQuizCard
              key={turma.id}
              turma={turma}
              onManageQuizzes={onSelectTurma}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma turma encontrada
          </h3>
          <p className="text-muted-foreground max-w-md">
            Tente ajustar os filtros ou verificar se existem turmas cadastradas.
          </p>
        </div>
      )}
    </div>
  );
};

export default TurmaQuizList;