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
      className="overflow-hidden flex flex-col group h-[320px]"
      variant="elevated"
    >
      {/* Compact Cover Area */}
      <div className="relative h-20 shrink-0">
        {course.cover_image_url ? (
          <img 
            src={course.cover_image_url} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${gradientClass} flex items-center justify-center`}>
            <div className="text-white/90 font-bold text-sm px-2 text-center line-clamp-2">
              {course.name}
            </div>
          </div>
        )}
        
        {/* Course Type Badge */}
        <div className="absolute top-1.5 right-1.5">
          <Badge variant="secondary" className="text-xs bg-white/95 text-gray-800 border-0 px-1.5 py-0.5">
            {course.tipo === 'ao_vivo' ? 'Curso' : 'Treinamento'}
          </Badge>
        </div>

        {/* Status indicator */}
        <div className="absolute top-1.5 left-1.5">
          <div className={`w-2 h-2 rounded-full ${
            course.status === 'Ativo' ? 'bg-green-400' : 
            course.status === 'Inativo' ? 'bg-red-400' : 
            'bg-yellow-400'
          }`} />
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col p-3">
        {/* Title */}
        <div className="mb-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground mb-1">
            {course.name}
          </h3>
          
          {/* Themes - Compact */}
          <div className="flex flex-wrap gap-1">
            {course.theme.slice(0, 2).map((theme, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5 h-auto bg-muted/50 text-muted-foreground"
              >
                {theme}
              </Badge>
            ))}
            {course.theme.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto bg-muted/50 text-muted-foreground">
                +{course.theme.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Course Info - More compact */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="font-medium">{correctLessonCount ?? course.lessons_count} aulas</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {getCorrectPublicTargetLabel()}
            </span>
          </div>

          {course.instructor && (
            <div className="text-sm">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Users className="w-4 h-4 shrink-0" />
                <span>Instrutor:</span>
              </div>
              <div className="text-foreground font-medium truncate pl-5">{course.instructor}</div>
            </div>
          )}

          {/* Features & Status row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {course.has_quiz && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-medium">Quiz</span>
                </div>
              )}
              {course.generates_certificate && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-medium">Certificado</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                course.status === 'Ativo' ? 'bg-green-500' : 
                course.status === 'Inativo' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`} />
              <span className="text-xs text-muted-foreground font-medium">{course.status}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 mt-auto">
          <div className="space-y-2">
            {/* Primary action button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (course.tipo === 'gravado' && onViewRecordedCourses) {
                  onViewRecordedCourses(course.id, course.name);
                } else {
                  onViewDetails(course);
                }
              }}
              className="w-full h-8 font-medium"
            >
              <Eye className="w-4 h-4 mr-2" />
              Detalhes
            </Button>
            
            {/* Secondary actions */}
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewStudents(course)}
                className="h-7 px-2"
                title="Ver Alunos"
              >
                <Users className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(course)}
                className="h-7 px-2"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(course.id)}
                className="h-7 px-2"
                title="Excluir"
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