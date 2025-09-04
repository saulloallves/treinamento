import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Calendar, Pause, Play, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/ui/refresh-button";
import { toast } from "sonner";
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

interface ApprovedCollaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  position?: string;
  approved_at?: string;
  created_at: string;
  active: boolean;
}

interface ApprovedCollaboratorsListProps {
  unitCode: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ApprovedCollaboratorsList = ({ unitCode, onRefresh, isRefreshing }: ApprovedCollaboratorsListProps) => {
  const queryClient = useQueryClient();
  
  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['approved-collaborators', unitCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, position, approved_at, created_at, active')
        .eq('unit_code', unitCode)
        .eq('role', 'Colaborador')
        .eq('approval_status', 'aprovado')
        .order('approved_at', { ascending: false });

      if (error) throw error;
      return data as ApprovedCollaborator[];
    },
    enabled: !!unitCode,
  });

  const pauseCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from('users')
        .update({ active: false })
        .eq('id', collaboratorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-collaborators', unitCode] });
      toast.success("Colaborador pausado com sucesso!");
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao pausar colaborador: " + error.message);
    }
  });

  const activateCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from('users')
        .update({ active: true })
        .eq('id', collaboratorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-collaborators', unitCode] });
      toast.success("Colaborador ativado com sucesso!");
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao ativar colaborador: " + error.message);
    }
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', collaboratorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-collaborators', unitCode] });
      toast.success("Colaborador removido com sucesso!");
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao remover colaborador: " + error.message);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Colaboradores Aprovados
            </CardTitle>
            {onRefresh && (
              <RefreshButton 
                onClick={onRefresh} 
                isRefreshing={isRefreshing || false}
                size="sm"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p>Carregando colaboradores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Colaboradores Aprovados
            <Badge variant="secondary">{collaborators.length}</Badge>
          </CardTitle>
          {onRefresh && (
            <RefreshButton 
              onClick={onRefresh} 
              isRefreshing={isRefreshing || false}
              size="sm"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum colaborador aprovado encontrado.
          </p>
        ) : (
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{collaborator.name}</h4>
                      <Badge 
                        variant={collaborator.active ? "outline" : "secondary"} 
                        className={collaborator.active 
                          ? "text-xs bg-green-50 text-green-700 border-green-200" 
                          : "text-xs bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {collaborator.active ? "✓ Ativo" : "⏸ Pausado"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {collaborator.email}
                    </p>
                    {collaborator.position && (
                      <p className="text-sm text-muted-foreground">
                        Cargo: {collaborator.position}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {collaborator.approved_at 
                        ? `Aprovado em ${format(new Date(collaborator.approved_at), "dd/MM/yyyy", { locale: ptBR })}`
                        : `Cadastrado em ${format(new Date(collaborator.created_at), "dd/MM/yyyy", { locale: ptBR })}`
                      }
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {collaborator.active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pauseCollaboratorMutation.mutate(collaborator.id)}
                        disabled={pauseCollaboratorMutation.isPending}
                        className="text-xs"
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pausar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => activateCollaboratorMutation.mutate(collaborator.id)}
                        disabled={activateCollaboratorMutation.isPending}
                        className="text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Ativar
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remover
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{collaborator.name}</strong>?
                            Esta ação irá excluir completamente o cadastro do colaborador e não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeCollaboratorMutation.mutate(collaborator.id)}
                            disabled={removeCollaboratorMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovedCollaboratorsList;