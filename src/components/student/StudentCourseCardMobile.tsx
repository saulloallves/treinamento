import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar,
  PlayCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type MyEnrollment } from '@/hooks/useMyEnrollments';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface StudentCourseCardMobileProps {
  enrollment: MyEnrollment;
}

// Gradiente padrão baseado no tipo de curso
const getTypeGradient = (tipo: string) => {
  if (tipo === 'ao_vivo') {
    return 'from-primary/20 to-primary/40';
  }
  return 'from-accent/20 to-accent/40';
};

export const StudentCourseCardMobile: React.FC<StudentCourseCardMobileProps> = ({ enrollment }) => {
  const course = enrollment.course;
  const gradientClass = getTypeGradient(course?.tipo || '');
  const isClosed = ['encerrada', 'cancelada'].includes((enrollment.turma?.status || '').toLowerCase());

  if (!course) return null;

  return (
    <Card className="hover:shadow-md transition-shadow h-fit">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Capa do curso (thumbnail) */}
          <div className="w-28 shrink-0">
            {course.cover_image_url ? (
              <AspectRatio ratio={16/9}>
                <img
                  src={course.cover_image_url}
                  alt={`Capa do curso ${course.name}`}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-md"
                />
              </AspectRatio>
            ) : (
              <div className={`rounded-md w-full h-[56px] bg-gradient-to-br ${gradientClass}`} />
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header com nome e tipo */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                {course.name}
              </h3>
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto shrink-0">
                {course.tipo === 'gravado' ? 'Treinamento' : 'Curso'}
              </Badge>
            </div>

            {/* Turma Info - Compact */}
            {enrollment.turma && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1 min-w-0">
                  <Users className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {enrollment.turma.name || enrollment.turma.code || `Turma ${enrollment.turma.id.slice(0, 8)}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(enrollment.turma.completion_deadline), 'dd/MM/yy', { locale: ptBR })}
                  </span>
                </div>
              </div>
            )}

            {/* Ações */}
            {isClosed ? (
              <Button size="sm" className="w-full h-7 text-xs" disabled>
                Acesso indisponível
              </Button>
            ) : (
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};