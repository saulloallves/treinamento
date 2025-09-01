import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFixAlisonLogin = () => {
  return useMutation({
    mutationFn: async () => {
      const { data: result, error } = await supabase.functions.invoke('fix-alison-login');

      if (error) {
        throw new Error(`Erro ao corrigir login: ${error.message}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro ao corrigir login');
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success("Login corrigido com sucesso!", {
        description: `Email: alison.martins@crescieperdi.com.br - Senha: ${data.password}`
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};