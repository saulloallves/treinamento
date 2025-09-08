import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TouchCard from '@/components/mobile/TouchCard';
import { 
  BookOpen, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  PlayCircle,
  FileText,
  Award,
  Clock,
  Settings
} from 'lucide-react';
import { Course } from '@/hooks/useCourses';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useCorrectLessonCount } from '@/hooks/useCorrectLessonCount';
import { useIsMobile } from '@/hooks/use-mobile';

interface CourseCardProps {
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

export const CourseCard: React.FC<CourseCardProps> = ({
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
  const isMobile = useIsMobile();
  
  // Get correct public target label
  const getCorrectPublicTargetLabel = () => {
    if (positionNames && positionNames.length > 0) {
      return positionNames.slice(0, 2).join(', ') + (positionNames.length > 2 ? '...' : '');
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
    <TouchCard 
      className="overflow-hidden h-full flex flex-col group"
      variant="elevated"
    >
      {/* Cover Area */}
      <div className="relative aspect-video">
        {course.cover_image_url ? (
          <img 
            src={course.cover_image_url} 
            alt={course.name}
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
            {course.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {course.theme.slice(0, 2).map((theme, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-white/20 text-white border-white/30"
              >
                {theme}
              </Badge>
            ))}
          </div>
        </div>

      </div>

      {/* Content */}
      <CardContent className={`flex-1 flex flex-col ${isMobile ? 'p-3' : 'p-4'}`}>
        {/* Course Info */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{correctLessonCount ?? course.lessons_count} aulas</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {getCorrectPublicTargetLabel()}
            </Badge>
          </div>

          {course.instructor && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Instrutor: <span className="text-foreground">{course.instructor}</span>
              </span>
            </div>
          )}

          {/* Features */}
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
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
            {course.has_quiz && (
              <Badge variant="outline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Quiz
              </Badge>
            )}
            {course.generates_certificate && (
              <Badge variant="outline" className="text-xs">
                <Award className="w-3 h-3 mr-1" />
                Certificado
              </Badge>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              course.status === 'Ativo' ? 'bg-green-500' : 
              course.status === 'Inativo' ? 'bg-red-500' : 
              'bg-yellow-500'
            }`} />
            <span className="text-sm text-muted-foreground">{course.status}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={`pt-3 border-t ${isMobile ? 'mt-3' : 'mt-4'}`}>
          {/* Mobile: Stack buttons vertically, Desktop: Horizontal layout */}
          <div className="hidden md:flex flex-wrap gap-2">
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
              className="flex-1 min-w-0"
            >
              <Eye className="w-4 h-4 mr-1" />
              Detalhes
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewStudents(course)}
              title="Ver Alunos"
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(course)}
              title="Editar Curso"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(course.id)}
              title="Excluir Curso"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile layout - larger buttons with better spacing */}
          <div className={`md:hidden ${isMobile ? 'space-y-2' : 'space-y-2'}`}>
            <Button
              variant="outline"
              onClick={() => {
                if (course.tipo === 'gravado' && onViewRecordedCourses) {
                  onViewRecordedCourses(course.id, course.name);
                } else {
                  onViewDetails(course);
                }
              }}
              className={`w-full text-sm ${isMobile ? 'h-10' : 'h-11'}`}
            >
              <Eye className={`mr-2 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
              Detalhes
            </Button>
            
            <div className={`grid grid-cols-3 ${isMobile ? 'gap-2' : 'gap-2'}`}>
              <Button
                variant="outline"
                onClick={() => onViewStudents(course)}
                className={`text-xs ${isMobile ? 'h-10' : 'h-11'}`}
              >
                <Users className={`mr-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                Alunos
              </Button>
              <Button
                variant="outline"
                onClick={() => onEdit(course)}
                className={`text-xs ${isMobile ? 'h-10' : 'h-11'}`}
              >
                <Edit className={`mr-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => onDelete(course.id)}
                className={`text-xs ${isMobile ? 'h-10' : 'h-11'}`}
              >
                <Trash2 className={`mr-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </TouchCard>
  );
};