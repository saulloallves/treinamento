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
    <Card className="group relative overflow-hidden border-0 bg-card shadow-clean hover:shadow-clean-md transition-all duration-300 hover:scale-105">
      {/* Status Badge - Proeminente no topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary/5"></div>
      <div className="absolute top-3 right-3">
        <Badge className={`${getStatusColor(turma.status)} text-white shadow-sm`}>
          {getStatusText(turma.status)}
        </Badge>
      </div>

      <CardContent className="p-6">
        {/* Header da turma */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1 mb-2">
            {turma.name || `Turma ${turma.code}`}
          </h3>
          {turma.course && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {turma.course.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Grid de informações - Mais compacto e visual */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-medium text-foreground">{turma.enrollments_count || 0}</div>
            <div className="text-xs text-muted-foreground">inscritos</div>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-accent/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div className="text-sm font-medium text-foreground">{turma.quizCount || 0}</div>
            <div className="text-xs text-muted-foreground">quizzes</div>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-secondary/10 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="text-sm font-medium text-foreground">
              {turma.start_at ? new Date(turma.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">início</div>
          </div>
        </div>

        {/* Responsável - Layout mais discreto */}
        {turma.responsavel_user && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md border border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Responsável:</span> {turma.responsavel_user.name}
            </p>
          </div>
        )}

        {/* Botão de ação - Redesenhado e mais chamativo */}
        <Button
          onClick={() => onManageQuizzes(turma)}
          className="w-full group-hover:scale-105 transition-transform duration-200"
          size="sm"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Gerenciar Quizzes
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TurmaQuizCard;