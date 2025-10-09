import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, GraduationCap, Trash2 } from "lucide-react";
import LinkEnrollmentButton from "./LinkEnrollmentButton";
import { useDeleteEnrollment } from "@/hooks/useEnrollments";

interface EnrollmentGroup {
  id: string;
  name: string;
  turmaName: string;
  professorName: string;
  courseName: string;
  items: any[];
}

interface TurmaEnrollmentsDialogProps {
  group: EnrollmentGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'Ativo': { label: 'Ativo', variant: 'default' },
    'Inativo': { label: 'Inativo', variant: 'secondary' },
    'Concluído': { label: 'Concluído', variant: 'outline' },
    'Cancelado': { label: 'Cancelado', variant: 'destructive' },
  };
  
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const TurmaEnrollmentsDialog = ({ 
  group, 
  open, 
  onOpenChange 
}: TurmaEnrollmentsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const deleteEnrollment = useDeleteEnrollment();

  if (!group) return null;

  const filteredEnrollments = group.items.filter(enrollment =>
    enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleDeleteEnrollment = (enrollmentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta inscrição?')) {
      deleteEnrollment.mutate(enrollmentId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border pb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <DialogTitle className="text-xl font-semibold">
                {group.courseName}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">Turma:</span>
                <span>{group.turmaName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <Badge variant="secondary">{group.items.length} inscritos</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="py-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Enrollments table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            <table className="w-full">
              <thead className="sticky top-0 bg-background border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Aluno
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Contato
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Unidade
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Data
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">
                        {enrollment.student_name}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-sm text-foreground">
                          {enrollment.student_email}
                        </div>
                        {enrollment.student_phone && (
                          <div className="text-xs text-muted-foreground">
                            {enrollment.student_phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">
                        {enrollment.units?.name || "-"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(enrollment.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">
                        {enrollment.enrollment_date 
                          ? new Date(enrollment.enrollment_date).toLocaleDateString("pt-BR")
                          : "-"
                        }
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {!enrollment.user_id ? (
                          <LinkEnrollmentButton 
                            enrollmentId={enrollment.id} 
                            studentEmail={enrollment.student_email} 
                          />
                        ) : null}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEnrollment(enrollment.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEnrollments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nenhum resultado encontrado.' : 'Nenhuma inscrição encontrada.'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};