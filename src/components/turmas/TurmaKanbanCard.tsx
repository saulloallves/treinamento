import { Turma } from "@/hooks/useTurmas";
import { Course } from "@/hooks/useCourses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, MoreVertical, Eye, Edit, UserPlus, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TurmaKanbanCardProps {
  turma: Turma;
  course?: Course;
  onViewDetails: (turma: Turma) => void;
  onEnrollStudent: (turmaId: string) => void;
  onEditTurma: (turma: Turma) => void;
  onDragStart: (turma: Turma) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export const TurmaKanbanCard = ({
  turma,
  course,
  onViewDetails,
  onEnrollStudent,
  onEditTurma,
  onDragStart,
  onDragEnd,
  isDragging,
}: TurmaKanbanCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendada':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Planejada</Badge>;
      case 'em_andamento':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Em Andamento</Badge>;
      case 'encerrada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Finalizada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return null;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(turma);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card 
      className={`kanban-card cursor-grab hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover:scale-[1.02]'
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      <CardContent className="p-4">
        {/* Drag Handle & Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            {getStatusBadge(turma.status)}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(turma)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditTurma(turma)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar turma
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEnrollStudent(turma.id)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Inscrever aluno
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Turma Info */}
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-foreground line-clamp-1">
              {turma.name || turma.code || 'Turma sem nome'}
            </h4>
            {course && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {course.name}
              </p>
            )}
          </div>

          {/* Code */}
          {turma.code && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {turma.code}
              </Badge>
            </div>
          )}

          {/* Professor */}
          {turma.responsavel_user && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {turma.responsavel_user.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground line-clamp-1">
                {turma.responsavel_user.name}
              </span>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-1 text-xs text-muted-foreground">
            {turma.start_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Início: {formatDate(turma.start_at)}</span>
              </div>
            )}
            {turma.completion_deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Prazo: {formatDate(turma.completion_deadline)}</span>
              </div>
            )}
          </div>

          {/* Enrollment Count */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{turma.enrollments_count || 0} inscritos</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(turma)}
              className="h-7 px-3 text-xs"
            >
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};