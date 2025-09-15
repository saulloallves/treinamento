import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentQuizData } from "@/hooks/useStudentQuizData";
import { 
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  User,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";

interface StudentQuizDetailProps {
  turmaId: string;
  studentId: string;
  studentName: string;
  onBack: () => void;
  onSelectQuiz: (quizName: string) => void;
}

export const StudentQuizDetail = ({ 
  turmaId, 
  studentId,
  studentName,
  onBack,
  onSelectQuiz 
}: StudentQuizDetailProps) => {
  const { data: studentData, isLoading, error } = useStudentQuizData(turmaId, studentId);

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
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
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
            Erro ao carregar dados do estudante.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!studentData || studentData.quizzes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{studentName}</CardTitle>
              <CardDescription>Nenhum quiz respondido</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Este estudante ainda não respondeu nenhum quiz.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estatísticas gerais do estudante
  const totalQuestions = studentData.quizzes.reduce((sum, quiz) => sum + quiz.stats.totalQuestions, 0);
  const totalCorrect = studentData.quizzes.reduce((sum, quiz) => sum + quiz.stats.correctAnswers, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Estudante */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-xl">{studentData.studentName}</CardTitle>
                <CardDescription className="text-base">{studentData.studentEmail}</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Estudantes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{studentData.quizzes.length}</div>
              <div className="text-sm text-muted-foreground">Quizzes Respondidos</div>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{totalCorrect}/{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Acertos/Total</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{overallAccuracy}%</div>
              <div className="text-sm text-muted-foreground">Precisão Geral</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Quizzes Respondidos ({studentData.quizzes.length})</CardTitle>
          <CardDescription>Clique em um quiz para ver as respostas detalhadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {studentData.quizzes.map((quiz) => (
              <Button
                key={quiz.quizName}
                variant="outline"
                className="h-auto p-4 text-left justify-start hover:bg-accent"
                onClick={() => onSelectQuiz(quiz.quizName)}
              >
                <div className="flex items-start space-x-4 w-full">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium truncate">{quiz.quizName}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={quiz.stats.accuracy >= 70 ? "default" : "destructive"}
                          className={quiz.stats.accuracy >= 70 ? "bg-green-100 text-green-800" : ""}
                        >
                          {quiz.stats.accuracy}%
                        </Badge>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-muted-foreground">Perguntas</div>
                        <div className="font-medium">{quiz.stats.totalQuestions}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Acertos</div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{quiz.stats.correctAnswers}</span>
                          {quiz.stats.correctAnswers === quiz.stats.totalQuestions ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : quiz.stats.correctAnswers === 0 ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <Progress value={quiz.stats.accuracy} className="h-2" />
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};