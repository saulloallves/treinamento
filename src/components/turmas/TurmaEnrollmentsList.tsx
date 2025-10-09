import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import LinkEnrollmentButton from "@/components/enrollments/LinkEnrollmentButton";

interface TurmaEnrollmentsListProps {
  enrollments: any[];
  isLoading: boolean;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'Ativo': { label: 'Ativo', variant: 'default' as const },
    'Concluído': { label: 'Concluído', variant: 'secondary' as const },
    'Cancelado': { label: 'Cancelado', variant: 'destructive' as const },
    'Suspenso': { label: 'Suspenso', variant: 'outline' as const },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || { 
    label: status, 
    variant: 'secondary' as const 
  };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const TurmaEnrollmentsList = ({ enrollments, isLoading }: TurmaEnrollmentsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-muted rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>Nenhuma inscrição encontrada para esta turma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">Alunos Inscritos ({enrollments.length})</h4>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Data de Inscrição</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {enrollment.student_name?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{enrollment.student_name}</p>
                    {enrollment.user_id && (
                      <p className="text-xs text-muted-foreground">
                        ID: {enrollment.user_id.slice(0, 8)}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">{enrollment.student_email}</span>
                  </div>
                  {enrollment.student_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span>{enrollment.student_phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm">
                    {enrollment.unit_name || enrollment.unit_code || 'N/A'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(enrollment.status)}
              </TableCell>
              
              <TableCell>
                <div className="space-y-1 min-w-[100px]">
                  <div className="flex justify-between text-xs">
                    <span>Progresso</span>
                    <span>{enrollment.progress_percentage}%</span>
                  </div>
                  <Progress value={enrollment.progress_percentage} className="h-2" />
                </div>
              </TableCell>
              
              <TableCell>
                <span className="text-sm">
                  {format(new Date(enrollment.enrollment_date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </TableCell>
              
              <TableCell>
                {!enrollment.user_id && (
                  <LinkEnrollmentButton 
                    enrollmentId={enrollment.id} 
                    studentEmail={enrollment.student_email} 
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};