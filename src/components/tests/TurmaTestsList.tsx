import { useState } from "react";
import { Search, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTurmas, Turma } from "@/hooks/useTurmas";
import { useCourses } from "@/hooks/useCourses";
import { useTests } from "@/hooks/useTests";
import TurmaTestCard from "./TurmaTestCard";

interface TurmaTestsListProps {
  onSelectTurma: (turma: Turma) => void;
}

const TurmaTestsList = ({ onSelectTurma }: TurmaTestsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const { data: turmas = [], isLoading: turmasLoading } = useTurmas();
  const { data: courses = [] } = useCourses();
  const { data: tests = [] } = useTests();

  // Count tests per turma
  const turmasWithTestCount = turmas.map(turma => {
    const testCount = tests.filter(test => test.turma_id === turma.id).length;
    const activeTestCount = tests.filter(test => test.turma_id === turma.id && test.status === 'active').length;
    const course = courses.find(c => c.id === turma.course_id);
    return {
      ...turma,
      testCount,
      activeTestCount,
      course
    };
  });

  // Filter turmas
  const filteredTurmas = turmasWithTestCount.filter(turma => {
    const matchesSearch = !searchTerm || 
      turma.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.course?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = !selectedCourse || selectedCourse === "all" || turma.course_id === selectedCourse;
    
    // Show only active turmas (em_andamento and agendada)
    const matchesStatus = turma.status === 'em_andamento' || turma.status === 'agendada';
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (turmasLoading) {
    return <div className="text-center py-8">Carregando turmas...</div>;
  }

  if (turmas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma turma encontrada.</p>
        <p className="text-sm mt-2">Crie turmas primeiro para gerenciar testes por turma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Nome da turma, código ou curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
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

      {/* Results count */}
      {filteredTurmas.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {filteredTurmas.length} turma{filteredTurmas.length !== 1 ? 's' : ''} encontrada{filteredTurmas.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Grid das turmas */}
      {filteredTurmas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTurmas.map((turma) => (
            <TurmaTestCard
              key={turma.id}
              turma={turma}
              onManageTests={onSelectTurma}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma turma encontrada
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Tente ajustar os filtros ou verificar se existem turmas cadastradas.
          </p>
        </div>
      )}
    </div>
  );
};

export default TurmaTestsList;