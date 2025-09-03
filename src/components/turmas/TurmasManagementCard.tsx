import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Square, UserPlus, Users, Calendar, GraduationCap } from "lucide-react";
import { useStartTurma, useConcludeTurma } from "@/hooks/useTurmas";
import { EnrollStudentDialog } from "./EnrollStudentDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TurmasManagementCardProps {
  course: {
    id: string;
    name: string;
    tipo: string;
  };
  turmas: any[];
  onCreateTurma: () => void;
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

export const TurmasManagementCard = ({ course, turmas, onCreateTurma }: TurmasManagementCardProps) => {
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedTurmaId, setSelectedTurmaId] = useState("");
  
  const startTurma = useStartTurma();
  const concludeTurma = useConcludeTurma();

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{course.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {turmas.length} turma{turmas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button onClick={onCreateTurma} size="sm">
            Nova Turma
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {turmas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma turma criada para este curso ainda.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turma</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Inscritos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turmas.map((turma) => (
                <TableRow key={turma.id}>
                  <TableCell>
                    <div>
                      {turma.name && <div className="font-medium">{turma.name}</div>}
                      {turma.code && (
                        <div className="text-sm text-muted-foreground">
                          Código: {turma.code}
                        </div>
                      )}
                      {!turma.name && !turma.code && (
                        <div className="text-sm text-muted-foreground">
                          {turma.id.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {turma.responsavel_user?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {turma.responsavel_user?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(turma.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{turma.enrollments_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {turma.status === 'agendada' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStartTurma(turma.id)}
                            disabled={startTurma.isPending}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEnrollStudent(turma.id)}
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
                            onClick={() => handleConcludeTurma(turma.id)}
                            disabled={concludeTurma.isPending}
                          >
                            <Square className="h-3 w-3 mr-1" />
                            Encerrar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEnrollStudent(turma.id)}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
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
          courseId={course.id}
        />
      </CardContent>
    </Card>
  );
};