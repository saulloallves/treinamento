import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFranchiseeApprovals } from "@/hooks/useFranchiseeApprovals";
import { useApproveCollaborator, type CollaborationApproval } from "@/hooks/useCollaborationApprovals";
import { Users, Clock, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/ui/refresh-button";
import CollaboratorDetailsDialog from "@/components/collaboration/CollaboratorDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FranchiseeCollaboratorApprovalsProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const FranchiseeCollaboratorApprovals = ({ onRefresh, isRefreshing }: FranchiseeCollaboratorApprovalsProps) => {
  const { data: approvals = [], isLoading } = useFranchiseeApprovals();
  const approveCollaborator = useApproveCollaborator();
  
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<CollaborationApproval | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDetailsModal = (approval: CollaborationApproval) => {
    setSelectedCollaborator(approval);
    setDetailsModalOpen(true);
  };

  const handleReject = async (approvalId: string) => {
    try {
      await approveCollaborator.mutateAsync({ approvalId, approve: false });
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
    }
  };

  const handleFinalizeApproval = async (formData: any) => {
    if (!selectedCollaborator) return;

    setIsSubmitting(true);
    try {
      // 1. Chamar a Edge Function para atualizar dados na Matriz
      const { error: updateError } = await supabase.functions.invoke('update-collaborator-details', {
        body: {
          email: selectedCollaborator.collaborator_email,
          ...formData,
        },
      });

      if (updateError) {
        throw new Error(`Falha na sincronização com a Matriz: ${updateError.message}`);
      }

      // 2. Chamar a RPC para aprovar localmente
      await approveCollaborator.mutateAsync({ approvalId: selectedCollaborator.id, approve: true });

      setDetailsModalOpen(false);
      setSelectedCollaborator(null);
    } catch (error: any) {
      console.error('Erro ao finalizar aprovação:', error);
      toast.error("Erro ao aprovar", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Solicitações pendentes
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
          <p>Carregando aprovações...</p>
        </CardContent>
      </Card>
    );
  }

  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Solicitações pendentes
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
          <p className="text-muted-foreground">
            Nenhuma solicitação de aprovação pendente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Solicitações pendentes de todas as unidades
              <Badge variant="secondary">{approvals.length}</Badge>
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
        <CardContent className="space-y-3">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-3 sm:p-4 space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start flex-wrap gap-2">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base break-words flex-1 min-w-0">
                    {approval.collaborator_name}
                  </h4>
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 shrink-0">
                    <Clock className="h-3 w-3 mr-1" />
                    {approval.collaborator_role}
                  </Badge>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Unidade: {approval.unit_code}
                  </Badge>
                </div>
                
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-medium">Email:</span>{" "}
                  <span className="break-all">{approval.collaborator_email}</span>
                </p>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="text-xs">
                    Solicitado em {format(new Date(approval.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-amber-200/30 dark:border-amber-800/30">
                <Button
                  size="sm"
                  onClick={() => handleOpenDetailsModal(approval)}
                  disabled={approveCollaborator.isPending}
                  className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                >
                  <Check className="h-3 w-3" />
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(approval.id)}
                  disabled={approveCollaborator.isPending}
                  className="flex items-center justify-center gap-1 border-destructive/30 text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                >
                  <X className="h-3 w-3" />
                  Rejeitar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <CollaboratorDetailsDialog
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        collaborator={selectedCollaborator}
        onSubmit={handleFinalizeApproval}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default FranchiseeCollaboratorApprovals;