import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../hooks/use-toast';

export function RecoveryPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // O token de acesso vem na URL após o '#'
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // remove o '#'
    const token = params.get('access_token');

    if (token) {
      setAccessToken(token);
    } else {
      setError("Token de recuperação não encontrado. Por favor, solicite um novo link de redefinição de senha.");
      toast({
        title: "Erro",
        description: "Token de recuperação inválido ou ausente.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (!accessToken) {
      setError("Token de acesso inválido. Não é possível redefinir a senha.");
      return;
    }

    setLoading(true);

    // O token já foi verificado pelo Supabase no redirecionamento,
    // agora o usamos para atualizar a senha do usuário logado nesta sessão.
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(`Erro ao atualizar a senha: ${updateError.message}`);
      toast({
        title: "Falha na Redefinição",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Sua senha foi redefinida com sucesso. Você será redirecionado para o login.",
      });
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handlePasswordReset}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || !accessToken}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || !accessToken}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !accessToken}>
                {loading ? 'Atualizando...' : 'Redefinir Senha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
