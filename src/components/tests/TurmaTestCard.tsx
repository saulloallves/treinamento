import { ArrowRight, Users, Calendar, ClipboardList, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TurmaTestCardProps {
  turma: any;
  onManageTests: (turma: any) => void;
}

const TurmaTestCard = ({ turma, onManageTests }: TurmaTestCardProps) => {
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
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
              {turma.name || `Turma ${turma.code}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {turma.course?.name || 'Curso não definido'}
            </p>
          </div>
          {getStatusBadge(turma.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estatísticas dos testes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {turma.testCount || 0}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Ativos</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {turma.activeTestCount || 0}
            </p>
          </div>
        </div>

        {/* Informações da turma */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{turma.enrollments_count || 0} alunos matriculados</span>
          </div>
          
          {turma.start_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Início: {formatDate(turma.start_at)}</span>
            </div>
          )}
        </div>

        {/* Botão de ação */}
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          onClick={() => onManageTests(turma)}
        >
          <span>Gerenciar Testes</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TurmaTestCard;