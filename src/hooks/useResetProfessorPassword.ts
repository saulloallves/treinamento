import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResetProfessorPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ professorId, newPassword }: { professorId: string; newPassword: string }) => {
      const { data, error } = await supabase.functions.invoke('reset-professor-password', {
        body: { professorId, newPassword }
      });

      if (error) {
        throw new Error(`Erro ao redefinir senha: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao redefinir senha');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Senha alterada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao alterar senha", {
        description: error.message
      });
    },
  });
};