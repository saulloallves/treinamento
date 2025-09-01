import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnitCollaborationApprovals, useApproveCollaborator } from "@/hooks/useCollaborationApprovals";
import { useAuth } from "@/hooks/useAuth";
import { Users, Clock, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/ui/refresh-button";

interface FranchiseeCollaboratorApprovalsProps {
  unitCode: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const FranchiseeCollaboratorApprovals = ({ unitCode, onRefresh, isRefreshing }: FranchiseeCollaboratorApprovalsProps) => {
  const { data: approvals = [], isLoading } = useUnitCollaborationApprovals(unitCode);
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
            Solicitações pendentes
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
      <CardContent className="space-y-4">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">{approval.collaborator_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {approval.collaborator_email}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Solicitado em {format(new Date(approval.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {approval.collaborator_role}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(approval.id, true)}
                disabled={approveCollaborator.isPending}
                className="flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(approval.id, false)}
                disabled={approveCollaborator.isPending}
                className="flex items-center gap-1"
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