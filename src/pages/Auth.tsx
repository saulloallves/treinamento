
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, UserPlus, GraduationCap, Shield, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResetFranchiseePassword } from '@/hooks/useResetFranchiseePassword';
import { useFixAlisonLogin } from '@/hooks/useFixAlisonLogin';


const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [userRole, setUserRole] = useState<'Franqueado' | 'Colaborador'>('Colaborador');
  const [position, setPosition] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const resetPassword = useResetFranchiseePassword();
  const fixAlisonLogin = useFixAlisonLogin();

  const handleResetPassword = () => {
    if (email) {
      resetPassword.mutate(email);
    }
  };

  const handleFixAlisonLogin = () => {
    fixAlisonLogin.mutate();
  };

  // Redireciona após autenticar: sempre envia para '/', os guards decidem o destino final
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // SEO: título e descrição da página
  useEffect(() => {
    document.title = 'Login e Cadastro | Sistema de Treinamentos';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Acesse sua conta ou crie um cadastro no sistema de treinamentos Cresci e Perdi.');

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + '/auth');
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(email, password, fullName, { 
      userType: 'Aluno', 
      unitCode, 
      role: userRole,
      position: userRole === 'Colaborador' ? position : undefined
    });
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
              <TabsList
                aria-label="Seleção de tipo de acesso"
                className="flex md:grid md:grid-cols-3 w-full overflow-x-auto gap-2 mb-6 p-1 rounded-full bg-muted"
              >
                <TabsTrigger
                  value="login-student"
                  className="rounded-full flex items-center justify-center gap-1 md:gap-2 shrink-0 whitespace-nowrap px-3 py-2 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Login Aluno
                </TabsTrigger>
                <TabsTrigger
                  value="register-student"
                  className="rounded-full flex items-center justify-center gap-1 md:gap-2 shrink-0 whitespace-nowrap px-3 py-2 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Building className="h-4 w-4" />
                  Cadastro Aluno
                </TabsTrigger>
                <TabsTrigger
                  value="login-admin"
                  className="rounded-full flex items-center justify-center gap-1 md:gap-2 shrink-0 whitespace-nowrap px-3 py-2 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Shield className="h-4 w-4" />
                  Login Admin
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
                  
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full mt-2" 
                    onClick={handleResetPassword}
                    disabled={resetPassword.isPending || !email}
                  >
                    {resetPassword.isPending ? "Redefinindo..." : "Redefinir Senha"}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="destructive"
                    className="w-full mt-2" 
                    onClick={handleFixAlisonLogin}
                    disabled={fixAlisonLogin.isPending}
                  >
                    {fixAlisonLogin.isPending ? "Corrigindo..." : "🚨 CORRIGIR LOGIN ALISON"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register-student">
                <form onSubmit={handleStudentSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userRole" className="text-brand-gray-dark font-medium">Você é *</Label>
                    <Select value={userRole} onValueChange={(value: 'Franqueado' | 'Colaborador') => setUserRole(value)}>
                      <SelectTrigger className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20">
                        <SelectValue placeholder="Selecione seu papel na unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Franqueado">Franqueado</SelectItem>
                        <SelectItem value="Colaborador">Colaborador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitCode" className="text-brand-gray-dark font-medium">Código da Unidade *</Label>
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

                  {userRole === 'Colaborador' && (
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-brand-gray-dark font-medium">Cargo *</Label>
                      <Input
                        id="position"
                        type="text"
                        placeholder="Ex.: Vendedor, Atendente, Gerente"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        required
                        className="border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-brand-gray-dark font-medium">Nome Completo *</Label>
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
                    <Label htmlFor="email" className="text-brand-gray-dark font-medium">Email *</Label>
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
                    <Label htmlFor="password" className="text-brand-gray-dark font-medium">Senha *</Label>
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

                  {userRole === 'Colaborador' && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Atenção:</strong> Como colaborador, seu cadastro ficará pendente até que o franqueado da sua unidade aprove o acesso.
                      </p>
                    </div>
                  )}
                  
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
