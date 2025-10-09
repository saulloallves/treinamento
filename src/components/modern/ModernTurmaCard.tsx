import { Calendar, Users, User, MoreHorizontal, Edit, UserPlus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ModernTurmaCardProps {
  turma: any;
  course: any;
  onViewDetails: (turma: any) => void;
  onEnrollStudent: (turmaId: string) => void;
  onEditTurma: (turma: any) => void;
}

const getStatusConfig = (status: string) => {
  const configs = {
    'em_andamento': { label: 'Em Andamento', className: 'status-active' },
    'agendada': { label: 'Agendada', className: 'status-pending' },
    'inscricoes_abertas': { label: 'Inscrições Abertas', className: 'status-pending' },
    'inscricoes_encerradas': { label: 'Inscrições Encerradas', className: 'status-finished' },
    'encerrada': { label: 'Encerrada', className: 'status-finished' },
    'cancelada': { label: 'Cancelada', className: 'status-cancelled' },
  };
  return configs[status as keyof typeof configs] || { label: status, className: 'status-finished' };
};

export const ModernTurmaCard = ({
  turma,
  course,
  onViewDetails,
  onEnrollStudent,
  onEditTurma,
}: ModernTurmaCardProps) => {
  const statusConfig = getStatusConfig(turma.status);
  const enrollmentCount = turma.enrollments?.length || 0;

  return (
    <div className="modern-card p-0 overflow-hidden animate-fade-in-up">
      {/* Header colorido baseado no status */}
      <div className={`h-1.5 ${statusConfig.className}`} />
      
      <div className="p-4">
        {/* Status badge e menu */}
        <div className="flex items-start justify-between mb-3">
          <Badge className={`status-badge ${statusConfig.className} text-xs px-2 py-0.5`}>
            {statusConfig.label}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails(turma)} className="gap-2">
                <Eye className="h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditTurma(turma)} className="gap-2">
                <Edit className="h-4 w-4" />
                Editar turma
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEnrollStudent(turma.id)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Inscrever aluno
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Título e curso */}
        <div className="mb-3">
          <h3 className="font-bold text-base text-foreground mb-1 line-clamp-1">
            {turma.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {course?.name || 'Curso não encontrado'}
          </p>
          {turma.code && (
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              #{turma.code}
            </p>
          )}
        </div>

        {/* Informações com ícones */}
        <div className="space-y-2 mb-3">
          {/* Professor */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate text-xs">
              {turma.responsavel_user?.name || 'Professor não definido'}
            </span>
          </div>

          {/* Data de início */}
          {turma.start_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground text-xs">
                Início: {format(new Date(turma.start_date), "dd MMM yyyy", { locale: ptBR })}
              </span>
            </div>
          )}

          {/* Inscrições */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground text-xs">
            {enrollmentCount} inscrição{enrollmentCount !== 1 ? 'ões' : ''}
            </span>
          </div>
        </div>

        {/* Botão de ação principal */}
        <Button 
          onClick={() => onViewDetails(turma)} 
          variant="modern-secondary" 
          size="sm"
          className="w-full"
        >
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
};