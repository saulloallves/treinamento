import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIsProfessor = (userId?: string) => {
  return useQuery({
    queryKey: ["is-professor", userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', userId)
        .eq('user_type', 'Professor')
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking professor status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!userId,
  });
};