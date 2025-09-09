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
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">{collaborator.name}</h4>
                      <Badge 
                        variant={collaborator.active ? "default" : "secondary"} 
                        className={collaborator.active 
                          ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
                          : "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                        }
                      >
                        {collaborator.active ? (
                          <>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1" />
                            Pausado
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <span className="font-medium">Email:</span>
                        {collaborator.email}
                      </p>
                      {collaborator.position && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <span className="font-medium">Cargo:</span>
                          {collaborator.position}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit">
                      <Calendar className="h-3 w-3" />
                      {collaborator.approved_at 
                        ? `Aprovado em ${format(new Date(collaborator.approved_at), "dd/MM/yyyy", { locale: ptBR })}`
                        : `Cadastrado em ${format(new Date(collaborator.created_at), "dd/MM/yyyy", { locale: ptBR })}`
                      }
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-0">
                    {collaborator.active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pauseCollaboratorMutation.mutate(collaborator.id)}
                        disabled={pauseCollaboratorMutation.isPending}
                        className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
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
                        className="text-xs border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Ativar
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
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