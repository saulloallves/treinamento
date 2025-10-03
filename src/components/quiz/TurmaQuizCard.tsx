import { Calendar, Users, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      agendada: { label: "Agendada", variant: "secondary" as const },
      inscricoes_abertas: { label: "Inscrições Abertas", variant: "default" as const },
      inscricoes_encerradas: { label: "Inscrições Encerradas", variant: "outline" as const },
      em_andamento: { label: "Em Andamento", variant: "default" as const },
      encerrada: { label: "Encerrada", variant: "outline" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.agendada;
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
              {turma.name || `Turma ${turma.code}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {turma.course?.name || 'Curso não definido'}
            </p>
          </div>
          <div className="shrink-0">
            {getStatusBadge(turma.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-4 flex-1">
        {/* Estatísticas dos quizzes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Inscritos</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {turma.enrollments_count || 0}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Quizzes</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {turma.quizCount || 0}
            </p>
          </div>
        </div>

        {/* Informações da turma */}
        <div className="space-y-2 text-sm min-h-[3rem]">
          {turma.responsavel_user?.name && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <span className="font-medium shrink-0">Responsável:</span>
              <span className="line-clamp-1">{turma.responsavel_user.name}</span>
            </div>
          )}
          
          {turma.start_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Início: {formatDate(turma.start_at)}</span>
            </div>
          )}
        </div>

        {/* Botão de ação */}
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-auto"
          onClick={() => onManageQuizzes(turma)}
        >
          <span>Gerenciar Quizzes</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TurmaQuizCard;