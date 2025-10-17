import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const TEST_USER_EMAIL = 'carlos.turina@crescieperdi.com.br';
const RECOVERY_REDIRECT_URL = `${window.location.origin}/auth/callback/recovery`;

export function RecoveryEmailTool() {
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingBulk, setLoadingBulk] = useState(false);

  const handleTestDispatch = async () => {
    setLoadingTest(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-send-recovery-emails', {
        body: {
          emails: [TEST_USER_EMAIL],
          redirectTo: RECOVERY_REDIRECT_URL,
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro na Edge Function');
      }

      const result = data || {};
      toast.success('E-mail de teste enviado!', {
        description: `E-mail enviado para ${TEST_USER_EMAIL} com sucesso.`,
      });

    } catch (err: any) {
      console.error('Erro ao enviar e-mail de teste:', err);
      toast.error('Erro no disparo de teste', {
        description: err.message || 'Não foi possível enviar o e-mail de teste.',
      });
    } finally {
      setLoadingTest(false);
    }
  };

  const handleBulkDispatch = async () => {
    const confirmation = window.confirm(
      'Você tem certeza que deseja enviar e-mails de redefinição de senha para TODOS os usuários? Esta ação não pode ser desfeita.'
    );

    if (!confirmation) {
      toast.info('Disparo em massa cancelado.');
      return;
    }

    setLoadingBulk(true);
    
    try {
      // Primeiro, buscar todos os usuários do auth.users
      const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
      }

      if (!authUsers || authUsers.users.length === 0) {
        toast.info('Nenhum usuário encontrado para envio em massa.');
        setLoadingBulk(false);
        return;
      }

      const emails = authUsers.users
        .filter(user => user.email && user.email.includes('@'))
        .map(user => user.email!);

      if (emails.length === 0) {
        toast.info('Nenhum e-mail válido encontrado para envio em massa.');
        setLoadingBulk(false);
        return;
      }

      toast.info(`Iniciando disparo em massa para ${emails.length} usuários...`);

      const { data, error } = await supabase.functions.invoke('admin-send-recovery-emails', {
        body: {
          emails: emails,
          redirectTo: RECOVERY_REDIRECT_URL,
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro na Edge Function');
      }

      const result = data || {};
      const successCount = result.summary?.success || 0;
      const failedCount = result.summary?.failed || 0;

      toast.success('Disparo em massa concluído!', {
        description: `Sucessos: ${successCount}, Falhas: ${failedCount} de ${emails.length} total.`,
      });

    } catch (err: any) {
      console.error('Erro no disparo em massa:', err);
      toast.error('Erro no disparo em massa', {
        description: err.message || 'Não foi possível completar o disparo em massa.',
      });
    } finally {
      setLoadingBulk(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Ferramenta de Disparo de E-mail de Recuperação</CardTitle>
          <CardDescription>
            Use esta página para testar ou disparar em massa os e-mails de redefinição de senha através da Edge Function.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              Esta é uma ferramenta de desenvolvedor. O disparo em massa enviará um e-mail para <strong>todos</strong> os usuários no banco de dados `auth.users`. Use com cuidado.
            </AlertDescription>
          </Alert>

          <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold">Disparo de Teste</h3>
            <p className="text-sm text-muted-foreground">
              Envia um único e-mail de recuperação para o usuário de teste: <strong>{TEST_USER_EMAIL}</strong>.
              O link de redirecionamento será: <code>{RECOVERY_REDIRECT_URL}</code>.
            </p>
            <Button onClick={handleTestDispatch} disabled={loadingTest || loadingBulk}>
              {loadingTest ? 'Enviando Teste...' : 'Enviar E-mail de Teste'}
            </Button>
          </div>

          <div className="p-4 border rounded-lg space-y-4 bg-red-50 dark:bg-red-900/20">
            <h3 className="font-semibold text-red-800 dark:text-red-300">Disparo em Massa (Perigoso)</h3>
            <p className="text-sm text-red-700 dark:text-red-400">
              Busca todos os usuários em `auth.users` e envia um e-mail de recuperação para cada um.
            </p>
            <Button variant="destructive" onClick={handleBulkDispatch} disabled={loadingTest || loadingBulk}>
              {loadingBulk ? 'Disparando em Massa...' : 'Iniciar Disparo em Massa para Todos os Usuários'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
