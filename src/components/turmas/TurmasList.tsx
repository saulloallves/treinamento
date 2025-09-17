import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Square, UserPlus } from "lucide-react";
import { useTurmas, useStartTurma, useConcludeTurma } from "@/hooks/useTurmas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreateTurmaDialog } from "./CreateTurmaDialog";
import { EnrollStudentDialog } from "./EnrollStudentDialog";
import { useState } from "react";
import TurmaStatusFilters from "@/components/common/TurmaStatusFilters";

interface TurmasListProps {
  courseId: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'agendada':
      return <Badge variant="secondary">Agendada</Badge>;
    case 'em_andamento':
      return <Badge variant="default">Em Andamento</Badge>;
    case 'encerrada':
      return <Badge variant="outline">Encerrada</Badge>;
    case 'cancelada':
      return <Badge variant="destructive">Cancelada</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const TurmasList = ({ courseId }: TurmasListProps) => {
  const { data: turmas, isLoading } = useTurmas(courseId);
  const startTurma = useStartTurma();
  const concludeTurma = useConcludeTurma();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Filter turmas by status (same logic as other components)
  const filteredTurmas = turmas?.filter(turma => {
    if (statusFilter === "todos") {
      // Default view: show only active turmas (exclude 'encerrada')
      return turma.status !== 'encerrada';
    } else if (statusFilter === "encerrada") {
      // Archive view: show only archived turmas
      return turma.status === 'encerrada';
    } else {
      // Specific status filter
      return turma.status === statusFilter;
    }
  }) || [];

  const handleStartTurma = (turmaId: string) => {
    startTurma.mutate(turmaId);
  };

  const handleConcludeTurma = (turmaId: string) => {
    concludeTurma.mutate(turmaId);
  };

  const handleEnrollStudent = (turmaId: string) => {
    setSelectedTurmaId(turmaId);
    setEnrollDialogOpen(true);
  };

  if (isLoading) {
    return <div>Carregando turmas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Turmas</h3>
      </div>

      {/* Quick Status Filters */}
      <TurmaStatusFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {!filteredTurmas || filteredTurmas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {turmas?.length === 0 
            ? "Nenhuma turma criada ainda. Clique em 'Criar Turma' para começar."
            : "Nenhuma turma encontrada com o filtro aplicado."
          }
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome/Código</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Inscritos</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTurmas.map((turma) => (
              <TableRow key={turma.id}>
                <TableCell>
                  <div>
                    {turma.name && <div className="font-medium">{turma.name}</div>}
                    {turma.code && <div className="text-sm text-muted-foreground">{turma.code}</div>}
                    {!turma.name && !turma.code && (
                      <div className="text-sm text-muted-foreground">
                        {turma.id.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{turma.responsavel_user?.name}</div>
                    <div className="text-sm text-muted-foreground">{turma.responsavel_user?.email}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(turma.status)}</TableCell>
                <TableCell>
                  {format(new Date(turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>{turma.enrollments_count || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {turma.status === 'agendada' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStartTurma(turma.id)}
                          disabled={startTurma.isPending}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEnrollStudent(turma.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Inscrever
                        </Button>
                      </>
                    )}
                    {turma.status === 'em_andamento' && (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleConcludeTurma(turma.id)}
                          disabled={concludeTurma.isPending}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Encerrar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEnrollStudent(turma.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Inscrever
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <EnrollStudentDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        turmaId={selectedTurmaId}
        courseId={courseId}
      />
    </div>
  );
};