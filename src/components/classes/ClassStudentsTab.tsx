import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useStudentClasses, 
  useEnrollStudent, 
  useUpdateStudentClassStatus,
  type Class
} from "@/hooks/useClasses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EnrollStudentDialog from "./EnrollStudentDialog";

interface ClassStudentsTabProps {
  classId: string;
  classData: Class;
  canManage: boolean;
}

const ClassStudentsTab = ({ classId, classData, canManage }: ClassStudentsTabProps) => {
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: studentClasses = [], isLoading } = useStudentClasses(classId);
  const updateStudentStatus = useUpdateStudentClassStatus();

  const filteredStudents = studentClasses.filter(sc => {
    const matchesSearch = sc.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sc.student?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || sc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'inscrito': return 'default';
      case 'concluido': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'inscrito': return 'Inscrito';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const handleStatusUpdate = async (studentClassId: string, newStatus: 'inscrito' | 'concluido' | 'cancelado') => {
    try {
      const completionDate = newStatus === 'concluido' ? new Date().toISOString() : undefined;
      await updateStudentStatus.mutateAsync({
        studentClassId,
        status: newStatus,
        completionDate,
      });
    } catch (error) {
      console.error('Error updating student status:', error);
    }
  };

  const enrolledCount = studentClasses.filter(sc => sc.status === 'inscrito').length;
  const completedCount = studentClasses.filter(sc => sc.status === 'concluido').length;
  const cancelledCount = studentClasses.filter(sc => sc.status === 'cancelado').length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="h-64 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Alunos da Turma</h3>
          <p className="text-sm text-muted-foreground">
            {enrolledCount} inscritos • {completedCount} concluídos • {cancelledCount} cancelados
          </p>
        </div>
        
        {canManage && classData.status !== 'encerrada' && (
          <Button onClick={() => setEnrollDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Inscrever Aluno
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inscritos</CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-600">
              {enrolledCount}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CardDescription className="text-2xl font-bold text-green-600">
              {completedCount}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-600">
              {studentClasses.length > 0 ? Math.round((completedCount / studentClasses.length) * 100) : 0}%
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Status</SelectItem>
            <SelectItem value="inscrito">Inscrito</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {studentClasses.length === 0 ? 'Nenhum aluno inscrito' : 'Nenhum aluno encontrado'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {studentClasses.length === 0 
                ? 'Esta turma ainda não possui alunos inscritos.'
                : 'Não há alunos que correspondam aos filtros aplicados.'
              }
            </p>
            {canManage && classData.status !== 'encerrada' && studentClasses.length === 0 && (
              <Button onClick={() => setEnrollDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Inscrever Primeiro Aluno
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Inscrição</TableHead>
                <TableHead>Data de Conclusão</TableHead>
                {canManage && <TableHead className="w-[100px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((studentClass) => (
                <TableRow key={studentClass.id}>
                  <TableCell className="font-medium">
                    {studentClass.student?.name}
                  </TableCell>
                  <TableCell>{studentClass.student?.email}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(studentClass.status)}>
                      {getStatusLabel(studentClass.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(studentClass.enrolled_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {studentClass.completion_date 
                      ? format(new Date(studentClass.completion_date), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'
                    }
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <div className="flex gap-1">
                        {studentClass.status === 'inscrito' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(studentClass.id, 'concluido')}
                            disabled={updateStudentStatus.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {studentClass.status !== 'cancelado' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updateStudentStatus.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancelar inscrição</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja cancelar a inscrição de {studentClass.student?.name}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleStatusUpdate(studentClass.id, 'cancelado')}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EnrollStudentDialog
        classId={classId}
        classData={classData}
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
      />
    </div>
  );
};

export default ClassStudentsTab;