
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus, GraduationCap, Shield, ShieldPlus } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id);

  // Redirect if already authenticated
  if (user) {
    if (checkingAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      );
    }
    return <Navigate to={isAdmin ? '/' : '/aluno'} replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(email, password, fullName, { userType: 'Aluno', unitCode });
    setIsLoading(false);
  };

  const handleAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(email, password, fullName, { userType: 'Admin' });
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Subtle gradient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]">
        <div className="absolute -top-24 -left-24 size-[360px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-[360px] rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 ring-1 ring-primary/15 mb-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Cresci e Perdi</h1>
          <p className="text-muted-foreground">Sistema de Treinamentos</p>
        </div>

        <Card className="border border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-xl ring-1 ring-primary/10 rounded-2xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl text-brand-black">Acesse sua conta</CardTitle>
            <CardDescription className="text-brand-gray-dark">
              Faça login ou crie uma nova conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login-student" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 p-1 rounded-full bg-muted">
                <TabsTrigger 
                  value="login-student" 
                  className="rounded-full flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Login Aluno
                </TabsTrigger>
                <TabsTrigger 
                  value="register-student" 
                  className="rounded-full flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Cadastro Aluno
                </TabsTrigger>
                <TabsTrigger 
                  value="login-admin" 
                  className="rounded-full flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Shield className="h-4 w-4" />
                  Login Admin
                </TabsTrigger>
                <TabsTrigger 
                  value="register-admin" 
                  className="rounded-full flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <ShieldPlus className="h-4 w-4" />
                  Cadastro Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login-student">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-brand-gray-dark font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-brand-gray-dark font-medium">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register-student">
                <form onSubmit={handleStudentSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitCode" className="text-brand-gray-dark font-medium">Código da Unidade</Label>
                    <Input
                      id="unitCode"
                      type="text"
                      placeholder="Ex.: ABC123"
                      value={unitCode}
                      onChange={(e) => setUnitCode(e.target.value)}
                      required
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-brand-gray-dark font-medium">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-brand-gray-dark font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-brand-gray-dark font-medium">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Cadastrando..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login-admin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-admin-login" className="text-brand-gray-dark font-medium">Email</Label>
                    <Input
                      id="email-admin-login"
                      type="email"
                      placeholder="admin@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-admin-login" className="text-brand-gray-dark font-medium">Senha</Label>
                    <Input
                      id="password-admin-login"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar como Admin"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Necessário já ter perfil de admin aprovado.</p>
                </form>
              </TabsContent>

              <TabsContent value="register-admin">
                <form onSubmit={handleAdminSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName-admin" className="text-brand-gray-dark font-medium">Nome Completo</Label>
                    <Input
                      id="fullName-admin"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-admin" className="text-brand-gray-dark font-medium">Email</Label>
                    <Input
                      id="email-admin"
                      type="email"
                      placeholder="admin@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-admin" className="text-brand-gray-dark font-medium">Senha</Label>
                    <Input
                      id="password-admin"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Cadastrando..." : "Criar Conta Admin"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Após criar a conta, peça a um administrador para habilitar seu perfil de admin.</p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-brand-gray-dark">
          Ao continuar, você concorda com nossos termos de uso
        </div>
      </div>
    </div>
  );
};

export default Auth;
