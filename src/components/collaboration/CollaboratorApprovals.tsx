import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PendingApproval {
  id: string;
  collaborator_id: string;
  unit_code: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
  collaborator_name: string;
  collaborator_email: string;
}

const CollaboratorApprovals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar aprovações pendentes para franqueados
  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ["pending-collaborator-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_approvals')
        .select('*, users(name, email)')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(approval => {
        const user = Array.isArray(approval.users) ? approval.users[0] : approval.users;
        return {
          id: approval.id,
          collaborator_id: approval.collaborator_id,
          unit_code: approval.unit_code,
          status: approval.status,
          created_at: approval.created_at,
          collaborator_name: user?.name || 'Nome não informado',
          collaborator_email: user?.email || 'Email não informado'
        }
      }) || [];
    },
  });

  // Mutation para aprovar/rejeitar colaborador
  const approveCollaboratorMutation = useMutation({
    mutationFn: async ({ approvalId, approve }: { approvalId: string, approve: boolean }) => {
      const { error } = await supabase.rpc('approve_collaborator', {
        _approval_id: approvalId,
        _approve: approve
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pending-collaborator-approvals"] });
      toast({
        title: variables.approve ? "Colaborador aprovado!" : "Colaborador rejeitado!",
        description: variables.approve 
          ? "O colaborador já pode acessar o sistema." 
          : "O colaborador foi rejeitado e não terá acesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao processar aprovação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Aprovações de Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pendingApprovals || pendingApprovals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Aprovações de Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma solicitação de aprovação pendente no momento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Aprovações de Colaboradores
          <Badge variant="secondary" className="ml-2">
            {pendingApprovals.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingApprovals.map((approval) => (
          <Card key={approval.id} className="border-2 border-orange-200 bg-orange-50/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendente
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(approval.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground">
                      {approval.collaborator_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {approval.collaborator_email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Unidade: {approval.unit_code}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(approval.id)}
                    disabled={approveCollaboratorMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(approval.id)}
                    disabled={approveCollaboratorMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default CollaboratorApprovals;