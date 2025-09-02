import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  user_type: string;
  role?: string;
  unit_code?: string;
  approval_status?: string;
  phone?: string;
}

export const useCurrentUser = () => {
  const { user } = useAuth();

  return useQuery<CurrentUser | null>({
    queryKey: ["current-user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, user_type, role, unit_code, approval_status, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current user:', error);
        return null;
      }

      if (!data) {
        // Se não existe na tabela users mas existe no auth, criar o registro
        const authUser = await supabase.auth.getUser();
        if (authUser.data.user) {
          const userData = {
            id: authUser.data.user.id,
            name: authUser.data.user.user_metadata?.full_name || authUser.data.user.email || '',
            email: authUser.data.user.email || '',
            user_type: authUser.data.user.user_metadata?.user_type || 'Aluno',
            role: authUser.data.user.user_metadata?.role || null,
            unit_code: authUser.data.user.user_metadata?.unit_code || null,
            approval_status: 'aprovado' as const,
            phone: authUser.data.user.user_metadata?.phone || null,
          };
          
          const { error: insertError } = await supabase
            .from('users')
            .insert(userData);
            
          if (!insertError) {
            return userData as CurrentUser;
          }
        }
        return null;
      }

      return data as CurrentUser;
    },
    enabled: !!user?.id,
  });
};