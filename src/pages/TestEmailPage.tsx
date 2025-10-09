import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, CheckCircle2, XCircle } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { useToast } from "@/hooks/use-toast";

export default function TestEmailPage() {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    setIsSending(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('admin-send-recovery-emails', {
        body: {
          emails: ['carlos@example.com'],
          redirectTo: 'https://cursos.girabot.com.br/auth/callback/recovery'
        }
      });

      if (invokeError) throw invokeError;

      setResult(data);
      
      toast({
        title: "Email enviado!",
        description: `Email de recuperação enviado para carlos@example.com`,
      });
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      toast({
        title: "Erro ao enviar email",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <BaseLayout title="Teste de Email">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Teste de Envio de Email
            </CardTitle>
            <CardDescription>
              Enviar email de recuperação de senha para o usuário Carlos (carlos@example.com)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <strong>URL de Redirect:</strong> https://cursos.girabot.com.br/auth/callback/recovery
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleSendTestEmail} 
              disabled={isSending}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email de Teste
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erro:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Status:</strong> {result.success ? 'Sucesso' : 'Falha'}</p>
                    {result.summary && (
                      <>
                        <p><strong>Total:</strong> {result.summary.total}</p>
                        <p><strong>Enviados:</strong> {result.summary.success}</p>
                        <p><strong>Falharam:</strong> {result.summary.failed}</p>
                      </>
                    )}
                    {result.results?.success?.length > 0 && (
                      <p><strong>Emails enviados:</strong> {result.results.success.join(', ')}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
