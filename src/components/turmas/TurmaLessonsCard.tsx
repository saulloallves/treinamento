import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TurmaWithLessons } from "@/hooks/useLessonsByTurma";

interface TurmaLessonsCardProps {
  turma: TurmaWithLessons;
  onClick: () => void;
  onViewRecordedLessons?: (courseId: string, courseName: string) => void;
}

const TurmaLessonsCard = ({ turma, onClick, onViewRecordedLessons }: TurmaLessonsCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-500';
      case 'agendada':
        return 'bg-blue-500';
      case 'encerrada':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'Em andamento';
      case 'agendada':
        return 'Agendada';
      case 'encerrada':
        return 'Encerrada';
      default:
        return status;
    }
  };

  return (
    <Card className="transition-all hover:shadow-md cursor-pointer group" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {turma.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{turma.course_name}</p>
            {turma.code && (
              <Badge variant="outline" className="text-xs">
                {turma.code}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(turma.status)} text-white`}
            >
              {getStatusText(turma.status)}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Próxima aula */}
        {turma.next_lesson ? (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Próxima Aula</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-2">
              {turma.next_lesson.title}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {turma.next_lesson.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {turma.next_lesson.time}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Nenhuma aula agendada
            </p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>
              {turma.upcoming_lessons_count} próximas aulas
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              if (turma.course_type === 'gravado' && onViewRecordedLessons) {
                onViewRecordedLessons(turma.course_id, turma.course_name);
              } else {
                onClick();
              }
            }}
          >
            Ver Aulas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TurmaLessonsCard;