
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, UserPlus, GraduationCap, Shield, Building, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';




const Auth = () => {
  const { user, signIn, signUp, loading, authProcessing } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [userRole, setUserRole] = useState<'Franqueado' | 'Colaborador'>('Colaborador');
  const [position, setPosition] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Redireciona após autenticar: apenas quando checagens terminarem
  useEffect(() => {
    console.log('Auth.tsx - Checking redirect:', { user: !!user, authProcessing, loading });
    if (user && !authProcessing && !loading) {
      console.log('Auth.tsx - Redirecting to /');
      navigate('/', { replace: true });
    }
  }, [user, authProcessing, loading, navigate]);

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
    await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Armazenar preferência do usuário para redirecionamento
    try {
      localStorage.setItem('login_preference', 'Admin');
    } catch {
      // Silent fail
    }
    await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);
  };

  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Armazenar preferência do usuário para redirecionamento
    try {
      localStorage.setItem('login_preference', 'Aluno');
    } catch {
      // Silent fail
    }
    await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);
  };

  const handleProfessorSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Armazenar preferência do usuário para redirecionamento
    try {
      localStorage.setItem('login_preference', 'Professor');
    } catch {
      // Silent fail
    }
    await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);
  };

  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (userRole === 'Colaborador') {
        // Use the new edge function for collaborator registration
        const { data, error } = await supabase.functions.invoke('register-collaborator', {
          body: {
            name: fullName,
            email: email.trim().toLowerCase(),
            password,
            unitCode,
            position
          }
        });

        if (error) {
          throw error;
        }

        if (data?.success) {
          toast.success("Cadastro criado com sucesso!", {
            description: "Cadastro em análise. Aguarde aprovação do franqueado da sua unidade para acessar o sistema.",
          });
          
          // Clear form
          setFullName('');
          setEmail('');
          setPassword('');
          setUnitCode('');
          setPosition('');
        } else {
          throw new Error(data?.error || 'Erro desconhecido');
        }
      } else {
        // Para franqueados, use o fluxo padrão
        await signUp(email, password, fullName, { 
          userType: 'Aluno', 
          unitCode, 
          role: userRole,
          position: undefined
        });
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      toast.error("Erro no cadastro", {
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <CardTitle className="text-2xl text-foreground">Acesse sua conta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Faça login ou crie uma nova conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login-student" className="w-full">
              <TabsList
                aria-label="Seleção de tipo de acesso"
                className="grid grid-cols-2 md:grid-cols-4 w-full gap-3 mb-6 p-2 rounded-2xl bg-muted/50 ring-1 ring-border h-auto"
              >
                <TabsTrigger
                  value="login-student"
                  className="rounded-xl w-full flex flex-col items-center justify-center gap-1 px-3 h-14 text-xs md:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="text-center leading-tight font-medium">Login Aluno</span>
                </TabsTrigger>
                <TabsTrigger
                  value="register-student"
                  className="rounded-xl w-full flex flex-col items-center justify-center gap-1 px-3 h-14 text-xs md:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
                >
                  <Building className="h-5 w-5" />
                  <span className="text-center leading-tight font-medium">Cadastro Aluno</span>
                </TabsTrigger>
                <TabsTrigger
                  value="login-professor"
                  className="rounded-xl w-full flex flex-col items-center justify-center gap-1 px-3 h-14 text-xs md:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-center leading-tight font-medium">Login Professor</span>
                </TabsTrigger>
                <TabsTrigger
                  value="login-admin"
                  className="rounded-xl w-full flex flex-col items-center justify-center gap-1 px-3 h-14 text-xs md:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-center leading-tight font-medium">Login Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login-student">
                <form onSubmit={handleStudentSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
                    <Label htmlFor="userRole" className="text-foreground font-medium">Você é *</Label>
                    <Select value={userRole} onValueChange={(value: 'Franqueado' | 'Colaborador') => setUserRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu papel na unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Franqueado">Franqueado</SelectItem>
                        <SelectItem value="Colaborador">Colaborador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitCode" className="text-foreground font-medium">Código da Unidade *</Label>
                    <Input
                      id="unitCode"
                      type="text"
                      placeholder="Ex.: ABC123"
                      value={unitCode}
                      onChange={(e) => setUnitCode(e.target.value)}
                      required
                    />
                  </div>

                  {userRole === 'Colaborador' && (
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-foreground font-medium">Cargo *</Label>
                      <Select value={position} onValueChange={setPosition} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                          <SelectItem value="Atendente de Loja">Atendente de Loja</SelectItem>
                          <SelectItem value="Mídias Sociais">Mídias Sociais</SelectItem>
                          <SelectItem value="Operador(a) de Caixa">Operador(a) de Caixa</SelectItem>
                          <SelectItem value="Avaliadora">Avaliadora</SelectItem>
                          <SelectItem value="Repositor(a)">Repositor(a)</SelectItem>
                          <SelectItem value="Líder de Loja">Líder de Loja</SelectItem>
                          <SelectItem value="Gerente">Gerente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground font-medium">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {userRole === 'Colaborador' && (
                    <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                      <p className="text-sm text-primary">
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

              <TabsContent value="login-professor">
                <form onSubmit={handleProfessorSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-professor-login" className="text-foreground font-medium">Email</Label>
                    <Input
                      id="email-professor-login"
                      type="email"
                      placeholder="professor@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-professor-login" className="text-foreground font-medium">Senha</Label>
                    <Input
                      id="password-professor-login"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar como Professor"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Necessário já ter perfil de professor aprovado.</p>
                </form>
              </TabsContent>

              <TabsContent value="login-admin">
                <form onSubmit={handleAdminSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-admin-login" className="text-foreground font-medium">Email</Label>
                    <Input
                      id="email-admin-login"
                      type="email"
                      placeholder="admin@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-admin-login" className="text-foreground font-medium">Senha</Label>
                    <Input
                      id="password-admin-login"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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

        <div className="text-center text-sm text-muted-foreground">
          Ao continuar, você concorda com nossos termos de uso
        </div>
      </div>
    </div>
  );
};

export default Auth;
