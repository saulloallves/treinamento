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
import { CourseCardMobile } from './CourseCardMobile';

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
  
  // Use mobile-specific component on mobile devices
  if (isMobile) {
    return (
      <CourseCardMobile
        course={course}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewStudents={onViewStudents}
        onViewDetails={onViewDetails}
        onViewRecordedLessons={onViewRecordedLessons}
        onViewRecordedCourses={onViewRecordedCourses}
      />
    );
  }
  
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
      className="overflow-hidden flex flex-col group h-[400px]"
      variant="elevated"
    >
      {/* Cover Area */}
      <div className="relative h-32 shrink-0">
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
        
        {/* Course Type Badge */}
        <div className="absolute top-2 right-2">
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

        {/* Status indicator */}
        <div className="absolute top-2 left-2">
          <div className={`w-2 h-2 rounded-full ${
            course.status === 'Ativo' ? 'bg-green-400' : 
            course.status === 'Inativo' ? 'bg-red-400' : 
            'bg-yellow-400'
          }`} />
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Title */}
        <div className="mb-3">
          <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground mb-2">
            {course.name}
          </h3>
          
          {/* Themes */}
          <div className="flex flex-wrap gap-1">
            {course.theme.slice(0, 2).map((theme, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 h-auto bg-muted/60 truncate max-w-20"
              >
                {theme}
              </Badge>
            ))}
            {course.theme.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 h-auto bg-muted/60">
                +{course.theme.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Course Info */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{correctLessonCount ?? course.lessons_count} aulas</span>
            </div>
            <Badge variant="outline" className="text-xs px-2 py-1 truncate max-w-28 shrink-0">
              {getCorrectPublicTargetLabel()}
            </Badge>
          </div>

          {course.instructor && (
            <div className="flex items-start gap-2 text-sm min-w-0">
              <Users className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-muted-foreground">Instrutor:</span>
                <div className="text-foreground truncate font-medium">{course.instructor}</div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="flex flex-wrap gap-1.5">
            {course.has_quiz && (
              <Badge variant="outline" className="text-xs shrink-0 px-2 py-0.5">
                <FileText className="w-3 h-3 mr-1" />
                Quiz
              </Badge>
            )}
            {course.generates_certificate && (
              <Badge variant="outline" className="text-xs shrink-0 px-2 py-0.5">
                <Award className="w-3 h-3 mr-1" />
                Certificado
              </Badge>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              course.status === 'Ativo' ? 'bg-green-500' : 
              course.status === 'Inativo' ? 'bg-red-500' : 
              'bg-yellow-500'
            }`} />
            <span className="text-muted-foreground">{course.status}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 mt-auto border-t">
          <div className="space-y-2">
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
              className="w-full h-9"
            >
              <Eye className="w-4 h-4 mr-2" />
              Detalhes
            </Button>
            
            {/* Secondary actions */}
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewStudents(course)}
                className="h-8 px-2"
                title="Ver Alunos"
              >
                <Users className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(course)}
                className="h-8 px-2"
                title="Editar Curso"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(course.id)}
                className="h-8 px-2"
                title="Excluir Curso"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </TouchCard>
  );
};