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
  unit_code?: string;
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

  // Query para buscar colaboradores aprovados
  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ["approved-collaborators", allUnitCodes.join(",")],
    queryFn: async () => {
      if (allUnitCodes.length === 0) return [];

      const { data, error } = await supabase
        .from("users")
        .select(
          "id, name, email, role, position, approved_at, created_at, active, unit_code"
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

  // Determinar a unidade alvo para criação do grupo
  // Se houver colaboradores, usar o unit_code deles (todos são da mesma unidade nesta lista)
  // Caso contrário, usar a unidade principal do usuário
  const targetUnitCode = collaborators.length > 0 
    ? collaborators[0].unit_code 
    : currentUser?.unit_code;

  // Query para buscar info da unidade alvo e grupo de colaboradores
  const { data: unitInfo } = useQuery({
    queryKey: ["unit-info", targetUnitCode],
    queryFn: async () => {
      if (!targetUnitCode) return null;

      console.log("🔍 Buscando informações para unit_code:", targetUnitCode);

      // Buscar dados da unidade
      const { data: unitData, error: unitError } = await supabasePublic
        .from("unidades")
        .select("id, group_code, group_name")
        .eq("group_code", parseInt(targetUnitCode))
        .single();

      if (unitError) {
        console.error("❌ Erro ao buscar unidade:", unitError);
        throw unitError;
      }

      console.log("✅ Unidade encontrada:", {
        id: unitData.id,
        code: unitData.group_code,
        name: unitData.group_name,
      });

      // Buscar grupo de colaboradores na tabela unidades_grupos_whatsapp
      const { data: groupData, error: groupError } = await supabasePublic
        .from("unidades_grupos_whatsapp")
        .select("group_id")
        .eq("unit_id", unitData.id)
        .eq("kind", "colab")
        .maybeSingle();

      if (groupError && groupError.code !== "PGRST116") {
        console.error("❌ Erro ao buscar grupo:", groupError);
      }

      console.log("📱 Grupo WhatsApp:", {
        exists: !!groupData?.group_id,
        groupId: groupData?.group_id,
      });

      return {
        ...unitData,
        grupo_colaborador: groupData?.group_id || null,
      };
    },
    enabled: !!targetUnitCode,
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
      const { data: collaborator, error: fetchError } = await supabase
        .from("users")
        .select("phone, name, unit_code")
        // @ts-expect-error - Supabase type inference issue
        .eq("id", collaboratorId)
        .single();

      if (fetchError) throw new Error("Erro ao buscar dados do colaborador");

      let whatsappRemoved = false;
      let whatsappError = null;

      // Tentar remover do grupo WhatsApp se houver grupo e telefone
      // @ts-expect-error - Supabase type inference issue
      if (collaborator && collaborator.phone && unitInfo?.grupo_colaborador) {
        try {
          console.log("🔄 Removendo colaborador do grupo WhatsApp...");
          const { data, error } = await supabase.functions.invoke(
            "remove-collaborator-from-group",
            {
              body: {
                groupId: unitInfo.grupo_colaborador,
                // @ts-expect-error - Supabase type inference issue
                phone: collaborator.phone,
                // @ts-expect-error - Supabase type inference issue
                name: collaborator.name,
              },
            }
          );

          if (error) {
            whatsappError = error;
            console.warn("⚠️ Erro ao remover do WhatsApp:", error);
          } else {
            whatsappRemoved = true;
            console.log("✅ Colaborador removido do WhatsApp com sucesso!");
          }
        } catch (error) {
          whatsappError = error;
          console.warn("⚠️ Exceção ao remover do WhatsApp:", error);
        }
      }

      // Remover do banco de dados treinamento.users
      console.log("🔄 Removendo da tabela treinamento.users...");
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        // @ts-expect-error - Supabase type inference issue
        .eq("id", collaboratorId);

      if (deleteError) {
        console.error("❌ Erro ao remover de treinamento.users:", deleteError);
        throw deleteError;
      }
      console.log("✅ Removido de treinamento.users com sucesso!");

      // Remover da tabela auth.users usando edge function
      let authRemoved = false;
      let authError = null;

      try {
        console.log("🔄 Removendo da tabela auth.users...");
        const { data: authData, error: authDeleteError } =
          await supabase.functions.invoke("delete-user-auth", {
            body: {
              userId: collaboratorId,
              // @ts-expect-error - Supabase type inference issue
              userName: collaborator.name,
            },
          });

        if (authDeleteError) {
          authError = authDeleteError;
          console.warn("⚠️ Erro ao remover de auth.users:", authDeleteError);
        } else if (authData?.error) {
          authError = authData.error;
          console.warn("⚠️ Erro retornado pela função:", authData.error);
        } else {
          authRemoved = true;
          console.log("✅ Removido de auth.users com sucesso!");
        }
      } catch (error) {
        authError = error;
        console.warn("⚠️ Exceção ao remover de auth.users:", error);
      }

      return {
        whatsappRemoved,
        whatsappError,
        authRemoved,
        authError,
        // @ts-expect-error - Supabase type inference issue
        collaboratorName: collaborator.name,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["approved-collaborators", allUnitCodes.join(",")],
      });

      // Mensagem de sucesso detalhada
      const parts: string[] = [];
      
      if (result.whatsappRemoved) {
        parts.push("removido do grupo WhatsApp");
      }
      
      if (result.authRemoved) {
        parts.push("conta de autenticação excluída");
      }

      if (parts.length > 0) {
        toast.success(
          `${result.collaboratorName} foi removido do sistema (${parts.join(", ")})!`
        );
      } else {
        // Caso base: removido apenas da tabela users
        let message = `${result.collaboratorName} foi removido do sistema!`;
        const warnings: string[] = [];
        
        if (result.whatsappError) {
          warnings.push("WhatsApp");
        }
        if (result.authError) {
          warnings.push("autenticação");
        }
        
        if (warnings.length > 0) {
          message += ` (falha ao remover de: ${warnings.join(", ")})`;
        }
        
        toast.success(message);
      }

      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao remover colaborador: " + error.message);
    },
  });

  const handleCreateGroup = () => {
    if (!targetUnitCode) {
      toast.error("Não foi possível identificar a unidade para criar o grupo");
      return;
    }

    if (!unitInfo?.group_name) {
      toast.error("Informações da unidade não encontradas");
      return;
    }

    console.log("🚀 Criando grupo para:", {
      unitCode: targetUnitCode,
      unitName: unitInfo.group_name,
      collaboratorsCount: collaborators.length,
    });

    createGroupMutation.mutate({
      unitCode: targetUnitCode,
      grupo: unitInfo.group_name,
    });
  };

  const hasGroup =
    unitInfo?.grupo_colaborador && unitInfo.grupo_colaborador !== "";
  const showCreateGroupButton = !hasGroup && collaborators.length > 0;

  console.log("🔍 Group Button Logic:", {
    targetUnitCode,
    hasGroup,
    grupo_colaborador: unitInfo?.grupo_colaborador,
    collaboratorsCount: collaborators.length,
    showCreateGroupButton,
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
            {targetUnitCode && unitInfo?.group_name && (
              <Badge variant="outline" className="text-xs">
                {unitInfo.group_name}
              </Badge>
            )}
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
                    Grupo de Colaboradores não criado para {unitInfo?.group_name}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Clique no botão ao lado para criar o grupo no WhatsApp e
                    adicionar automaticamente os {collaborators.length} colaborador(es) aprovado(s) desta unidade.
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
                          <AlertDialogDescription className="break-words space-y-3">
                            <p>
                              Tem certeza que deseja remover{" "}
                              <strong>{collaborator.name}</strong>?
                            </p>
                            
                            <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
                              <p className="font-medium text-foreground">Esta ação irá:</p>
                              <ul className="space-y-1 list-disc list-inside">
                                {unitInfo?.grupo_colaborador && (
                                  <li>Remover do grupo WhatsApp</li>
                                )}
                                <li>Excluir a conta de autenticação</li>
                                <li>Revogar acesso ao sistema</li>
                                <li>Excluir completamente o cadastro</li>
                              </ul>
                            </div>

                            <p className="text-destructive font-medium">
                              ⚠️ Esta ação não pode ser desfeita.
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                          <AlertDialogCancel 
                            className="w-full sm:w-auto"
                            disabled={removeCollaboratorMutation.isPending}
                          >
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              removeCollaboratorMutation.mutate(collaborator.id)
                            }
                            disabled={removeCollaboratorMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                          >
                            {removeCollaboratorMutation.isPending ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Removendo...
                              </>
                            ) : (
                              "Confirmar remoção"
                            )}
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
