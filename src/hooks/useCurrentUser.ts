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
        .single();

      if (error) {
        console.error('Error fetching current user:', error);
        return null;
      }

      return data as CurrentUser;
    },
    enabled: !!user?.id,
  });
};