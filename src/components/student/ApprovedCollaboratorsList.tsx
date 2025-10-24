import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, supabasePublic } from "@/integrations/supabase/client";
import {
  Users,
  UserCheck,
  Calendar,
  Pause,
  Play,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/ui/refresh-button";
import { toast } from "sonner";
import { useCreateCollaboratorGroup } from "@/hooks/useCollaborationApprovals";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ApprovedCollaboratorsList = ({
  onRefresh,
  isRefreshing,
}: ApprovedCollaboratorsListProps) => {
  const queryClient = useQueryClient();
  const createGroupMutation = useCreateCollaboratorGroup();
  const { data: currentUser } = useCurrentUser();

  const allUnitCodes = [
    ...(currentUser?.unit_codes || []),
    ...(currentUser?.unit_code ? [currentUser.unit_code] : []),
  ].filter((code, index, self) => code && self.indexOf(code) === index);

  // Query para buscar info da unidade principal e grupo de colaboradores
  const { data: unitInfo } = useQuery({
    queryKey: ["unit-info", currentUser?.unit_code],
    queryFn: async () => {
      if (!currentUser?.unit_code) return null;

      // Buscar dados da unidade
      const { data: unitData, error: unitError } = await supabasePublic
        .from("unidades")
        .select("id, group_code, group_name")
        .eq("group_code", parseInt(currentUser.unit_code))
        .single();

      if (unitError) throw unitError;

      // Buscar grupo de colaboradores na tabela unidades_grupos_whatsapp
      const { data: groupData, error: groupError } = await supabasePublic
        .from("unidades_grupos_whatsapp")
        .select("group_id")
        .eq("unit_id", unitData.id)
        .eq("kind", "colab")
        .maybeSingle();

      if (groupError && groupError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Erro ao buscar grupo:", groupError);
      }

      // console.log("🔍 Unit Info:", {
      //   unitId: unitData.id,
      //   groupCode: unitData.group_code,
      //   groupName: unitData.group_name,
      //   hasGroup: !!groupData?.group_id,
      //   groupId: groupData?.group_id,
      // });

      return {
        ...unitData,
        grupo_colaborador: groupData?.group_id || null,
      };
    },
    enabled: !!currentUser?.unit_code,
  });

  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ["approved-collaborators", allUnitCodes.join(",")],
    queryFn: async () => {
      if (allUnitCodes.length === 0) return [];

      const { data, error } = await supabase
        .from("users")
        .select(
          "id, name, email, role, position, approved_at, created_at, active"
        )
        // @ts-expect-error - Supabase type inference issue
        .in("unit_code", allUnitCodes)
        // @ts-expect-error - Supabase type inference issue
        .eq("role", "Colaborador")
        // @ts-expect-error - Supabase type inference issue
        .eq("approval_status", "aprovado")
        .order("approved_at", { ascending: false });

      if (error) throw error;
      return data as ApprovedCollaborator[];
    },
    enabled: allUnitCodes.length > 0,
  });

  const pauseCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from("users")
        // @ts-expect-error - Supabase type inference issue
        .update({ active: false })
        // @ts-expect-error - Supabase type inference issue
        .eq("id", collaboratorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["approved-collaborators", allUnitCodes.join(",")],
      });
      toast.success("Colaborador pausado com sucesso!");
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao pausar colaborador: " + error.message);
    },
  });

  const activateCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from("users")
        // @ts-expect-error - Supabase type inference issue
        .update({ active: true })
        // @ts-expect-error - Supabase type inference issue
        .eq("id", collaboratorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["approved-collaborators", allUnitCodes.join(",")],
      });
      toast.success("Colaborador ativado com sucesso!");
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao ativar colaborador: " + error.message);
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      // Buscar dados do colaborador antes de remover
      const { data: collaborator } = await supabase
        .from("users")
        .select("phone, name, unit_code")
        // @ts-expect-error - Supabase type inference issue
        .eq("id", collaboratorId)
        .single();

      // Buscar o grupo de colaboradores da unidade
      // @ts-expect-error - Supabase type inference issue
      if (collaborator && collaborator.phone && unitInfo?.grupo_colaborador) {
        try {
          console.log("Removendo colaborador do grupo WhatsApp...");
          await supabase.functions.invoke("remove-collaborator-from-group", {
            body: {
              groupId: unitInfo.grupo_colaborador,
              // @ts-expect-error - Supabase type inference issue
              phone: collaborator.phone,
              // @ts-expect-error - Supabase type inference issue
              name: collaborator.name,
            },
          });
          console.log("Colaborador removido do grupo WhatsApp com sucesso!");
        } catch (error) {
          console.warn(
            "Erro ao remover do grupo WhatsApp (não bloqueante):",
            error
          );
        }
      }

      // Remover do banco de dados
      const { error } = await supabase
        .from("users")
        .delete()
        // @ts-expect-error - Supabase type inference issue
        .eq("id", collaboratorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["approved-collaborators", allUnitCodes.join(",")],
      });
      toast.success("Colaborador removido com sucesso!");
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao remover colaborador: " + error.message);
    },
  });

  const handleCreateGroup = () => {
    if (unitInfo?.group_name && currentUser?.unit_code) {
      createGroupMutation.mutate({
        unitCode: currentUser.unit_code,
        grupo: unitInfo.group_name,
      });
    }
  };

  const hasGroup =
    unitInfo?.grupo_colaborador && unitInfo.grupo_colaborador !== "";
  const showCreateGroupButton = !hasGroup && collaborators.length > 0;

  // console.log("🔍 Group Button Logic:", {
  //   hasGroup,
  //   grupo_colaborador: unitInfo?.grupo_colaborador,
  //   collaboratorsCount: collaborators.length,
  //   showCreateGroupButton,
  // });

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
        {showCreateGroupButton && (
          <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
            <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                    Grupo de Colaboradores não criado
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Clique no botão ao lado para criar o grupo no WhatsApp e
                    adicionar automaticamente todos os colaboradores aprovados.
                  </p>
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={createGroupMutation.isPending}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                >
                  <MessageCircle className="h-3 w-3 mr-2" />
                  {createGroupMutation.isPending ? "Criando..." : "Criar Grupo"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {collaborators.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum colaborador aprovado encontrado.
          </p>
        ) : (
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start flex-wrap gap-2">
                      <h4 className="font-semibold text-foreground text-sm sm:text-base break-words flex-1 min-w-0">
                        {collaborator.name}
                      </h4>
                      <Badge
                        variant={collaborator.active ? "default" : "secondary"}
                        className={`text-xs shrink-0 ${
                          collaborator.active
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                            : "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                        }`}
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
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <span className="font-medium">Email:</span>{" "}
                        <span className="break-all">{collaborator.email}</span>
                      </p>
                      {collaborator.position && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <span className="font-medium">Cargo:</span>{" "}
                          {collaborator.position}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="text-xs">
                        {collaborator.approved_at
                          ? `Aprovado em ${format(
                              new Date(collaborator.approved_at),
                              "dd/MM/yyyy",
                              { locale: ptBR }
                            )}`
                          : `Cadastrado em ${format(
                              new Date(collaborator.created_at),
                              "dd/MM/yyyy",
                              { locale: ptBR }
                            )}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                    {collaborator.active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          pauseCollaboratorMutation.mutate(collaborator.id)
                        }
                        disabled={pauseCollaboratorMutation.isPending}
                        className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20 flex-1 sm:flex-none"
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pausar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          activateCollaboratorMutation.mutate(collaborator.id)
                        }
                        disabled={activateCollaboratorMutation.isPending}
                        className="text-xs border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20 flex-1 sm:flex-none"
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
                          className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remover
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                          <AlertDialogDescription className="break-words">
                            Tem certeza que deseja remover{" "}
                            <strong>{collaborator.name}</strong>? Esta ação irá
                            excluir completamente o cadastro do colaborador e
                            não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              removeCollaboratorMutation.mutate(collaborator.id)
                            }
                            disabled={removeCollaboratorMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
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
