import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailedTurmaReports } from "@/hooks/useDetailedTurmaReports";
import { 
  Users,
  Search,
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  User
} from "lucide-react";

interface StudentQuizSummaryProps {
  turmaId: string;
  turmaName: string;
  courseName: string;
  onBack: () => void;
  onSelectStudent: (studentId: string, studentName: string) => void;
}

export const StudentQuizSummary = ({ 
  turmaId, 
  turmaName, 
  courseName,
  onBack,
  onSelectStudent 
}: StudentQuizSummaryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: studentsData, isLoading, error } = useDetailedTurmaReports(turmaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Erro</CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Erro ao carregar dados dos estudantes.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!studentsData || studentsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{turmaName}</CardTitle>
              <CardDescription>{courseName}</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum estudante com quizzes encontrado nesta turma.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar estudantes por termo de busca
  const filteredStudents = studentsData.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas gerais
  const totalQuizResponses = studentsData.reduce((sum, s) => sum + s.quizStats.totalAnswered, 0);
  const avgQuizAccuracy = studentsData.length > 0 
    ? Math.round(studentsData.reduce((sum, s) => sum + s.quizStats.accuracy, 0) / studentsData.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{turmaName}</CardTitle>
              <CardDescription className="text-base">{courseName} - Estudantes</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Relatórios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{studentsData.length}</div>
              <div className="text-sm text-muted-foreground">Estudantes Ativos</div>
            </div>
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{totalQuizResponses}</div>
              <div className="text-sm text-muted-foreground">Total de Respostas</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{avgQuizAccuracy}%</div>
              <div className="text-sm text-muted-foreground">Precisão Média</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou email do estudante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Estudantes */}
      <Card>
        <CardHeader>
          <CardTitle>Estudantes ({filteredStudents.length})</CardTitle>
          <CardDescription>Clique em um estudante para ver seus quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {filteredStudents.map((student) => (
              <Button
                key={student.studentId}
                variant="outline"
                className="h-auto p-4 text-left justify-start hover:bg-accent"
                onClick={() => onSelectStudent(student.studentId, student.studentName)}
              >
                <div className="flex items-start space-x-4 w-full">
                  <div className="flex-shrink-0">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium truncate">{student.studentName}</h4>
                      <Badge variant="secondary">
                        {student.quizStats.totalAnswered} respostas
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 truncate">
                      {student.studentEmail}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Precisão</div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{student.quizStats.accuracy}%</span>
                          <Progress value={student.quizStats.accuracy} className="flex-1 h-2" />
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Acertos</div>
                        <div className="font-medium">
                          {student.quizStats.correctAnswers}/{student.quizStats.totalAnswered}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
          
          {filteredStudents.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum estudante encontrado para "{searchTerm}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};