import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResetFranchiseePassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data: result, error } = await supabase.functions.invoke('reset-franchisee-password', {
        body: { email }
      });

      if (error) {
        throw new Error(`Erro ao redefinir senha: ${error.message}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro ao redefinir senha');
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success("Senha redefinida com sucesso!", {
        description: "Senha padrão: Trocar01"
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};