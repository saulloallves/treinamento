import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Award
} from 'lucide-react';
import { Course } from '@/hooks/useCourses';

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

  return (
    <Card className="overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-all duration-200 min-h-[180px]">
      {/* Compact Cover Area */}
      <div className="relative h-10 shrink-0">
        {course.cover_image_url ? (
          <img 
            src={course.cover_image_url} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${gradientClass} flex items-center justify-center`}>
            <div className="text-white/95 font-bold text-xs px-2 text-center line-clamp-2">
              {course.name}
            </div>
          </div>
        )}
        
        {/* Course Type Badge */}
        <div className="absolute top-1 right-1">
          <Badge variant="secondary" className="text-xs bg-white/95 text-gray-800 border-0 px-1 py-0.5">
            {course.tipo === 'ao_vivo' ? 'Curso' : 'Treinamento'}
          </Badge>
        </div>

        {/* Status indicator */}
        <div className="absolute top-1 left-1">
          <div className={`w-2 h-2 rounded-full ${
            course.status === 'Ativo' ? 'bg-green-400' : 
            course.status === 'Inativo' ? 'bg-red-400' : 
            'bg-yellow-400'
          }`} />
        </div>
      </div>

      {/* Content - Optimized for mobile */}
      <CardContent className="p-2 flex-1 flex flex-col">
        {/* Title */}
        <div className="mb-1.5">
          <h3 className="font-bold text-sm leading-tight line-clamp-2 text-foreground mb-1 min-h-[2.5rem]">
            {course.name}
          </h3>
          
          {/* Themes - Compact display */}
          <div className="flex flex-wrap gap-0.5">
            {course.theme.slice(0, 2).map((theme, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-[10px] px-1 py-0 h-auto bg-muted/40 text-muted-foreground"
              >
                {theme}
              </Badge>
            ))}
            {course.theme.length > 2 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-auto bg-muted/40 text-muted-foreground">
                +{course.theme.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Info */}
        <div className="space-y-1.5 flex-1">
          {/* Instructor - Only if available */}
          {course.instructor && (
            <div className="text-[10px]">
              <span className="text-muted-foreground">Instrutor: </span>
              <span className="text-foreground font-medium">{course.instructor}</span>
            </div>
          )}

          {/* Features & Status in one row */}
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              {course.has_quiz && (
                <div className="flex items-center gap-0.5 text-muted-foreground">
                  <FileText className="w-2.5 h-2.5" />
                  <span className="font-medium">Quiz</span>
                </div>
              )}
              {course.generates_certificate && (
                <div className="flex items-center gap-0.5 text-muted-foreground">
                  <Award className="w-2.5 h-2.5" />
                  <span className="font-medium">Certificado</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${
                course.status === 'Ativo' ? 'bg-green-500' : 
                course.status === 'Inativo' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`} />
              <span className="text-muted-foreground font-medium">{course.status}</span>
            </div>
          </div>
        </div>

        {/* Actions - Mobile optimized */}
        <div className="pt-1.5 mt-auto">
          <div className="space-y-1">
            {/* Details button only for treinamentos (gravado) */}
            {course.tipo === 'gravado' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (onViewRecordedCourses) {
                    onViewRecordedCourses(course.id, course.name);
                  } else {
                    onViewDetails(course);
                  }
                }}
                className="w-full h-6 text-xs font-medium"
              >
                <Eye className="w-2.5 h-2.5 mr-1.5" />
                Detalhes
              </Button>
            )}
            
            {/* Edit and Delete buttons - always visible */}
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(course)}
                className="h-5 px-2 text-xs"
                title="Editar"
              >
                <Edit className="w-2.5 h-2.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(course.id)}
                className="h-5 px-2 text-xs"
                title="Excluir"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};