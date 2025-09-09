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
    <Card className="overflow-hidden h-full flex flex-col group shadow-sm hover:shadow-md transition-all duration-200">
      {/* Compact Cover Area */}
      <div className="relative h-20">
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
          <Badge variant="secondary" className="text-xs bg-white/90 text-gray-800 border-0">
            {enrollment.status}
          </Badge>
        </div>

        {/* Course Type Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs bg-white/90 text-gray-800 border-0">
            {course.tipo === 'gravado' ? (
              <>
                <FileText className="w-3 h-3 mr-1" />
                Treinamento
              </>
            ) : (
              <>
                <PlayCircle className="w-3 h-3 mr-1" />
                Curso
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
          
          {/* Course Status */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Status:</span> {enrollment.status}
          </div>

          {/* Turma Info - Compact */}
          {enrollment.turma && (
            <div className="bg-muted/30 p-2 rounded-md space-y-1">
              <div className="flex items-center gap-1 text-xs">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">
                  {enrollment.turma.name || enrollment.turma.code || `Turma ${enrollment.turma.id.slice(0, 8)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {format(new Date(enrollment.turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <Badge 
                  variant={
                    enrollment.turma.status === 'em_andamento' ? 'default' : 
                    enrollment.turma.status === 'encerrada' ? 'outline' : 
                    enrollment.turma.status === 'cancelada' ? 'destructive' : 'secondary'
                  }
                  className="text-xs px-1.5 py-0.5 h-auto"
                >
                  {enrollment.turma.status === 'agendada' ? 'Agendada' :
                   enrollment.turma.status === 'em_andamento' ? 'Em Andamento' :
                   enrollment.turma.status === 'encerrada' ? 'Encerrada' :
                   enrollment.turma.status === 'cancelada' ? 'Cancelada' : enrollment.turma.status}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Action Button - Compact */}
        <div className="pt-2 mt-auto">
          <Button asChild size="sm" className="w-full h-8 text-xs">
            {course.tipo === 'gravado' ? (
              <Link to={`/aluno/curso/${course.id}/aulas-gravadas`}>
                <FileText className="w-3 h-3 mr-1" />
                Ver Aulas
              </Link>
            ) : (
              <Link to={`/aluno/curso/${course.id}`}>
                <PlayCircle className="w-3 h-3 mr-1" />
                Acessar Curso
              </Link>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};