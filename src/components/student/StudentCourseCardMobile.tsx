import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface StudentCourseCardMobileProps {
  enrollment: MyEnrollment;
}

export const StudentCourseCardMobile: React.FC<StudentCourseCardMobileProps> = ({ enrollment }) => {
  const course = enrollment.course;
  const isClosed = ['encerrada', 'cancelada'].includes((enrollment.turma?.status || '').toLowerCase());

  if (!course) return null;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Capa do curso - Imagem no topo */}
      {course.cover_image_url ? (
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img 
            src={course.cover_image_url} 
            alt={course.name || "Capa do curso"}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/20 to-primary/40" />
      )}
      
      <CardContent className="p-3 space-y-2">
        {/* Header com nome e tipo */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
            {course.name}
          </h3>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 h-auto shrink-0">
            {course.tipo === 'gravado' ? 'Treinamento' : 'Curso'}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium">{enrollment.status}</span>
        </div>
        
        {/* Informações da Turma */}
        {enrollment.turma && (
          <div className="bg-muted/50 p-2 rounded text-xs space-y-1">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {enrollment.turma.name || enrollment.turma.code || `Turma ${enrollment.turma.id.slice(0, 8)}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                <span>{format(new Date(enrollment.turma.completion_deadline), "dd/MM/yy", { locale: ptBR })}</span>
              </div>
              <Badge variant={
                enrollment.turma.status === 'em_andamento' ? 'default' : 
                enrollment.turma.status === 'encerrada' ? 'outline' : 
                enrollment.turma.status === 'cancelada' ? 'destructive' : 'secondary'
              } className="text-xs h-4 px-1">
                {enrollment.turma.status === 'agendada' ? 'Agendada' :
                 enrollment.turma.status === 'em_andamento' ? 'Em Andamento' :
                 enrollment.turma.status === 'encerrada' ? 'Encerrada' :
                 enrollment.turma.status === 'cancelada' ? 'Cancelada' : enrollment.turma.status}
              </Badge>
            </div>
          </div>
        )}

        {/* Progresso */}
        {enrollment.progress_percentage !== undefined && (
          <div className="text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{enrollment.progress_percentage}%</span>
            </div>
          </div>
        )}
        
        {/* Controle de acesso baseado no status da turma */}
        {isClosed ? (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground mb-1">
              {enrollment.turma?.status === 'encerrada' ? 'Turma encerrada' : 'Turma cancelada'}
            </p>
            <p className="text-xs text-muted-foreground">Acesso não disponível</p>
          </div>
        ) : (
          <Button asChild variant="outline" className="w-full h-8 text-xs">
            {course.tipo === 'gravado' ? (
              <Link to={`/aluno/curso/${course.id}/aulas-gravadas`}>
                <FileText className="w-3 h-3 mr-1" />
                Ver Aulas
              </Link>
            ) : (
              <Link to={`/aluno/curso/${course.id}`}>
                <PlayCircle className="w-3 h-3 mr-1" />
                Marcar presença na aula
              </Link>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};