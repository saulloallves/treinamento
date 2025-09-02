import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/ui/refresh-button";

interface ApprovedCollaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  position?: string;
  approved_at?: string;
  created_at: string;
}

interface ApprovedCollaboratorsListProps {
  unitCode: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ApprovedCollaboratorsList = ({ unitCode, onRefresh, isRefreshing }: ApprovedCollaboratorsListProps) => {
  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['approved-collaborators', unitCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, position, approved_at, created_at')
        .eq('unit_code', unitCode)
        .eq('role', 'Colaborador')
        .eq('approval_status', 'aprovado')
        .eq('active', true)
        .order('approved_at', { ascending: false });

      if (error) throw error;
      return data as ApprovedCollaborator[];
    },
    enabled: !!unitCode,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Colaboradores Aprovados
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
          <p>Carregando colaboradores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Colaboradores Aprovados
            <Badge variant="secondary">{collaborators.length}</Badge>
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
        {collaborators.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum colaborador aprovado encontrado.
          </p>
        ) : (
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{collaborator.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {collaborator.email}
                    </p>
                    {collaborator.position && (
                      <p className="text-sm text-muted-foreground">
                        Cargo: {collaborator.position}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {collaborator.approved_at 
                        ? `Aprovado em ${format(new Date(collaborator.approved_at), "dd/MM/yyyy", { locale: ptBR })}`
                        : `Cadastrado em ${format(new Date(collaborator.created_at), "dd/MM/yyyy", { locale: ptBR })}`
                      }
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    ✓ Aprovado
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovedCollaboratorsList;