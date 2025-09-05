import { useState } from "react";
import { Search, Filter } from "lucide-react";
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
    
    const matchesCourse = !selectedCourse || turma.course_id === selectedCourse;
    const matchesStatus = !selectedStatus || turma.status === selectedStatus;
    
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
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtrar Turmas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome da turma, código ou curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os cursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os cursos</SelectItem>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
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

      {/* Lista de Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTurmas.map((turma) => (
          <TurmaQuizCard
            key={turma.id}
            turma={turma}
            onManageQuizzes={onSelectTurma}
          />
        ))}
      </div>

      {filteredTurmas.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma turma encontrada com os filtros aplicados.
        </div>
      )}
    </div>
  );
};

export default TurmaQuizList;