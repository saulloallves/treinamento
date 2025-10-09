import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock,
  BookOpen,
  PlayCircle,
  FileText,
  Calendar
} from 'lucide-react';

interface CourseScheduleCardProps {
  courseId: string;
  courseName: string;
  lessonsCount: number;
  nextLesson?: {
    date: string;
    time: string;
    title: string;
  };
  tipo?: 'ao_vivo' | 'gravado';
  theme?: string[];
  onClick: () => void;
}

const CourseScheduleCard: React.FC<CourseScheduleCardProps> = ({
  courseId,
  courseName,
  lessonsCount,
  nextLesson,
  tipo = 'ao_vivo',
  theme = [],
  onClick
}) => {
  const handleCardClick = () => {
    onClick();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <h3 className="font-bold text-lg leading-tight mb-2">
          {courseName}
        </h3>
        {theme.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {theme.slice(0, 2).map((themeItem, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {themeItem}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{lessonsCount} aulas</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {tipo === 'ao_vivo' ? (
              <>
                <PlayCircle className="w-3 h-3 mr-1" />
                Curso
              </>
            ) : (
              <>
                <FileText className="w-3 h-3 mr-1" />
                Treinamento
              </>
            )}
          </Badge>
        </div>

        {nextLesson && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Próxima Aula</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{nextLesson.title}</p>
              <div className="flex items-center gap-2">
                <span>{nextLesson.date}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{nextLesson.time}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleButtonClick}  
          className="w-full"
        >
          Ver Aulas
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseScheduleCard;