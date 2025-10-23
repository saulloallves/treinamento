import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCollaborationApprovals } from '@/hooks/useCollaborationApprovals';

const fetchPendingCollaborators = async (unitCodes: string[]) => {
  if (!unitCodes || unitCodes.length === 0) return [];

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .in('unit_code', unitCodes)
    .eq('approval_status', 'pendente')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const FranchiseeCollaboratorApprovals = () => {
  const { data: currentUser } = useCurrentUser();
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Hook corrigido, nos dá as funções 'approve' e 'reject' diretamente
  const { approve, isApproving, reject, isRejecting } = useCollaborationApprovals();

  const unitCodes = currentUser?.unit_codes || [];

  const { data: collaborators, isLoading, isError } = useQuery({
    queryKey: ['pendingCollaborators', unitCodes],
    queryFn: () => fetchPendingCollaborators(unitCodes),
    enabled: unitCodes.length > 0,
  });

  // Esta é a função que estava com erro. Agora ela chama 'approve' diretamente.
  const handleFinalizeApproval = (collaborator: any) => {
    setProcessingId(collaborator.id);
    approve({ email: collaborator.email }, {
      onSettled: () => setProcessingId(null),
    });
  };

  const handleReject = (userId: string) => {
    setProcessingId(userId);
    reject(userId, {
      onSettled: () => setProcessingId(null),
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isError) {
    return <div className="text-red-500 p-4">Erro ao carregar as solicitações.</div>;
  }

  if (!collaborators || collaborators.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aprovações Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nenhum colaborador aguardando aprovação no momento.</p>
        </CardContent>
      </Card>
    );
  }

  const isProcessing = isApproving || isRejecting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Colaboradores Aguardando Aprovação</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collaborators.map((collab) => (
              <TableRow key={collab.id}>
                <TableCell>{collab.name}</TableCell>
                <TableCell>{collab.email}</TableCell>
                <TableCell>{collab.position}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{collab.approval_status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFinalizeApproval(collab)}
                    disabled={isProcessing}
                  >
                    {isProcessing && processingId === collab.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReject(collab.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing && processingId === collab.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4 text-red-500" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};