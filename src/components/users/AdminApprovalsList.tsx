import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock } from "lucide-react";
import { usePendingAdminApprovals, useApproveAdmin, useRejectAdmin } from "@/hooks/useAdminApprovals";

const AdminApprovalsList = () => {
  const { data: pendingAdmins, isLoading } = usePendingAdminApprovals();
  const approveAdmin = useApproveAdmin();
  const rejectAdmin = useRejectAdmin();

  const handleApprove = (adminId: string) => {
    approveAdmin.mutate(adminId);
  };

  const handleReject = (adminId: string) => {
    rejectAdmin.mutate(adminId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aprovações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!pendingAdmins || pendingAdmins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aprovações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma solicitação de admin pendente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Aprovações Pendentes
          <Badge variant="secondary">{pendingAdmins.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingAdmins.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{admin.name}</h4>
                <Badge variant="outline">Pendente</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{admin.email}</p>
              <p className="text-sm text-muted-foreground">
                Cargo: {admin.role}
              </p>
              <p className="text-xs text-muted-foreground">
                Solicitado em: {new Date(admin.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(admin.id)}
                disabled={approveAdmin.isPending}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(admin.id)}
                disabled={rejectAdmin.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Rejeitar
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdminApprovalsList;