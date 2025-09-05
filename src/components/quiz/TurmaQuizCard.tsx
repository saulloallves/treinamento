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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg">{turma.name || `Turma ${turma.code}`}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(turma.status)} text-white`}>
                {getStatusText(turma.status)}
              </Badge>
              {turma.course && (
                <Badge variant="outline">
                  {turma.course.name}
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={() => onManageQuizzes(turma)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Gerenciar Quizzes
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{turma.enrollments_count || 0} inscritos</span>
          </div>
          
          {turma.start_at && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Início: {new Date(turma.start_at).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span>{turma.quizCount || 0} quizzes criados</span>
          </div>
        </div>
        
        {turma.responsavel_user && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Responsável:</strong> {turma.responsavel_user.name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TurmaQuizCard;