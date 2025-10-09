import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlus, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FranchiseeImporter = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [summary, setSummary] = useState({ success: 0, ignored: 0, error: 0, total: 0 });

  const startImport = async () => {
    setIsImporting(true);
    setProgress(0);
    setLogs(["Iniciando importação..."]);
    setSummary({ success: 0, ignored: 0, error: 0, total: 0 });

    let offset = 0;
    const limit = 50;
    let done = false;

    while (!done) {
      try {
        const { data, error } = await supabase.functions.invoke('import-franchisees', {
          body: { offset, limit }
        });

        if (error) throw error;

        if (data.done) {
          done = true;
        } else {
          offset = data.nextOffset;
        }

        setSummary(prev => ({
          ...prev,
          success: prev.success + data.results.filter((r: any) => r.status === 'success').length,
          ignored: prev.ignored + data.results.filter((r: any) => r.status === 'ignored').length,
          error: prev.error + data.results.filter((r: any) => r.status === 'error').length,
          total: data.totalToProcess
        }));

        const newLogs = data.results.map((r: any) => {
          if (r.status === 'success') return `✅ Sucesso: ${r.name} (${r.email})`;
          if (r.status === 'ignored') return `⚠️ Ignorado: ${r.name} (${r.email}) - ${r.reason}`;
          return `❌ Erro: ${r.name} (${r.email}) - ${r.reason}`;
        });
        setLogs(prev => [...prev, ...newLogs]);

        setProgress(Math.round((offset / data.totalToProcess) * 100));

      } catch (err: any) {
        toast.error("Erro crítico na importação", { description: err.message });
        setLogs(prev => [...prev, `❌ Erro crítico: ${err.message}`]);
        done = true;
      }
    }

    toast.success("Importação concluída!");
    setIsImporting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Importar Franqueados da Matriz
        </CardTitle>
        <CardDescription>
          Esta ferramenta buscará todos os franqueados da base de dados da Matriz e os criará como usuários neste sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Use esta ferramenta apenas uma vez para a carga inicial. A sincronização contínua é feita por webhooks.
          </AlertDescription>
        </Alert>

        <Button onClick={startImport} disabled={isImporting} className="w-full">
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importando... ({progress}%)
            </>
          ) : (
            "Iniciar Importação de Franqueados"
          )}
        </Button>

        {summary.total > 0 && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-around">
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                Sucesso: {summary.success}
              </Badge>
              <Badge variant="secondary">
                Ignorados: {summary.ignored}
              </Badge>
              <Badge variant="destructive">
                <XCircle className="h-4 w-4 mr-1" />
                Erros: {summary.error}
              </Badge>
              <Badge variant="outline">
                Total: {summary.total}
              </Badge>
            </div>
            <ScrollArea className="h-64 w-full rounded-md border p-4">
              <div className="space-y-2 text-sm">
                {logs.map((log, index) => (
                  <p key={index}>{log}</p>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FranchiseeImporter;