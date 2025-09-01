import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MapPin, Phone, Mail, Calendar, Users, Edit, Trash2 } from "lucide-react";
import { Unidade, useUnidadeCollaborators, useDeleteUnidade } from "@/hooks/useUnidades";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UnidadeDetailsDialogProps {
  unidade: Unidade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (unidade: Unidade) => void;
}

const UnidadeDetailsDialog = ({
  unidade,
  open,
  onOpenChange,
  onEdit,
}: UnidadeDetailsDialogProps) => {
  const { data: colaboradores = [] } = useUnidadeCollaborators(
    unidade?.codigo_grupo || 0
  );
  const deleteUnidade = useDeleteUnidade();
  const { toast } = useToast();

  if (!unidade) return null;

  const handleDelete = async () => {
    try {
      await deleteUnidade.mutateAsync(unidade.id);
      toast({
        title: "Unidade excluída",
        description: "A unidade foi excluída com sucesso.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir unidade",
        description: "Ocorreu um erro ao tentar excluir a unidade.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "aprovado":
        return "default";
      case "pendente":
        return "secondary";
      case "rejeitado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aprovado":
        return "Aprovado";
      case "pendente":
        return "Pendente";
      case "rejeitado":
        return "Recusado";
      default:
        return "N/A";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span>{unidade.grupo}</span>
              <Badge variant="outline">{unidade.codigo_grupo}</Badge>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(unidade)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a unidade "{unidade.grupo}"? 
                      Esta ação não pode ser desfeita e todos os dados relacionados à unidade serão perdidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteUnidade.isPending}
                    >
                      {deleteUnidade.isPending ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Código da Unidade:</span>
                <p className="text-sm text-muted-foreground">
                  {unidade.codigo_grupo || "N/A"}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium">Grupo:</span>
                <p className="text-sm text-muted-foreground">
                  {unidade.grupo || "N/A"}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium">Modelo:</span>
                <p className="text-sm text-muted-foreground">
                  {unidade.modelo_loja || "N/A"}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium">Fase:</span>
                <Badge
                  variant={
                    unidade.fase_loja?.toUpperCase() === "OPERAÇÃO"
                      ? "default"
                      : "secondary"
                  }
                >
                  {unidade.fase_loja || "N/A"}
                </Badge>
              </div>

              {unidade.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Criado em:{" "}
                    {format(new Date(unidade.created_at), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Cidade:</span>
                <p className="text-sm text-muted-foreground">
                  {unidade.cidade || "N/A"}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium">Estado:</span>
                <p className="text-sm text-muted-foreground">
                  {unidade.uf || "N/A"}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium">Endereço:</span>
                <p className="text-sm text-muted-foreground">
                  {unidade.endereco || "N/A"}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium">CEP:</span>
                <p className="text-sm text-muted-foreground">
                  {unidade.cep || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">
                  {unidade.email || "N/A"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">
                  {unidade.telefone || "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Colaboradores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Colaboradores ({colaboradores.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {colaboradores.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {colaboradores.map((colaborador) => (
                    <div
                      key={colaborador.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {colaborador.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {colaborador.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {colaborador.role || "Aluno"}
                        </p>
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(
                          colaborador.approval_status || "aprovado"
                        )}
                        className="text-xs"
                      >
                        {getStatusLabel(
                          colaborador.approval_status || "aprovado"
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum colaborador encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnidadeDetailsDialog;