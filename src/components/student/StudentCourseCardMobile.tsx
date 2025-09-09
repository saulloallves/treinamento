import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Calendar,
  PlayCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type MyEnrollment } from '@/hooks/useMyEnrollments';

interface StudentCourseCardMobileProps {
  enrollment: MyEnrollment;
}

// Gradiente padrão baseado no tipo de curso
const getTypeGradient = (tipo: string) => {
  if (tipo === 'ao_vivo') {
    return 'bg-gradient-to-br from-red-400 to-red-600';
  }
  return 'bg-gradient-to-br from-indigo-400 to-indigo-600';
};

export const StudentCourseCardMobile: React.FC<StudentCourseCardMobileProps> = ({ enrollment }) => {
  const course = enrollment.course;
  const gradientClass = getTypeGradient(course?.tipo || '');

  if (!course) return null;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer h-fit">
      <CardContent className="p-3 space-y-2">
        {/* Header com nome e status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {course.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Status: {enrollment.status}
            </p>
          </div>
          
          {/* Course Type Badge */}
          <div className="flex shrink-0">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 h-auto">
              {course.tipo === 'gravado' ? 'Treinamento' : 'Curso'}
            </Badge>
          </div>
        </div>
        
        {/* Turma Info - Compact */}
        {enrollment.turma && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {enrollment.turma.name || enrollment.turma.code || `Turma ${enrollment.turma.id.slice(0, 8)}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>
                {format(new Date(enrollment.turma.completion_deadline), "dd/MM/yy", { locale: ptBR })}
              </span>
            </div>
          </div>
        )}
        
        {/* Progress */}
        {enrollment.progress_percentage !== undefined && (
          <div className="text-xs text-muted-foreground">
            Progresso: {enrollment.progress_percentage}%
          </div>
        )}
        
        {/* Action Button - Compact */}
        <Button asChild size="sm" className="w-full h-7 text-xs">
          {course.tipo === 'gravado' ? (
            <Link to={`/aluno/curso/${course.id}/aulas-gravadas`}>
              <FileText className="w-3 h-3 mr-1" />
              Ver Aulas
            </Link>
          ) : (
            <Link to={`/aluno/curso/${course.id}`}>
              <PlayCircle className="w-3 h-3 mr-1" />
              Ver curso
            </Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};