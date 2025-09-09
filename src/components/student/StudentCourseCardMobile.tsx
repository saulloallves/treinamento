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
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Course Image/Cover */}
      <div className="relative h-32">
        {course.cover_image_url ? (
          <img 
            src={course.cover_image_url} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${gradientClass}`} />
        )}
        
        {/* Course Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/90 text-gray-800 border-0 font-medium">
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

        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Course Title */}
        <h3 className="font-semibold text-base leading-tight">
          {course.name}
        </h3>
        
        {/* Course Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessons_count || 0}</span>
          </div>
          <span>Franqueado Geral</span>
        </div>

        {/* Instructor - Static for now */}
        <div className="text-sm">
          <span className="text-muted-foreground">Instrutor: </span>
          <span className="font-medium">Instrutor Principal</span>
        </div>

        {/* Default Categories */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Negócios
          </Badge>
          <Badge variant="outline" className="text-xs">
            Gestão
          </Badge>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>Quiz</span>
          </div>
          {course.generates_certificate && (
            <div className="flex items-center gap-1">
              <Badge className="w-4 h-4" />
              <span>Certificado</span>
            </div>
          )}
        </div>

        {/* Turma Info */}
        {enrollment.turma && (
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{enrollment.turma.name || enrollment.turma.code || `Turma ${enrollment.turma.id.slice(0, 8)}`}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(enrollment.turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
          </div>
        )}

        {/* Details Button */}
        <Button variant="outline" className="w-full">
          <Link to={course.tipo === 'gravado' ? `/aluno/curso/${course.id}/aulas-gravadas` : `/aluno/curso/${course.id}`} className="flex items-center gap-2">
            <span>Detalhes</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};