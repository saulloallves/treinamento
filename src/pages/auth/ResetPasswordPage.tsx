import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // O token de recuperação de senha do Supabase vem no fragmento da URL
    // após o redirecionamento.
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      setHasToken(true);
    } else {
      setError('Token de recuperação inválido ou ausente. Por favor, solicite um novo link de recuperação de senha.');
    }
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Sucesso!',
        description: 'Sua senha foi redefinida. Você será redirecionado para a página de login.',
      });

      setTimeout(() => {
        navigate('/auth'); // Redireciona para a página de login após o sucesso
      }, 3000);

    } catch (err: any) {
      console.error('Erro ao redefinir a senha:', err);
      setError(err.message || 'Não foi possível redefinir a senha. O link pode ter expirado.');
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível redefinir a senha. O link pode ter expirado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            {hasToken 
              ? 'Digite sua nova senha abaixo. Certifique-se de que seja uma senha forte.'
              : 'Link de recuperação inválido.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasToken ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </form>
          ) : (
            error && <p className="text-center text-red-500">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
