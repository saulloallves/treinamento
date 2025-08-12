import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIsAdmin = (userId?: string) => {
  return useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      if (!userId) return false;

      // 1) Fast-path by metadata
      const { data: ures } = await supabase.auth.getUser();
      const metaType = (ures?.user?.user_metadata?.user_type as string) || '';
      if (ures?.user?.id === userId && metaType.toLowerCase() === 'admin') {
        return true;
      }

      // 2) RPC using declared signature is_admin(_user uuid)
      const preferred = await supabase.rpc('is_admin', { _user: userId });
      if (!preferred.error && typeof preferred.data === 'boolean') {
        return preferred.data;
      }

      // 3) Try alternative argument names (defensive)
      const argVariants = [
        { uid: userId },
        { user_id: userId },
        { p_user_id: userId },
      ];
      for (const args of argVariants) {
        const { data, error } = await supabase.rpc('is_admin', args as any);
        if (!error && typeof data === 'boolean') return data;
      }

      // 4) Fallback: direct table check (admins can read admin_users via RLS)
      try {
        const { data: rows, error: tblErr } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', userId)
          .eq('active', true)
          .limit(1);
        if (!tblErr && rows && rows.length > 0) return true;
      } catch {}

      return false;
    },
    enabled: !!userId,
    initialData: false,
    staleTime: 1000 * 30,
  });
};
