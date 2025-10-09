import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Plus, Loader2 } from "lucide-react";
import { safeFormatDateTimeDetailed } from "@/lib/dateUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import CreateAdminDialog from "./CreateAdminDialog";
import AdminsListMobile from "./AdminsListMobile";

const AdminsList = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const queryClient = useQueryClient();

  // Fetch admins
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from("admin_users")
        .update({ active: false })
        .eq("id", adminId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Administrador removido com sucesso!");
      setDeleteAdminId(null);
    },
    onError: (error) => {
      console.error("Error deleting admin:", error);
      toast.error("Erro ao remover administrador");
    },
  });

  const handleConfirmDelete = () => {
    if (deleteAdminId) {
      deleteAdminMutation.mutate(deleteAdminId);
    }
  };

  const handleDeleteAdmin = (adminId: string) => {
    setDeleteAdminId(adminId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 py-4 sm:px-4 sm:py-5">
          <div>
            <CardTitle className="text-lg text-foreground">Administradores do Sistema</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Gerencie os administradores da plataforma</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            size="default"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Criar Admin</span>
          </Button>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 pb-4">
          {isMobile ? (
            <AdminsListMobile 
              admins={admins}
              onDeleteAdmin={handleDeleteAdmin}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={admin.status === 'approved' ? 'default' : 'secondary'}
                      >
                        {admin.status === 'approved' ? 'Ativo' : admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {safeFormatDateTimeDetailed(admin.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setDeleteAdminId(admin.id)}
                            className="text-destructive"
                          >
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {admins.length === 0 && !isMobile && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhum administrador encontrado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAdminDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <AlertDialog open={!!deleteAdminId} onOpenChange={() => setDeleteAdminId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja remover este administrador? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminsList;