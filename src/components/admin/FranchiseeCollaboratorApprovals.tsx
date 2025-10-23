import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// Função para buscar colaboradores pendentes
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

// Função para chamar a nova edge function orquestradora
const approveCollaborator = async (collaborator: any) => {
  // Apenas o email é necessário, a função de backend buscará o resto.
  const { error } = await supabase.functions.invoke('update-collaborator-details', {
    body: { email: collaborator.email },
  });

  if (error) {
    throw new Error(`Erro ao aprovar colaborador: ${error.message}`);
  }

  return { success: true };
};


const rejectCollaborator = async (userId: string) => {
    // Lógica para rejeitar (pode ser implementada depois)
    const { error } = await supabase
        .from('users')
        .update({ approval_status: 'rejeitado', active: false })
        .eq('id', userId);
    if (error) throw new Error(error.message);
    return { success: true };
};

export const FranchiseeCollaboratorApprovals = () => {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const unitCodes = currentUser?.unit_codes || [];

  const { data: collaborators, isLoading, isError } = useQuery({
    queryKey: ['pendingCollaborators', unitCodes],
    queryFn: () => fetchPendingCollaborators(unitCodes),
    enabled: unitCodes.length > 0,
  });

  const approvalMutation = useMutation({
    mutationFn: approveCollaborator,
    onSuccess: () => {
      toast.success('Colaborador aprovado com sucesso! O grupo do WhatsApp será criado em breve.');
      queryClient.invalidateQueries({ queryKey: ['pendingCollaborators'] });
    },
    onError: (error) => {
      toast.error(`Falha na aprovação: ${error.message}`);
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  const rejectionMutation = useMutation({
    mutationFn: rejectCollaborator,
    onSuccess: () => {
        toast.success('Colaborador rejeitado.');
        queryClient.invalidateQueries({ queryKey: ['pendingCollaborators'] });
    },
    onError: (error) => {
        toast.error(`Falha ao rejeitar: ${error.message}`);
    },
    onSettled: () => {
        setProcessingId(null);
    },
  });

  const handleApprove = (collaborator: any) => {
    setProcessingId(collaborator.id);
    approvalMutation.mutate(collaborator);
  };

  const handleReject = (userId: string) => {
    setProcessingId(userId);
    rejectionMutation.mutate(userId);
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
                    onClick={() => handleApprove(collab)}
                    disabled={processingId === collab.id}
                  >
                    {processingId === collab.id && approvalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReject(collab.id)}
                    disabled={processingId === collab.id}
                  >
                    {processingId === collab.id && rejectionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4 text-red-500" />}
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