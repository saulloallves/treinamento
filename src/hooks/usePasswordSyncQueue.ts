import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PasswordSyncQueueItem {
  user_id: string;
  new_password: string;
  status: string;
  created_at: string;
  processed_at?: string;
  error_message?: string;
}

export const usePasswordSyncQueue = () => {
  return useQuery({
    queryKey: ["password-sync-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("password_sync_queue")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PasswordSyncQueueItem[];
    },
  });
};

export const useProcessPasswordQueue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Buscar itens pendentes
      const { data: pendingItems, error: fetchError } = await supabase
        .from("password_sync_queue")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      if (!pendingItems || pendingItems.length === 0) {
        return { processed: 0 };
      }

      let processedCount = 0;
      let errors = 0;

      // Processar cada item da fila
      for (const item of pendingItems) {
        try {
          const { data, error } = await supabase.functions.invoke('sync-password', {
            body: { 
              user_id: item.user_id, 
              new_password: item.new_password 
            }
          });

          if (error || !data?.success) {
            throw new Error(data?.error || error?.message || 'Erro desconhecido');
          }

          // Marcar como processado com sucesso
          await supabase
            .from("password_sync_queue")
            .update({ 
              status: "processed", 
              processed_at: new Date().toISOString(),
              error_message: null
            })
            .eq("user_id", item.user_id);

          processedCount++;
        } catch (error) {
          // Marcar como erro
          await supabase
            .from("password_sync_queue")
            .update({ 
              status: "error", 
              processed_at: new Date().toISOString(),
              error_message: (error as Error).message
            })
            .eq("user_id", item.user_id);
          
          errors++;
        }
      }

      return { processed: processedCount, errors };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["password-sync-queue"] });
      if (result.processed > 0) {
        toast.success(`${result.processed} senha(s) sincronizada(s) com sucesso!`);
      }
      if (result.errors > 0) {
        toast.error(`${result.errors} erro(s) ao processar senhas`);
      }
    },
    onError: (error: Error) => {
      toast.error("Erro ao processar fila de senhas", {
        description: error.message
      });
    },
  });
};

export const useClearProcessedQueue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("password_sync_queue")
        .delete()
        .in("status", ["processed", "error"]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["password-sync-queue"] });
      toast.success("Fila de senhas processadas limpa!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao limpar fila", {
        description: error.message
      });
    },
  });
};