import { useState } from "react";
import { Plus, Settings, UserX, UserCheck, Trash2, Edit, Key, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProfessors, useUpdateProfessorStatus, useDeleteProfessor } from "@/hooks/useProfessors";
import CreateProfessorDialog from "./CreateProfessorDialog";
import ProfessorPermissionsDialog from "./ProfessorPermissionsDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";
import { safeFormatDate } from "@/lib/dateUtils";

const ProfessorsList = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedProfessorId, setSelectedProfessorId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState<string | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<{ id: string; name: string } | null>(null);
  const isMobile = useIsMobile();

  const { data: professors = [], isLoading } = useProfessors();
  const updateStatusMutation = useUpdateProfessorStatus();
  const deleteProfessorMutation = useDeleteProfessor();

  const handleToggleStatus = (professorId: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({
      professorId,
      active: !currentStatus
    });
  };

  const handleOpenPermissions = (professorId: string) => {
    setSelectedProfessorId(professorId);
    setPermissionsDialogOpen(true);
  };

  const handleDeleteClick = (professorId: string) => {
    setProfessorToDelete(professorId);
    setDeleteDialogOpen(true);
  };

  const handleResetPasswordClick = (professorId: string, professorName: string) => {
    setSelectedProfessor({ id: professorId, name: professorName });
    setResetPasswordDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (professorToDelete) {
      deleteProfessorMutation.mutate(professorToDelete);
      setDeleteDialogOpen(false);
      setProfessorToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Professores ({professors.length})
          </CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Professor
          </Button>
        </CardHeader>
        <CardContent>
          {/* Mobile Cards */}
          {isMobile ? (
            <div className="space-y-3">
              {professors.map((professor) => (
                <div key={professor.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{professor.name}</div>
                        <div className="text-xs text-muted-foreground">{professor.email}</div>
                      </div>
                    </div>
                    <Badge variant={professor.active ? "default" : "secondary"}>
                      {professor.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-3">
                    <div>Telefone: {professor.phone || '-'}</div>
                    <div>Criado em: {safeFormatDate(professor.created_at)}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPermissions(professor.id)}
                      className="flex-1 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Permissões
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetPasswordClick(professor.id, professor.name)}
                      className="h-8 w-8 p-0"
                    >
                      <Key className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(professor.id, professor.active)}
                      className="h-8 w-8 p-0"
                    >
                      {professor.active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(professor.id)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professors.map((professor) => (
                <TableRow key={professor.id}>
                  <TableCell className="font-medium">
                    {professor.name}
                  </TableCell>
                  <TableCell>{professor.email}</TableCell>
                  <TableCell>{professor.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={professor.active ? "default" : "secondary"}
                    >
                      {professor.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {safeFormatDate(professor.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenPermissions(professor.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Gerenciar Permissões
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResetPasswordClick(professor.id, professor.name)}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Redefinir Senha
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(professor.id, professor.active)}
                        >
                          {professor.active ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(professor.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          
          {professors.length === 0 && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Nenhum professor cadastrado ainda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProfessorDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <ProfessorPermissionsDialog
        professorId={selectedProfessorId}
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        professorId={selectedProfessor?.id || null}
        professorName={selectedProfessor?.name || ""}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita
              e todas as permissões associadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfessorsList;