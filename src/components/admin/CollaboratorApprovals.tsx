import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { useCollaborationApprovals } from '@/hooks/useCollaborationApprovals';

// Função para buscar TODOS os colaboradores pendentes (visão de admin)
const fetchAllPendingCollaborators = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('approval_status', 'pendente')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const CollaboratorApprovals = () => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Usando o hook corrigido
  const { approve, isApproving, reject, isRejecting } = useCollaborationApprovals();

  const { data: collaborators, isLoading, isError } = useQuery({
    queryKey: ['allPendingCollaborators'],
    queryFn: fetchAllPendingCollaborators,
  });

  const handleApprove = (collaborator: any) => {
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
          <CardTitle>Aprovações Pendentes de Colaboradores</CardTitle>
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
              <TableHead>Unidade</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collaborators.map((collab) => (
              <TableRow key={collab.id}>
                <TableCell>{collab.name}</TableCell>
                <TableCell>{collab.email}</TableCell>
                <TableCell>{collab.unit_code}</TableCell>
                <TableCell>{collab.position}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleApprove(collab)}
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