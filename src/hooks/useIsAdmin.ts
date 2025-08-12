import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIsAdmin = (userId?: string) => {
  return useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      if (!userId) return false;

      // Try common argument names to avoid mismatch with SQL function signature
      const argVariants = [
        { uid: userId },
        { user_id: userId },
        { _user: userId },
        { p_user_id: userId },
      ];

      for (const args of argVariants) {
        const { data, error } = await supabase.rpc("is_admin", args as any);
        if (!error && typeof data === "boolean") return data;
      }

      // As a final fallback, assume not admin
      return false;
    },
    enabled: !!userId,
    initialData: false,
    staleTime: 1000 * 30,
  });
};
