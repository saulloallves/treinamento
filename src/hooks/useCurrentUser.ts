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
  unit_codes?: string[]; // Array de códigos para franqueados com múltiplas unidades
  approval_status?: string;
  phone?: string;
  position?: string;
}

export const useCurrentUser = () => {
  const { user } = useAuth();

  return useQuery<CurrentUser | null>({
    queryKey: ["current-user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, user_type, role, unit_code, unit_codes, approval_status, phone, position, active')
        .eq('id', user.id)
        .eq('active', true) // Apenas usuários ativos
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
            unit_codes: authUser.data.user.user_metadata?.unit_codes || null,
            approval_status: 'aprovado' as const,
            phone: authUser.data.user.user_metadata?.phone || null,
            position: authUser.data.user.user_metadata?.position || null,
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