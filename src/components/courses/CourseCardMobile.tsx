import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  PlayCircle,
  FileText,
  Award,
  Clock
} from 'lucide-react';
import { Course } from '@/hooks/useCourses';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useCorrectLessonCount } from '@/hooks/useCorrectLessonCount';

interface CourseCardMobileProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onViewStudents: (course: Course) => void;
  onViewDetails: (course: Course) => void;
  onViewRecordedLessons?: (courseId: string, courseName: string) => void;
  onViewRecordedCourses?: (courseId: string, courseName: string) => void;
}

// Gradientes padrão baseados nos temas
const getThemeGradient = (themes: string[], tipo: string) => {
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

export const CourseCardMobile: React.FC<CourseCardMobileProps> = ({
  course,
  onEdit,
  onDelete,
  onViewStudents,
  onViewDetails,
  onViewRecordedLessons,
  onViewRecordedCourses
}) => {
  const gradientClass = getThemeGradient(course.theme, course.tipo);
  const { positionNames } = useCourseAccess(course.id);
  const { data: correctLessonCount } = useCorrectLessonCount(course.id, course.tipo);
  
  // Get correct public target label
  const getCorrectPublicTargetLabel = () => {
    if (positionNames && positionNames.length > 0) {
      return positionNames.slice(0, 1).join(', ') + (positionNames.length > 1 ? '...' : '');
    }
    // Fallback to basic labels
    switch (course.public_target) {
      case "franqueado": return "Franqueado";
      case "colaborador": return "Colaborador"; 
      case "ambos": return "Ambos";
      default: return course.public_target;
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col group shadow-sm hover:shadow-md transition-all duration-200">
      {/* Compact Cover Area */}
      <div className="relative h-24">
        {course.cover_image_url ? (
          <img 
            src={course.cover_image_url} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${gradientClass}`} />
        )}
        
        {/* Minimal Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status indicator */}
        <div className="absolute top-2 right-2">
          <div className={`w-2 h-2 rounded-full ${
            course.status === 'Ativo' ? 'bg-green-400' : 
            course.status === 'Inativo' ? 'bg-red-400' : 
            'bg-yellow-400'
          }`} />
        </div>

        {/* Course Type Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs bg-white/90 text-gray-800 border-0">
            {course.tipo === 'ao_vivo' ? (
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
      </div>

      {/* Content - Optimized for mobile */}
      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Title and main info */}
        <div className="space-y-2 flex-1">
          {/* Course Title */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
            {course.name}
          </h3>
          
          {/* Course Meta - Compact row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              <span>{correctLessonCount ?? course.lessons_count}</span>
            </div>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
              {getCorrectPublicTargetLabel()}
            </Badge>
          </div>

          {/* Instructor - Only if available and space permits */}
          {course.instructor && (
            <div className="text-xs text-muted-foreground truncate">
              <span className="font-medium">Instrutor:</span> {course.instructor}
            </div>
          )}

          {/* Themes - Compact display */}
          <div className="flex flex-wrap gap-1">
            {course.theme.slice(0, 2).map((theme, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5 h-auto bg-muted/50"
              >
                {theme}
              </Badge>
            ))}
          </div>

          {/* Features - Compact icons */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {course.has_quiz && (
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>Quiz</span>
              </div>
            )}
            {course.generates_certificate && (
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Certificado</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions - Mobile optimized */}
        <div className="pt-3 mt-auto border-t space-y-2">
          {/* Primary action button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (course.tipo === 'gravado' && onViewRecordedCourses) {
                onViewRecordedCourses(course.id, course.name);
              } else {
                onViewDetails(course);
              }
            }}
            className="w-full h-8 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Detalhes
          </Button>
          
          {/* Secondary actions in row */}
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewStudents(course)}
              className="h-8 text-xs p-0"
              title="Ver Alunos"
            >
              <Users className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(course)}
              className="h-8 text-xs p-0"
              title="Editar"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(course.id)}
              className="h-8 text-xs p-0"
              title="Excluir"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};