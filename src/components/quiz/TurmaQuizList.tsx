import { useState } from "react";
import { Search, Filter, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTurmas, Turma } from "@/hooks/useTurmas";
import { useCourses } from "@/hooks/useCourses";
import { useQuiz } from "@/hooks/useQuiz";
import TurmaQuizCard from "./TurmaQuizCard";

interface TurmaQuizListProps {
  onSelectTurma: (turma: Turma) => void;
}

const TurmaQuizList = ({ onSelectTurma }: TurmaQuizListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

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
    const matchesStatus = !selectedStatus || selectedStatus === "all" || turma.status === selectedStatus;
    
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
    <div className="space-y-8">
      {/* Filtros - Layout otimizado */}
      <Card className="border-0 shadow-clean bg-muted/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Filter className="w-4 h-4 text-primary" />
            </div>
            Filtrar Turmas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome da turma, código ou curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-0 bg-background shadow-sm"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Curso</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="h-11 border-0 bg-background shadow-sm">
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
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-11 border-0 bg-background shadow-sm">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                  <SelectItem value="inscricoes_encerradas">Inscrições Encerradas</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="encerrada">Encerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cabeçalho dos resultados */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {filteredTurmas.length} turma{filteredTurmas.length !== 1 ? 's' : ''} encontrada{filteredTurmas.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Grid otimizada - Mobile first com 2 colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredTurmas.map((turma) => (
          <TurmaQuizCard
            key={turma.id}
            turma={turma}
            onManageQuizzes={onSelectTurma}
          />
        ))}
      </div>

      {/* Estado vazio melhorado */}
      {filteredTurmas.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma turma encontrada
          </h3>
          <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros ou verificar se existem turmas cadastradas.
          </p>
        </div>
      )}
    </div>
  );
};

export default TurmaQuizList;