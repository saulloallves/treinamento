import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Database, Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { useToast } from "@/hooks/use-toast";

interface MigrationResult {
  import: {
    total: number;
    success: any[];
    failed: any[];
    skipped: any[];
  };
  test_email: any;
}

export default function MigrationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('migrate-all-users');

      if (invokeError) throw invokeError;

      setResult(data);
      
      toast({
        title: "Migração concluída!",
        description: `${data.import.success.length} usuários migrados com sucesso.`,
      });
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      toast({
        title: "Erro na migração",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <BaseLayout title="Migração de Usuários">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Migração de Usuários para Novo Projeto
            </CardTitle>
            <CardDescription>
              Importa todos os usuários ativos e envia email de recuperação apenas para o usuário teste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Esta operação irá:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Importar TODOS os usuários ativos sem enviar emails</li>
                  <li>Enviar email de recuperação apenas para: <code className="bg-muted px-1 rounded">carloseduardoturina@gmail.com</code></li>
                  <li>Respeitar rate limits de 5 req/s</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleMigration}
              disabled={isRunning}
              size="lg"
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrando usuários...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Iniciar Migração
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">Resumo da Importação:</p>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold">{result.import.total}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sucesso</p>
                          <p className="text-2xl font-bold text-green-600">{result.import.success.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Falhas</p>
                          <p className="text-2xl font-bold text-red-600">{result.import.failed.length}</p>
                        </div>
                      </div>
                      {result.import.skipped.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {result.import.skipped.length} usuário(s) já existiam e foram pulados
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>

                {result.test_email && (
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold">Email de Teste:</p>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.test_email, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}

                {result.import.failed.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold">Falhas:</p>
                      <div className="mt-2 max-h-40 overflow-auto text-xs">
                        {result.import.failed.map((f: any, i: number) => (
                          <div key={i} className="mb-1">
                            {f.email}: {f.error}
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
