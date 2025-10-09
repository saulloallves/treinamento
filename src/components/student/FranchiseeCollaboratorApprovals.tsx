import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFranchiseeApprovals } from "@/hooks/useFranchiseeApprovals";
import { useApproveCollaborator } from "@/hooks/useCollaborationApprovals";
import { Users, Clock, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/ui/refresh-button";

interface FranchiseeCollaboratorApprovalsProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const FranchiseeCollaboratorApprovals = ({ onRefresh, isRefreshing }: FranchiseeCollaboratorApprovalsProps) => {
  const { data: approvals = [], isLoading } = useFranchiseeApprovals();
  const approveCollaborator = useApproveCollaborator();

  const handleApprove = async (approvalId: string, approve: boolean) => {
    try {
      await approveCollaborator.mutateAsync({ approvalId, approve });
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
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
                onClick={() => handleApprove(approval.id, true)}
                disabled={approveCollaborator.isPending}
                className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                <Check className="h-3 w-3" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(approval.id, false)}
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
  );
};

export default FranchiseeCollaboratorApprovals;