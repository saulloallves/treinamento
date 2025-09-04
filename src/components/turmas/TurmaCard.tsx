import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, UserPlus, Users, Calendar, GraduationCap, Clock, ChevronRight, Edit } from "lucide-react";
import { useStartTurma, useConcludeTurma, useForceCloseEnrollments } from "@/hooks/useTurmas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TurmaCardProps {
  turma: any;
  course: any;
  onViewDetails: (turma: any) => void;
  onEnrollStudent: (turmaId: string) => void;
  onEditTurma: (turma: any) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'agendada': { label: 'Agendada', variant: 'secondary' as const },
    'inscricoes_abertas': { label: 'Inscrições Abertas', variant: 'default' as const },
    'inscricoes_encerradas': { label: 'Inscrições Encerradas', variant: 'outline' as const },
    'em_andamento': { label: 'Em Andamento', variant: 'destructive' as const },
    'encerrada': { label: 'Encerrada', variant: 'secondary' as const },
    'cancelada': { label: 'Cancelada', variant: 'secondary' as const },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || { 
    label: status, 
    variant: 'secondary' as const 
  };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const TurmaCard = ({ turma, course, onViewDetails, onEnrollStudent, onEditTurma }: TurmaCardProps) => {
  const startTurma = useStartTurma();
  const concludeTurma = useConcludeTurma();
  const forceCloseEnrollments = useForceCloseEnrollments();

  const handleForceClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    forceCloseEnrollments.mutate(turma.id);
  };

  const handleStartTurma = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTurma.mutate(turma.id);
  };

  const handleConcludeTurma = (e: React.MouseEvent) => {
    e.stopPropagation();
    concludeTurma.mutate(turma.id);
  };

  const handleEnrollStudent = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnrollStudent(turma.id);
  };

  const handleEditTurma = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTurma(turma);
  };

  const handleCardClick = () => {
    onViewDetails(turma);
  };

  const isPlaceholder = (name?: string) => {
    if (!name) return false;
    const n = name.trim().toLowerCase();
    return n === 'professor não definido' || n === 'professor nao definido';
  };

  const explicitProfessor = turma.responsavel_user?.name || (!isPlaceholder(turma.responsavel_name) ? turma.responsavel_name : undefined);
  const professorName: string = explicitProfessor || course?.instructor || 'Professor não definido';
  const professorEmail: string | undefined = turma.responsavel_user?.email;

  return (
    <Card className="card-clean cursor-pointer hover:shadow-clean-md transition-all duration-200" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {course?.name}
              </span>
            </div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-title">
                {turma.name || `Turma ${turma.code || turma.id.slice(0, 8)}`}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(turma.status)}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{turma.enrollments_count || 0} inscritos</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEditTurma}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Professor */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {professorName?.charAt(0) || 'P'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {professorName}
            </p>
            {professorEmail && (
              <p className="text-xs text-muted-foreground truncate">
                {professorEmail}
              </p>
            )}
          </div>
        </div>

        {/* Datas importantes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Prazo:</span>
            <span className="font-medium">
              {format(new Date(turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
          
          {(turma.enrollment_open_at || turma.enrollment_close_at) && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Inscrições:</span>
              <div className="flex flex-col">
                {turma.enrollment_open_at && (
                  <span className="text-xs">
                    Abre: {format(new Date(turma.enrollment_open_at), 'dd/MM HH:mm', { locale: ptBR })}
                  </span>
                )}
                {turma.enrollment_close_at && (
                  <span className="text-xs">
                    Fecha: {format(new Date(turma.enrollment_close_at), 'dd/MM HH:mm', { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {turma.status === 'inscricoes_abertas' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleForceClose}
                disabled={forceCloseEnrollments.isPending}
                className="text-xs"
              >
                Fechar Inscrições
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnrollStudent}
                className="text-xs"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Inscrever
              </Button>
            </>
          )}
          
          {(turma.status === 'inscricoes_encerradas' || turma.status === 'agendada') && (
            <>
              <Button
                size="sm"
                onClick={handleStartTurma}
                disabled={startTurma.isPending}
                className="text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnrollStudent}
                className="text-xs"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Inscrever
              </Button>
            </>
          )}
          
          {turma.status === 'em_andamento' && (
            <>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleConcludeTurma}
                disabled={concludeTurma.isPending}
                className="text-xs"
              >
                <Square className="h-3 w-3 mr-1" />
                Encerrar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnrollStudent}
                className="text-xs"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Inscrever
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};