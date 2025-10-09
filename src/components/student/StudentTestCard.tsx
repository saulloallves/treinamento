import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, Trophy, Users, CheckCircle, AlertCircle } from "lucide-react";
import { StudentTest } from "@/hooks/useStudentTests";

interface StudentTestCardProps {
  test: StudentTest;
}

const StudentTestCard = ({ test }: StudentTestCardProps) => {
  const hasSubmissions = test.test_submissions && test.test_submissions.length > 0;
  const latestSubmission = hasSubmissions ? 
    test.test_submissions!.sort((a, b) => b.attempt_number - a.attempt_number)[0] : null;
  const isCompleted = latestSubmission?.status === 'completed';
  const isPassed = latestSubmission?.passed;
  const attemptsRemaining = test.max_attempts ? test.max_attempts - (latestSubmission?.attempt_number || 0) : null;

  const getStatusColor = () => {
    if (isCompleted) {
      return isPassed ? 'default' : 'destructive';
    }
    if (latestSubmission?.status === 'in_progress') {
      return 'secondary';
    }
    return 'outline';
  };

  const getStatusText = () => {
    if (isCompleted) {
      return isPassed ? 'Aprovado' : 'Reprovado';
    }
    if (latestSubmission?.status === 'in_progress') {
      return 'Em Andamento';
    }
    return 'Não Iniciado';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base leading-tight">{test.name}</CardTitle>
        {test.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{test.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-3">
        {/* Status do Teste */}
        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor()} className="text-xs">
            {isCompleted && isPassed && <CheckCircle className="w-3 h-3 mr-1" />}
            {isCompleted && !isPassed && <AlertCircle className="w-3 h-3 mr-1" />}
            {getStatusText()}
          </Badge>
          {isCompleted && latestSubmission && (
            <span className="text-xs font-medium">
              {latestSubmission.percentage.toFixed(0)}%
            </span>
          )}
        </div>

        {/* Informações do Curso/Turma */}
        <div className="space-y-1">
          {test.courses && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Curso:</span> {test.courses.name}
            </div>
          )}
          
          {test.turmas && (
            <div className="flex items-center gap-1 text-xs">
              <Users className="w-3 h-3 text-primary" />
              <span className="font-medium text-primary">
                {test.turmas.name || test.turmas.code || 'Turma'}
              </span>
            </div>
          )}
        </div>

        {/* Detalhes do Teste */}
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Nota mínima</span>
            </div>
            <span className="font-medium">{test.passing_percentage}%</span>
          </div>
          
          {test.time_limit_minutes && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Tempo limite</span>
              </div>
              <span className="font-medium">{test.time_limit_minutes} min</span>
            </div>
          )}
          
          {test.max_attempts && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Tentativas</span>
              <span className="font-medium">
                {latestSubmission?.attempt_number || 0}/{test.max_attempts}
              </span>
            </div>
          )}
        </div>

        {/* Resultado da Última Tentativa */}
        {isCompleted && latestSubmission && (
          <div className="bg-muted/50 p-2 rounded text-xs space-y-1">
            <div className="flex justify-between">
              <span>Pontuação</span>
              <span className="font-medium">
                {latestSubmission.total_score}/{latestSubmission.max_possible_score}
              </span>
            </div>
            {latestSubmission.submitted_at && (
              <div className="flex justify-between">
                <span>Concluído em</span>
                <span>{new Date(latestSubmission.submitted_at).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        )}

        {/* Botão de Ação - Sempre no final */}
        <div className="mt-auto pt-2">
          <Button asChild variant="outline" className="w-full h-8 text-xs" 
            disabled={attemptsRemaining === 0}>
            <Link to={`/aluno/teste/${test.id}`}>
              {latestSubmission?.status === 'in_progress' ? 'Continuar Teste' :
               isCompleted && attemptsRemaining && attemptsRemaining > 0 ? 'Tentar Novamente' :
               isCompleted ? 'Ver Resultado' : 'Iniciar Teste'}
            </Link>
          </Button>

          {attemptsRemaining === 0 && (
            <p className="text-xs text-center text-muted-foreground mt-1">
              Limite de tentativas atingido
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentTestCard;