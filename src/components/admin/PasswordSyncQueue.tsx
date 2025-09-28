import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trash2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { usePasswordSyncQueue, useProcessPasswordQueue, useClearProcessedQueue } from "@/hooks/usePasswordSyncQueue";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const PasswordSyncQueue = () => {
  const { data: queue, isLoading, refetch } = usePasswordSyncQueue();
  const processQueue = useProcessPasswordQueue();
  const clearQueue = useClearProcessedQueue();

  const pendingCount = queue?.filter(item => item.status === 'pending').length || 0;
  const errorCount = queue?.filter(item => item.status === 'error').length || 0;
  const processedCount = queue?.filter(item => item.status === 'processed').length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'processed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Processado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fila de Sincronização de Senhas</CardTitle>
            <CardDescription>
              Gerenciar senhas que precisam ser sincronizadas com o sistema de autenticação
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            {pendingCount > 0 && (
              <Button
                size="sm"
                onClick={() => processQueue.mutate()}
                disabled={processQueue.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${processQueue.isPending ? 'animate-spin' : ''}`} />
                Processar Fila
              </Button>
            )}
            {(processedCount > 0 || errorCount > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearQueue.mutate()}
                disabled={clearQueue.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Processados
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-yellow-700">Pendentes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{processedCount}</div>
            <div className="text-sm text-green-700">Processados</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-red-700">Erros</div>
          </div>
        </div>

        {/* Lista da fila */}
        {!queue || queue.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum item na fila de sincronização
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((item) => (
              <div
                key={item.user_id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <div className="font-medium">Usuario ID: {item.user_id}</div>
                    <div className="text-sm text-muted-foreground">
                      Nova senha: {item.new_password}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Criado {formatDistanceToNow(new Date(item.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                      {item.processed_at && (
                        <> • Processado {formatDistanceToNow(new Date(item.processed_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(item.status)}
                  {item.status === 'error' && item.error_message && (
                    <div className="text-xs text-red-600 max-w-xs truncate" title={item.error_message}>
                      {item.error_message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};