import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SyncPasswordParams {
  user_id: string;
  new_password: string;
}

export const useSyncPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ user_id, new_password }: SyncPasswordParams) => {
      const { data, error } = await supabase.functions.invoke('sync-password', {
        body: { user_id, new_password }
      });

      if (error) {
        throw new Error(`Erro ao sincronizar senha: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao sincronizar senha');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Senha sincronizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao sincronizar senha", {
        description: error.message
      });
    },
  });
};