/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, UserPlus, GraduationCap, Shield, Building, BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoPrincipal from '@/assets/logo-principal.png';

const Auth = () => {
  const { user, signIn, signUp, loading, authProcessing, sendPasswordViaWhatsApp } = useAuth();
  const { setSelectedProfile, clearProfile } = useProfile();
  
  useEffect(() => {
    clearProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [position, setPosition] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cpf, setCpf] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentPhone, setStudentPhone] = useState('');
  const [isSendingPassword, setIsSendingPassword] = useState(false);

  // Novos estados para endereço
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authProcessing && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, authProcessing, loading, navigate]);

  useEffect(() => {
    document.title = 'Login e Cadastro | Sistema de Treinamentos';
  }, []);

  const handleCepLookup = async () => {
    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length !== 8) {
      setCepError('CEP deve conter 8 dígitos.');
      return;
    }

    setIsCepLoading(true);
    setCepError(null);
    try {
      const { data, error } = await supabase.functions.invoke('cep-lookup', {
        body: { cep: cleanedCep },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setEndereco(data.logradouro);
      setBairro(data.bairro);
      setCidade(data.localidade);
      setEstado(data.uf);
      document.getElementById('numero')?.focus();
    } catch (err: any) {
      setCepError(err.message || 'Erro ao buscar CEP.');
      setEndereco('');
      setBairro('');
      setCidade('');
      setEstado('');
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSelectedProfile('Admin');
    await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);
  };

  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSelectedProfile('Aluno');
    const loginIdentifier = studentPhone.trim() || email.trim().toLowerCase();
    await signIn(loginIdentifier, password);
    setIsLoading(false);
  };
  
  const handleSendPassword = async () => {
    if (!studentPhone.trim()) {
      toast.error("Por favor, informe o número de telefone");
      return;
    }
    
    setIsSendingPassword(true);
    await sendPasswordViaWhatsApp(studentPhone);
    setIsSendingPassword(false);
  };

  const handleProfessorSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSelectedProfile('Professor');
    await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);
  };

  // Validação de campos obrigatórios para colaborador
  const isCollaboratorFormValid = () => {
    // Validar campos básicos
    if (!fullName.trim() || !email.trim() || !password.trim() || !unitCode.trim() || 
        !position.trim() || !whatsapp.trim() || !cpf.trim() || !birthDate.trim()) {
      return false;
    }
    
    // Validar campos de endereço
    if (!cep.trim() || !endereco.trim() || !numero.trim() || 
        !bairro.trim() || !cidade.trim() || !estado.trim()) {
      return false;
    }
    
    return true;
  };

  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validação adicional antes de enviar
      if (!isCollaboratorFormValid()) {
        toast.error('Preencha todos os campos obrigatórios', {
          description: 'Verifique se todos os campos marcados com * foram preenchidos, incluindo o endereço completo.'
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('register-collaborator', {
        body: {
          name: fullName,
          email: email.trim().toLowerCase(),
          password,
          unitCode,
          position,
          whatsapp,
          cpf,
          birth_date: birthDate,
          cep,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Cadastro criado com sucesso!", {
          description: "Cadastro em análise. Aguarde aprovação do franqueado da sua unidade para acessar o sistema.",
        });
        
        // Clear form
        setFullName(''); setEmail(''); setPassword(''); setUnitCode(''); setPosition(''); setWhatsapp(''); setCpf('');
        setBirthDate(''); setCep(''); setEndereco(''); setNumero(''); setComplemento(''); setBairro(''); setCidade(''); setEstado('');
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      let errorMessage = error.message || "Ocorreu um erro inesperado. Tente novamente.";
      if (errorMessage.includes('Código(s) de unidade inválido(s)')) {
        errorMessage = "Código de unidade inválido. Por favor, verifique os códigos informados e tente novamente.";
      }
      
      toast.error("Cadastro não aprovado", { description: errorMessage });
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
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]">
        <div className="absolute -top-24 -left-24 size-[360px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-[360px] rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center">
          <img 
            src={logoPrincipal}
            alt="Cresci e Perdi Logo" 
            className="mx-auto mb-4 w-48"
          />
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
                <TabsTrigger value="login-student" className="rounded-xl w-full flex flex-col items-center justify-center gap-1 px-3 h-14 text-xs md:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30">
                  <LogIn className="h-5 w-5" />
                  <span className="text-center leading-tight font-medium">Login Franqueado/Colaborador</span>
                </TabsTrigger>
                <TabsTrigger value="register-student" className="rounded-xl w-full flex flex-col items-center justify-center gap-1 px-3 h-14 text-xs md:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30">
                  <Building className="h-5 w-5" />
                  <span className="text-center leading-tight font-medium">Cadastro Colaborador/Franqueado</span>
                </TabsTrigger>
                <TabsTrigger value="login-professor" className="rounded-xl w-full flex flex-col items-center justify-center gap-1 px-3 h-14 text-xs md:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-center leading-tight font-medium">Login Franquia</span>
                </TabsTrigger>
                <TabsTrigger value="login-admin" className="rounded-xl w-full flex flex-col items-center justify-center gap-1 px-3 h-14 text-xs md:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30">
                  <Shield className="h-5 w-5" />
                  <span className="text-center leading-tight font-medium">Login Suporte</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login-student">
                <form onSubmit={handleStudentSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentPhone" className="text-foreground font-medium">Telefone</Label>
                    <Input id="studentPhone" type="tel" placeholder="(11) 99999-9999" value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
                    <Input id="password" type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isLoading}>{isLoading ? "Entrando..." : "Entrar"}</Button>
                    <Button type="button" variant="outline" onClick={handleSendPassword} disabled={isSendingPassword || !studentPhone.trim()}>{isSendingPassword ? "Enviando..." : "Receber Senha"}</Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register-student">
                <form onSubmit={handleStudentSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitCode" className="text-foreground font-medium">Código da Unidade *</Label>
                    <Input id="unitCode" type="text" placeholder="Ex.: 1724" value={unitCode} onChange={(e) => setUnitCode(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-foreground font-medium">Cargo *</Label>
                    <Select value={position} onValueChange={setPosition} required>
                      <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
                      <SelectContent className="z-[100]"><SelectItem value="Atendente de Loja">Atendente de Loja</SelectItem><SelectItem value="Mídias Sociais">Mídias Sociais</SelectItem><SelectItem value="Operador(a) de Caixa">Operador(a) de Caixa</SelectItem><SelectItem value="Avaliadora">Avaliadora</SelectItem><SelectItem value="Repositor(a)">Repositor(a)</SelectItem><SelectItem value="Líder de Loja">Líder de Loja</SelectItem><SelectItem value="Gerente">Gerente</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-foreground font-medium">WhatsApp *</Label>
                    <Input id="whatsapp" type="tel" placeholder="(11) 99999-9999" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-foreground font-medium">CPF *</Label>
                    <Input id="cpf" type="text" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-foreground font-medium">Data de Nascimento *</Label>
                    <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground font-medium">Nome Completo *</Label>
                    <Input id="fullName" type="text" placeholder="Seu nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email *</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Senha *</Label>
                    <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <div className="flex items-center gap-2">
                      <Input id="cep" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2'))} maxLength={9} onBlur={handleCepLookup} />
                      {isCepLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    {cepError && <p className="text-sm text-destructive">{cepError}</p>}
                  </div>

                  {cidade && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Endereço</Label><Input value={endereco} disabled /></div>
                        <div className="space-y-2"><Label>Bairro</Label><Input value={bairro} disabled /></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Número *</Label><Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Complemento</Label><Input value={complemento} onChange={(e) => setComplemento(e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Cidade</Label><Input value={cidade} disabled /></div>
                        <div className="space-y-2"><Label>Estado</Label><Input value={estado} disabled /></div>
                      </div>
                    </div>
                  )}

                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary"><strong>Atenção:</strong> Seu cadastro ficará pendente até que o franqueado da sua unidade aprove o acesso.</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !isCollaboratorFormValid()}
                  >
                    {isLoading ? "Cadastrando..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login-professor">
                <form onSubmit={handleProfessorSignIn} className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="email-professor-login" className="text-foreground font-medium">Email</Label><Input id="email-professor-login" type="email" placeholder="professor@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="password-professor-login" className="text-foreground font-medium">Senha</Label><Input id="password-professor-login" type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Entrando..." : "Entrar como Professor"}</Button>
                  <p className="text-xs text-muted-foreground text-center">Necessário já ter perfil de professor aprovado.</p>
                </form>
              </TabsContent>

              <TabsContent value="login-admin">
                <form onSubmit={handleAdminSignIn} className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="email-admin-login" className="text-foreground font-medium">Email</Label><Input id="email-admin-login" type="email" placeholder="admin@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="password-admin-login" className="text-foreground font-medium">Senha</Label><Input id="password-admin-login" type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Entrando..." : "Entrar como Admin"}</Button>
                  <p className="text-xs text-muted-foreground text-center">Necessário já ter perfil de admin aprovado.</p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Ao continuar, você concorda com nossos termos de uso
        </div>
        <div className="text-center text-xs text-muted-foreground/80 mt-6">
          &copy; {new Date().getFullYear()} Cresci e Perdi Franchising LTDA
        </div>
      </div>
    </div>
  );
};

export default Auth;