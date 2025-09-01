import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, User, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useUnitCollaborationApprovals, 
  useApproveCollaborator 
} from "@/hooks/useCollaborationApprovals";

interface UnitCollaborationApprovalsProps {
  unitCode: string;
}

const UnitCollaborationApprovals = ({ unitCode }: UnitCollaborationApprovalsProps) => {
  const { data: pendingApprovals = [], isLoading } = useUnitCollaborationApprovals(unitCode);
  const approveCollaboratorMutation = useApproveCollaborator();

  const handleApprove = (approvalId: string) => {
    approveCollaboratorMutation.mutate({ approvalId, approve: true });
  };

  const handleReject = (approvalId: string) => {
    approveCollaboratorMutation.mutate({ approvalId, approve: false });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Aprovações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingApprovals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Aprovações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma aprovação pendente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Aprovações Pendentes
          <Badge variant="destructive" className="ml-2">
            {pendingApprovals.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-60 overflow-y-auto">
        {pendingApprovals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  <Clock className="h-3 w-3 mr-1" />
                  Pendente
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(approval.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              
              <div>
                <p className="font-medium text-sm">
                  {approval.collaborator_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {approval.collaborator_email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {approval.collaborator_role || "Colaborador"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApprove(approval.id)}
                disabled={approveCollaboratorMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-auto"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(approval.id)}
                disabled={approveCollaboratorMutation.isPending}
                className="text-xs px-2 py-1 h-auto"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Rejeitar
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UnitCollaborationApprovals;