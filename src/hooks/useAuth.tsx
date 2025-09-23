import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { clearSelectedProfile } from "@/lib/profile";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  // During sign-in we run extra checks; use this to avoid premature redirects
  authProcessing: boolean;
  // Last blocking reason (e.g., pending approval). Null when not blocked
  lastAuthBlocked: string | null;
  signIn: (email: string, password: string, selectedRole?: string) => Promise<{ error: any }>;
  signUp: (
    email: string, 
    password: string, 
    fullName: string, 
    options?: { 
      userType?: 'Aluno' | 'Admin'; 
      unitCode?: string;
      role?: 'Franqueado' | 'Colaborador';
      position?: string;
    }
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Controls auth flow to avoid premature redirects/flicker
  const [authProcessing, setAuthProcessing] = useState(false);
  const [lastAuthBlocked, setLastAuthBlocked] = useState<string | null>(null);
  const [suppressAuthEvents, setSuppressAuthEvents] = useState(false);

  useEffect(() => {
    console.log('Auth - Setting up listeners');
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth - State change:', { event, hasSession: !!session, hasUser: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer DB work to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            (async () => {
              try {
                console.log('Auth - Ensuring profile for user:', session.user!.id);
                await ensureProfile(session.user!);
                await supabase.rpc('ensure_admin_bootstrap');
              } catch (e) {
                console.error('Auth - Error in deferred work:', e);
              }
            })();
          }, 0);
        }
      }
    );

    // Check for existing session
    console.log('Auth - Checking existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Auth - Existing session:', { hasSession: !!session, hasUser: !!session?.user });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => {
          (async () => {
            try {
              console.log('Auth - Ensuring profile for existing user:', session.user!.id);
              await ensureProfile(session.user!);
              await supabase.rpc('ensure_admin_bootstrap');
            } catch (e) {
              console.error('Auth - Error in existing session work:', e);
            }
          })();
        }, 0);
      }
    });

    return () => {
      console.log('Auth - Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Extra resilience: try to rehydrate session on tab focus/visibility (helps after network blips)
  useEffect(() => {
    const hasToken = () => {
      try {
        return !!localStorage.getItem('sb-tctkacgbhqvkqovctrzf-auth-token');
      } catch {
        return false;
      }
    };

    const rehydrate = () => {
      if (!hasToken()) return;
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      }).catch(() => {});
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        rehydrate();
      }
    };

    const onFocus = () => {
      rehydrate();
    };

    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
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
        role: (meta.role as string) || null,
        position: (meta.position as string) || null,
        unit_id: unitId,
        unit_code: unitCode,
        approval_status: (meta.role === 'Colaborador') ? 'pendente' : 'aprovado',
        active: true,
      } as any;

      const { error: insertErr } = await supabase.from('users').insert([profile]);
      if (insertErr) throw insertErr;

      // IMPORTANTE: Vincular automaticamente inscrições existentes com o mesmo email
      if (authUser.email) {
        console.log('Vinculando inscrições existentes para:', authUser.email);
        const { data: linkedEnrollments, error: linkError } = await supabase
          .from('enrollments')
          .update({ user_id: authUser.id })
          .eq('student_email', authUser.email)
          .is('user_id', null)
          .select('id, course_id');

        if (linkError) {
          console.error('Erro ao vincular inscrições:', linkError);
        } else if (linkedEnrollments && linkedEnrollments.length > 0) {
          console.log(`${linkedEnrollments.length} inscrições vinculadas automaticamente`);
          toast.success("Inscrições Vinculadas!", {
            description: `${linkedEnrollments.length} inscrição(ões) existente(s) foi(foram) vinculada(s) à sua conta.`,
          });
        }
      }

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

      // Se for colaborador, enviar notificação para franqueado
      if (meta.role === 'Colaborador' && meta.unit_code) {
        try {
          const { error: notificationError } = await supabase.functions.invoke('notify-franchisee', {
            body: {
              collaboratorId: authUser.id,
              collaboratorName: meta.full_name,
              unitCode: meta.unit_code
            }
          });
          
          if (notificationError) {
            console.error('Error sending franchisee notification:', notificationError);
          } else {
            console.log('Franchisee notification sent successfully');
          }
        } catch (notificationError) {
          console.error('Error sending franchisee notification:', notificationError);
        }
      }
    } catch (e) {
      console.warn('ensureProfile failed:', e);
    }
  };

  const signIn = async (email: string, password: string, selectedRole?: string) => {
    setAuthProcessing(true);
    setLastAuthBlocked(null);
    
    try {
      // Use role-based authentication edge function
      if (selectedRole) {
        console.log('🎯 Using role-based auth:', { email, selectedRole });
        
        const { data: roleAuthData, error: roleAuthError } = await supabase.functions.invoke('role-based-auth', {
          body: { 
            email, 
            password, 
            selectedRole: selectedRole === 'Aluno' ? 'student' : 
                         selectedRole === 'Professor' ? 'teacher' : 'admin'
          }
        });

        if (roleAuthError) {
          console.error('❌ Role-based auth error:', roleAuthError);
          toast.error("Erro no login", {
            description: "Erro interno do sistema. Tente novamente.",
          });
          setAuthProcessing(false);
          return { error: roleAuthError };
        }

        if (roleAuthData?.error) {
          console.error('❌ Role auth failed:', roleAuthData.error);
          if (roleAuthData.error === 'ROLE_NOT_GRANTED') {
            toast.error("Acesso Negado", {
              description: `Você não tem permissão para acessar como ${selectedRole}.`,
            });
          } else {
            toast.error("Erro no login", {
              description: roleAuthData.message || "Credenciais inválidas.",
            });
          }
          setAuthProcessing(false);
          return { error: { message: roleAuthData.error } };
        }

        if (roleAuthData?.success) {
          console.log('✅ Role-based auth successful:', roleAuthData);
          
          // Store role claims in sessionStorage
          const actAs = roleAuthData.actAs;
          const roleName = actAs === 'student' ? 'Aluno' : 
                          actAs === 'teacher' ? 'Professor' : 'Admin';
          
          sessionStorage.setItem('USER_ROLE_CLAIM', actAs);
          sessionStorage.setItem('SELECTED_ROLE_NAME', roleName);
          
          console.log('✅ Role claims stored:', { actAs, roleName });
          
          toast.success("Login realizado com sucesso!", {
            description: `Bem-vindo como ${roleName}!`,
          });
          
          setAuthProcessing(false);
          return { error: null };
        }
      }

      // Fallback to standard auth (for cases without role selection)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Caso especial para o email do Alison - tentar resetar senha automaticamente
        if (error.message === "Invalid login credentials" && email === 'alison.martins@crescieperdi.com.br') {
          try {
            console.log('Tentando resetar senha do Alison automaticamente...');
            const { data: resetResult, error: resetError } = await supabase.functions.invoke('reset-franchisee-password', {
              body: { email }
            });

            if (!resetError && resetResult?.success) {
              console.log('Reset de senha realizado com sucesso, tentando login novamente...');
              
              // Aguardar um momento para garantir que a senha foi atualizada
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Tentar logar novamente com a senha padrão
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password: 'Trocar01',
              });

              if (!retryError && retryData.user) {
                toast.success("Login realizado com sucesso!", {
                  description: "Conta configurada automaticamente. Recomendamos alterar sua senha.",
                });
                setAuthProcessing(false);
                return { error: null };
              } else {
                console.error('Erro no segundo login:', retryError);
              }
            } else {
              console.error('Erro no reset:', resetError || resetResult);
            }
          } catch (resetError) {
            console.error('Erro ao tentar resetar senha automaticamente:', resetError);
          }
        }
        
        // Verificar se é um admin que ainda não foi aprovado
        if (error.message.includes('Email not confirmed')) {
          try {
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('status')
              .eq('email', email)
              .single();
            
            if (adminData?.status === 'pending') {
              toast.error("Aprovação pendente", {
                description: "Seu cadastro de admin está pendente de aprovação. Aguarde a aprovação de um administrador.",
              });
            }
          } catch (adminCheckError) {
            console.error('Error checking admin status:', adminCheckError);
          }
        }
        
        toast.error("Erro no login", {
          description: error.message === "Invalid login credentials" 
            ? "Email ou senha incorretos." 
            : error.message,
        });
      } else if (data.user) {
        // Standard auth success - handle approval checks
        try {
          await ensureProfile(data.user);
        } catch (profileError) {
          console.error('Error ensuring profile:', profileError);
        }

        // Verificar status do usuário (aprovação, ativo, etc.)
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('approval_status, role, active')
            .eq('id', data.user.id)
            .single();
          
          // Verificar se o usuário foi pausado (inactive)
          if (userData && userData.active === false) {
            await supabase.auth.signOut();
            toast.error("Acesso suspenso", {
              description: "Sua conta foi pausada pelo administrador. Entre em contato para mais informações.",
            });
            setLastAuthBlocked('Account suspended');
            setAuthProcessing(false);
            return { error: { message: "Account suspended" } };
          }
          
          if (userData?.role === 'Colaborador' && userData?.approval_status === 'pendente') {
            await supabase.auth.signOut();
            toast.error("Cadastro em análise", {
              description: "Seu cadastro como colaborador está em análise pelo franqueado da unidade. Aguarde a aprovação para acessar o sistema.",
            });
            setLastAuthBlocked('Cadastro em análise');
            setAuthProcessing(false);
            return { error: { message: "Cadastro em análise" } };
          } else if (userData?.role === 'Colaborador' && userData?.approval_status === 'rejeitado') {
            await supabase.auth.signOut();
            toast.error("Acesso negado", {
              description: "Seu cadastro como colaborador foi rejeitado pelo franqueado da unidade.",
            });
            setLastAuthBlocked('Access denied');
            setAuthProcessing(false);
            return { error: { message: "Access denied" } };
          }
        } catch (userCheckError) {
          console.error('Error checking user approval status:', userCheckError);
          
          if (userCheckError.code === 'PGRST116') {
            await supabase.auth.signOut();
            toast.error("Cadastro incompleto", {
              description: "Seu cadastro não foi finalizado corretamente. Entre em contato com o suporte.",
            });
            setLastAuthBlocked('Incomplete registration');
            setAuthProcessing(false);
            return { error: { message: "Incomplete registration" } };
          }
        }

        // Verificar se é um admin pendente de aprovação
        try {
          const { data: isAdminApproved } = await supabase.rpc('is_admin', { _user: data.user.id });
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('status')
            .eq('user_id', data.user.id)
            .single();

          if (adminUser && !isAdminApproved) {
            await supabase.auth.signOut();
            toast.error("Acesso Pendente de Aprovação", {
              description: "Seu cadastro de admin está aguardando aprovação por um administrador. Você receberá uma notificação quando for aprovado.",
            });
            setLastAuthBlocked('Admin pending approval');
            setAuthProcessing(false);
            return { error: { message: "Admin pending approval" } };
          }
        } catch (e) {
          console.error('Error checking admin status:', e);
        }

        // Success without role selection
        toast.success("Login realizado com sucesso!", {
          description: "Bem-vindo de volta!",
        });
        setLastAuthBlocked(null);
      }

      setAuthProcessing(false);
      return { error };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      toast.error("Erro no login", {
        description: "Erro interno do sistema. Tente novamente.",
      });
      setAuthProcessing(false);
      return { error: { message: 'Erro interno do sistema' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, options?: { userType?: 'Aluno' | 'Admin'; unitCode?: string; role?: 'Franqueado' | 'Colaborador'; position?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          user_type: options?.userType || 'Aluno',
          role: options?.role,
          position: options?.position,
          unit_code: options?.unitCode,
        }
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

      toast.error(errorTitle, {
        description: errorMessage,
      });
    } else {
      let successTitle = "Cadastro realizado!";
      let successMessage = "Verifique seu email para confirmar a conta.";
      
      // Mensagem específica para cadastro de admin ou colaborador
      if (options?.userType === 'Admin') {
        successTitle = "Cadastro de Admin realizado!";
        successMessage = "Verifique seu email para confirmar a conta. Após a confirmação, seu acesso será liberado somente após aprovação por um administrador.";
      } else if (options?.role === 'Colaborador') {
        successTitle = "Cadastro realizado!";
        successMessage = "Cadastro criado com sucesso! Aguarde a aprovação do franqueado da sua unidade para acessar o sistema. Você será notificado quando for aprovado.";
      } else if (options?.role === 'Franqueado') {
        successTitle = "Cadastro realizado!"; 
        successMessage = "Cadastro de franqueado criado com sucesso! Você já pode acessar o sistema.";
      }

      toast.success(successTitle, {
        description: successMessage,
      });
    }

    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Logout error (ignored):', error);
    } finally {
      // Always clear local state even if Supabase logout fails
      setSession(null);
      setUser(null);
      clearSelectedProfile();
      
      // Clear role claims from sessionStorage
      try {
        sessionStorage.removeItem('USER_ROLE_CLAIM');
        sessionStorage.removeItem('SELECTED_ROLE_NAME');
        sessionStorage.removeItem('SELECTED_ROLE');
        console.log('✅ Role claims cleared from sessionStorage');
      } catch {}
      
      toast.success("Logout realizado", {
        description: "Até logo!",
      });
      // Force redirect to auth page after logout
      window.location.href = "/auth";
    }
  };

const value = {
  user,
  session,
  loading,
  authProcessing,
  lastAuthBlocked,
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