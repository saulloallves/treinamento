import { Calendar, Users, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Turma } from "@/hooks/useTurmas";

interface TurmaQuizCardProps {
  turma: Turma & {
    course?: {
      id: string;
      name: string;
    };
    quizCount?: number;
  };
  onManageQuizzes: (turma: Turma) => void;
}

const TurmaQuizCard = ({ turma, onManageQuizzes }: TurmaQuizCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-500';
      case 'inscricoes_abertas': return 'bg-green-500';
      case 'inscricoes_encerradas': return 'bg-yellow-500';
      case 'em_andamento': return 'bg-purple-500';
      case 'encerrada': return 'bg-gray-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendada': return 'Agendada';
      case 'inscricoes_abertas': return 'Inscrições Abertas';
      case 'inscricoes_encerradas': return 'Inscrições Encerradas';
      case 'em_andamento': return 'Em Andamento';
      case 'encerrada': return 'Encerrada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <Card className="h-full flex flex-col group relative overflow-hidden transition-all duration-300 hover:shadow-lg border border-border/50 hover:border-primary/20 bg-card">
      {/* Status indicator */}
      <div className={`h-1 ${getStatusColor(turma.status)}`}></div>

      <CardContent className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 flex-1">
              {turma.name || `Turma ${turma.code}` || "Turma"}
            </h3>
            <Badge variant="secondary" className="text-xs shrink-0">
              {getStatusText(turma.status)}
            </Badge>
          </div>
          {turma.course && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {turma.course.name}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4 flex-1">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">{turma.enrollments_count || 0}</div>
            <div className="text-xs text-muted-foreground">inscritos</div>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 bg-secondary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div className="text-lg font-bold text-foreground">{turma.quizCount || 0}</div>
            <div className="text-xs text-muted-foreground">quizzes</div>
          </div>

          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 bg-accent/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="text-sm font-medium text-foreground">
              {turma.start_at ? new Date(turma.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">início</div>
          </div>
        </div>

        {/* Responsável */}
        {turma.responsavel_user && (
          <div className="mb-4 p-2 bg-muted/30 rounded-md">
            <p className="text-xs text-muted-foreground truncate">
              <span className="font-medium">Responsável:</span> {turma.responsavel_user.name}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onManageQuizzes(turma)}
          className="w-full mt-auto"
          size="sm"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Gerenciar Quizzes
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TurmaQuizCard;