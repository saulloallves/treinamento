
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus, GraduationCap, Shield, ShieldPlus } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(email, password, fullName);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-blue rounded-lg mb-4">
            <GraduationCap className="h-8 w-8 text-brand-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-black mb-2">
            Cresci e Perdi
          </h1>
          <p className="text-brand-gray-dark">
            Sistema de Treinamentos
          </p>
        </div>

        <Card className="bg-brand-white shadow-clean-lg border-gray-200">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl text-brand-black">Acesse sua conta</CardTitle>
            <CardDescription className="text-brand-gray-dark">
              Faça login ou crie uma nova conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login-student" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100">
                <TabsTrigger 
                  value="login-student" 
                  className="flex items-center gap-2 data-[state=active]:bg-brand-white data-[state=active]:text-brand-blue data-[state=active]:shadow-clean"
                >
                  <LogIn className="h-4 w-4" />
                  Login Aluno
                </TabsTrigger>
                <TabsTrigger 
                  value="register-student" 
                  className="flex items-center gap-2 data-[state=active]:bg-brand-white data-[state=active]:text-brand-blue data-[state=active]:shadow-clean"
                >
                  <UserPlus className="h-4 w-4" />
                  Cadastro Aluno
                </TabsTrigger>
                <TabsTrigger 
                  value="login-admin" 
                  className="flex items-center gap-2 data-[state=active]:bg-brand-white data-[state=active]:text-brand-blue data-[state=active]:shadow-clean"
                >
                  <Shield className="h-4 w-4" />
                  Login Admin
                </TabsTrigger>
                <TabsTrigger 
                  value="register-admin" 
                  className="flex items-center gap-2 data-[state=active]:bg-brand-white data-[state=active]:text-brand-blue data-[state=active]:shadow-clean"
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
                <form onSubmit={handleSignUp} className="space-y-4">
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
                <form onSubmit={handleSignUp} className="space-y-4">
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
