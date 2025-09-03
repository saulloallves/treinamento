import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Users, GraduationCap, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TurmaEnrollmentsList } from "./TurmaEnrollmentsList";
import { useEnrollments } from "@/hooks/useEnrollments";

interface TurmaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turma: any;
  course: any;
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

export const TurmaDetailsDialog = ({ open, onOpenChange, turma, course }: TurmaDetailsDialogProps) => {
  const { data: enrollments = [], isLoading } = useEnrollments();
  
  // Filter enrollments for this turma
  const turmaEnrollments = enrollments.filter(enrollment => enrollment.turma_id === turma?.id);

  if (!turma || !course) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-primary" />
            <div>
              <DialogTitle className="text-xl">
                {turma.name || `Turma ${turma.code || turma.id.slice(0, 8)}`}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {course.name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Informações da Turma
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {getStatusBadge(turma.status)}
                  </div>
                  {turma.code && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Código:</span>
                      <span className="font-mono text-sm">{turma.code}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Capacidade:</span>
                    <span className="text-sm">{turma.capacity || 'Ilimitada'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Inscritos:</span>
                    <span className="text-sm font-medium">{turma.enrollments_count || 0}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Professor Responsável
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nome:</span>
                    <span className="text-sm">{turma.responsavel_user?.name || 'Não definido'}</span>
                  </div>
                  {turma.responsavel_user?.email && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm">{turma.responsavel_user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Datas Importantes
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Prazo de Conclusão:</span>
                    <span className="text-sm font-medium">
                      {format(new Date(turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  {turma.start_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Início:</span>
                      <span className="text-sm">
                        {format(new Date(turma.start_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  {turma.end_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fim:</span>
                      <span className="text-sm">
                        {format(new Date(turma.end_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {(turma.enrollment_open_at || turma.enrollment_close_at) && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Janela de Inscrições
                  </h3>
                  <div className="space-y-2">
                    {turma.enrollment_open_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Abertura:</span>
                        <span className="text-sm">
                          {format(new Date(turma.enrollment_open_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                    {turma.enrollment_close_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Fechamento:</span>
                        <span className="text-sm">
                          {format(new Date(turma.enrollment_close_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Lista de Inscrições */}
          <TurmaEnrollmentsList 
            enrollments={turmaEnrollments} 
            isLoading={isLoading} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};