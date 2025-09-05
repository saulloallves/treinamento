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
  coverImageUrl?: string;
  tipo?: 'ao_vivo' | 'gravado';
  theme?: string[];
  onClick: () => void;
}

// Gradientes padrão baseados nos temas
const getThemeGradient = (themes: string[] = [], tipo: string = 'ao_vivo') => {
  if (themes.includes('Vendas')) {
    return 'bg-gradient-to-br from-emerald-400 to-emerald-600';
  }
  if (themes.includes('Atendimento')) {
    return 'bg-gradient-to-br from-blue-400 to-blue-600';
  }
  if (themes.includes('Liderança')) {
    return 'bg-gradient-to-br from-purple-400 to-purple-600';
  }
  if (themes.includes('Operacional')) {
    return 'bg-gradient-to-br from-orange-400 to-orange-600';
  }
  if (tipo === 'ao_vivo') {
    return 'bg-gradient-to-br from-red-400 to-red-600';
  }
  return 'bg-gradient-to-br from-indigo-400 to-indigo-600';
};

const CourseScheduleCard: React.FC<CourseScheduleCardProps> = ({
  courseId,
  courseName,
  lessonsCount,
  nextLesson,
  coverImageUrl,
  tipo = 'ao_vivo',
  theme = [],
  onClick
}) => {
  const gradientClass = getThemeGradient(theme, tipo);

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
      {/* Cover Area */}
      <div className="relative aspect-video">
        {coverImageUrl ? (
          <img 
            src={coverImageUrl} 
            alt={courseName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${gradientClass}`} />
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Course Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight mb-2">
            {courseName}
          </h3>
          <div className="flex flex-wrap gap-1">
            {theme.slice(0, 2).map((themeItem, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-white/20 text-white border-white/30"
              >
                {themeItem}
              </Badge>
            ))}
          </div>
        </div>

      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
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