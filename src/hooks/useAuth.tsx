
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, options?: { userType?: 'Aluno' | 'Admin'; unitCode?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer DB work to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            (async () => {
              try {
                await ensureProfile(session.user!);
                await supabase.rpc('ensure_admin_bootstrap');
              } catch {}
            })();
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => {
          (async () => {
            try {
              await ensureProfile(session.user!);
              await supabase.rpc('ensure_admin_bootstrap');
            } catch {}
          })();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ensure a row exists in public.users for this auth user
  const ensureProfile = async (authUser: User) => {
    try {
      const { data: existing, error: existErr } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();
      if (existErr) throw existErr;
      if (existing?.id) return; // already exists

      const meta = authUser.user_metadata || {} as any;
      const unitCode: string | undefined = meta.unit_code;
      let unitId: string | null = null;
      if (unitCode) {
        const { data: unit, error: unitErr } = await supabase
          .from('units')
          .select('id')
          .eq('code', unitCode)
          .maybeSingle();
        if (!unitErr && unit?.id) unitId = unit.id as string;
      }

      const profile = {
        id: authUser.id,
        name: (meta.full_name as string) || (authUser.email as string),
        email: authUser.email,
        user_type: (meta.user_type as string) || 'Aluno',
        unit_id: unitId,
        unit_code: unitCode,
        active: true,
      } as any;

      const { error: insertErr } = await supabase.from('users').insert([profile]);
      if (insertErr) throw insertErr;

      // Se é um cadastro de admin, criar registro na tabela admin_users
      if (meta.user_type === 'Admin') {
        console.log('Creating admin record for:', authUser.email);
        const adminRecord = {
          user_id: authUser.id,
          name: (meta.full_name as string) || (authUser.email as string),
          email: authUser.email,
          role: 'admin',
          status: 'pending',
          active: true,
        };

        const { error: adminErr } = await supabase.from('admin_users').insert([adminRecord]);
        if (adminErr) {
          console.error('Failed to create admin record:', adminErr);
          // Mesmo com erro na criação do admin, não impede o cadastro do usuário
        } else {
          console.log('Admin record created successfully');
        }
      }
    } catch (e) {
      console.warn('ensureProfile failed:', e);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Verificar se é um admin pendente de aprovação
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user?.user?.id) {
          // Verificar usando a função is_admin do banco
          const { data: isAdminApproved } = await supabase.rpc('is_admin', { _user: user.user.id });
          
          // Verificar se tem registro de admin pendente
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('status')
            .eq('user_id', user.user.id)
            .single();

          // Se tem registro de admin mas não foi aprovado, bloquear acesso
          if (adminUser && !isAdminApproved) {
            await supabase.auth.signOut();
            toast({
              title: "Acesso Pendente de Aprovação",
              description: "Seu cadastro de admin está aguardando aprovação por um administrador. Você receberá uma notificação quando for aprovado.",
              variant: "destructive",
            });
            return { error: { message: "Admin pending approval" } };
          }
        }
      } catch (e) {
        console.error('Error checking admin status:', e);
        // Se não conseguir verificar, continua com o login normal
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, options?: { userType?: 'Aluno' | 'Admin'; unitCode?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    const meta: Record<string, any> = {
      full_name: fullName,
    };
    if (options?.userType) meta.user_type = options.userType;
    if (options?.unitCode) meta.unit_code = options.unitCode;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: meta,
      },
    });

    if (error) {
      let errorMessage = error.message;
      let errorTitle = "Erro no cadastro";
      
      // Handle rate limiting errors with better messaging
      if (error.message.includes("For security purposes, you can only request this after")) {
        errorTitle = "Muitas tentativas de cadastro";
        errorMessage = "Por motivos de segurança, aguarde alguns segundos antes de tentar novamente.";
      } else if (error.message.includes("over_email_send_rate_limit")) {
        errorTitle = "Limite de envio de email atingido";
        errorMessage = "Aguarde alguns minutos antes de tentar se cadastrar novamente.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      let successTitle = "Cadastro realizado!";
      let successMessage = "Verifique seu email para confirmar a conta.";
      
      // Mensagem específica para cadastro de admin
      if (options?.userType === 'Admin') {
        successTitle = "Cadastro de Admin realizado!";
        successMessage = "Verifique seu email para confirmar a conta. Após a confirmação, seu acesso será liberado somente após aprovação por um administrador.";
      }

      toast({
        title: successTitle,
        description: successMessage,
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
