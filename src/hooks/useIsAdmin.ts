import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIsAdmin = (userId?: string) => {
  return useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      if (!userId) return false;

      // Usar APENAS a função RPC is_admin que já verifica status = 'approved'
      const { data, error } = await supabase.rpc('is_admin', { _user: userId });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data === true;
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
};
