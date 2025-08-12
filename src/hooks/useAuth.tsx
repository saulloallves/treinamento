
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
            ensureProfile(session.user).catch(() => {/* noop */});
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
          ensureProfile(session.user).catch(() => {/* noop */});
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
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
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
