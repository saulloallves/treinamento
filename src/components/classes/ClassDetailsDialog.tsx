import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Play, 
  Square, 
  Trash2,
  UserPlus,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useClass, 
  useManageClassStatus, 
  useDeleteClass,
  useStudentClasses
} from "@/hooks/useClasses";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import EditClassDialog from "./EditClassDialog";
import ClassStudentsTab from "./ClassStudentsTab";

interface ClassDetailsDialogProps {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClassDetailsDialog = ({ classId, open, onOpenChange }: ClassDetailsDialogProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: currentUser } = useCurrentUser();
  const { data: isAdmin = false } = useIsAdmin(currentUser?.id);
  const { data: classData, isLoading } = useClass(classId);
  const { data: studentClasses = [] } = useStudentClasses(classId);
  const manageStatus = useManageClassStatus();
  const deleteClass = useDeleteClass();

  if (isLoading || !classData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="h-6 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-32 bg-muted animate-pulse rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const canManage = isAdmin || classData.responsible_id === currentUser?.id;
  const canStartEnd = canManage && classData.status !== 'encerrada';
  const canDelete = isAdmin && classData.status === 'criada';

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'criada': return 'outline';
      case 'iniciada': return 'default';
      case 'encerrada': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'criada': return 'Criada';
      case 'iniciada': return 'Em Andamento';
      case 'encerrada': return 'Encerrada';
      default: return status;
    }
  };

  const handleStatusChange = async (newStatus: 'iniciada' | 'encerrada') => {
    try {
      await manageStatus.mutateAsync({ 
        classId: classData.id, 
        newStatus 
      });
    } catch (error) {
      console.error('Error changing class status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClass.mutateAsync(classData.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const enrolledCount = studentClasses.filter(sc => sc.status === 'inscrito').length;
  const completedCount = studentClasses.filter(sc => sc.status === 'concluido').length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <DialogTitle className="text-2xl">{classData.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(classData.status)}>
                    {getStatusLabel(classData.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {classData.course?.name}
                  </span>
                </div>
              </div>
              
              {canManage && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir turma</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A turma será permanentemente
                            excluída junto com todas as inscrições.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="students">
                Alunos ({enrolledCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {classData.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Descrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {classData.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Informações Gerais</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Curso: </span>
                      <span className="font-medium">{classData.course?.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Tipo: </span>
                      <span className="font-medium">
                        {classData.course?.tipo === 'ao_vivo' ? 'Ao Vivo' : 'Gravado'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Responsável: </span>
                      <span className="font-medium">{classData.responsible?.name}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cronograma</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Data Limite: </span>
                      <span className="font-medium">
                        {format(new Date(classData.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    {classData.started_at && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Iniciada em: </span>
                        <span className="font-medium text-green-600">
                          {format(new Date(classData.started_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}
                    {classData.ended_at && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Encerrada em: </span>
                        <span className="font-medium">
                          {format(new Date(classData.ended_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alunos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Inscritos: </span>
                      <span className="font-medium">{enrolledCount}/{classData.max_students}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Concluídos: </span>
                      <span className="font-medium text-green-600">{completedCount}</span>
                    </div>
                  </CardContent>
                </Card>

                {canStartEnd && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Ações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {classData.status === 'criada' && (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleStatusChange('iniciada')}
                          disabled={manageStatus.isPending}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Turma
                        </Button>
                      )}
                      
                      {classData.status === 'iniciada' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => handleStatusChange('encerrada')}
                          disabled={manageStatus.isPending}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Encerrar Turma
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="students">
              <ClassStudentsTab 
                classId={classId} 
                classData={classData}
                canManage={canManage}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <EditClassDialog
        classData={classData}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};

export default ClassDetailsDialog;